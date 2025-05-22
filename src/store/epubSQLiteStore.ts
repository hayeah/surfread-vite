import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs"
import { IDBBatchAtomicVFS } from "wa-sqlite/src/examples/IDBBatchAtomicVFS.js"
import * as SQLite from "wa-sqlite"

// const SQLITE_ASSETS_DIR = new URL(
//   "./node_modules/wa-sqlite/dist/", // note the leading "./"
//   import.meta.url,
// ).href

import { Migrator, type Migration, type SQLLikeDB } from "../db/Migrator"
import { BlobStore } from "./blobStore"

export class SQLiteDBWrapper implements SQLLikeDB {
  constructor(
    private readonly sqlite3: ReturnType<typeof SQLite.Factory>,
    private readonly db: number,
  ) {}

  private static toPositional(sql: string): string {
    // convert $1, $2 … → ? so we can use array-binding
    return sql.replace(/\$\d+/g, "?")
  }

  async exec(sql: string): Promise<void> {
    await this.sqlite3.exec(this.db, SQLiteDBWrapper.toPositional(sql))
  }

  async query<R = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<{ rows: R[] }> {
    const rows: R[] = []
    const positional = SQLiteDBWrapper.toPositional(sql)

    for await (const stmt of this.sqlite3.statements(this.db, positional)) {
      if (params.length) {
        // bind_collection accepts either an array (for ? placeholders)
        // or an object (for named placeholders)
        this.sqlite3.bind_collection(stmt, params as unknown[])
      }

      while ((await this.sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        const colCount = this.sqlite3.column_count(stmt)
        const row: Record<string, unknown> = {}

        for (let i = 0; i < colCount; i++) {
          const name = this.sqlite3.column_name(stmt, i)
          row[name] = this.sqlite3.column(stmt, i)
        }
        rows.push(row as R)
      }
    }
    return { rows }
  }

  async transaction<T>(fn: (tx: SQLiteDBWrapper) => Promise<T>): Promise<T> {
    await this.exec("BEGIN")
    try {
      const result = await fn(this)
      await this.exec("COMMIT")
      return result
    } catch (err) {
      await this.exec("ROLLBACK")
      throw err
    }
  }
}

/**
 * Migration definitions for the epub database schema.
 * Includes tables for storing epub books and their reading progress.
 */
const MIGRATIONS: Migration[] = [
  {
    name: "001_create_books_table",
    up: `
CREATE TABLE IF NOT EXISTS books (
  id         INTEGER PRIMARY KEY,             -- add AUTOINCREMENT only if you truly need gap-free ids
  title      TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
    `,
  },
  {
    name: "002_create_reading_progress_table",
    up: `
-- reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id            INTEGER PRIMARY KEY,                 -- implicit auto-increment via rowid
  book_id       INTEGER  NOT NULL,
  session_key   TEXT     NOT NULL DEFAULT '',
  location      TEXT,
  created_at    TEXT     NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT     NOT NULL DEFAULT (datetime('now')),
  UNIQUE (book_id, session_key),
  FOREIGN KEY (book_id) REFERENCES books(id)         -- enable with PRAGMA foreign_keys = ON
);
    `,
  },
]

import wasmUrl from "wa-sqlite/dist/wa-sqlite-async.wasm?url"

/**
 * Store for managing epub books and reading progress using wa-sqlite.
 * Implements a singleton pattern and handles database migrations.
 */
export class EpubSQLiteStore {
  private static instance: EpubSQLiteStore | null = null
  private constructor(
    private db: SQLLikeDB & {
      transaction<T>(fn: (tx: SQLLikeDB) => Promise<T>): Promise<T>
    },
  ) {}

  static async init(): Promise<EpubSQLiteStore> {
    if (this.instance) return this.instance

    // const module = await WebAssembly.instantiateStreaming(fetch(wasmUrl), imports)

    const module = await SQLiteESMFactory({
      locateFile: () => wasmUrl,
    })

    // create the high-level API wrapper
    const sqlite3 = SQLite.Factory(module)

    // build and register the IndexedDB-backed VFS
    const vfs = await IDBBatchAtomicVFS.create("epub-store", module, {
      // lockPolicy: "shared+hint",
    })
    sqlite3.vfs_register(vfs, true) // true ⇒ make it the default FS

    // open (or create) the database via the convenience helper
    const dbHandle = await sqlite3.open_v2("epub.db")
    const db = new SQLiteDBWrapper(sqlite3, dbHandle)

    const store = new EpubSQLiteStore(db)
    const migrator = new Migrator(db)
    await migrator.up(MIGRATIONS)

    this.instance = store
    return store
  }

  public titleToKey(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  async addEpub(title: string, data: ArrayBuffer): Promise<number> {
    const result = await this.db.query<{ id: number }>(
      `INSERT INTO books (title)
       VALUES ($1)
       RETURNING id`,
      [title],
    )
    const id = result.rows[0].id
    await BlobStore.singleton().then((store) => store.put(id.toString(), data))
    return id
  }

  async getEpub(id: number): Promise<EpubBook | null> {
    const result = await this.db.query<Omit<EpubBook, "epub_data">>(
      "SELECT id, title FROM books WHERE id = $1",
      [id],
    )
    const book = result.rows[0]
    if (!book) return null

    const store = await BlobStore.singleton()
    const epub_data = (await store.get(id.toString()))!
    return { ...book, epub_data }
  }

  async getAllEpubs(): Promise<EpubMetadata[]> {
    const result = await this.db.query<EpubMetadata>(
      "SELECT id, title, created_at FROM books ORDER BY created_at DESC",
    )
    return result.rows
  }

  async deleteEpub(id: number): Promise<void> {
    await this.db.transaction(async (tx: SQLLikeDB) => {
      await tx.query("DELETE FROM reading_progress WHERE book_id = $1", [id])
      await tx.query("DELETE FROM books WHERE id = $1", [id])
    })

    const store = await BlobStore.singleton()
    await store.delete(id.toString())
  }

  async setReadingProgress(
    bookId: number,
    location: string,
    sessionKey: string = "",
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO reading_progress (book_id, session_key, location)
       VALUES ($1, $2, $3)
       ON CONFLICT (book_id, session_key)
       DO UPDATE SET location = $3, updated_at = CURRENT_TIMESTAMP`,
      [bookId, sessionKey, location],
    )
  }

  async getReadingProgress(bookId: number, sessionKey: string = ""): Promise<string | null> {
    const result = await this.db.query<{ location: string }>(
      "SELECT location FROM reading_progress WHERE book_id = $1 AND session_key = $2",
      [bookId, sessionKey],
    )
    return result.rows[0]?.location || null
  }
}

export interface EpubBook {
  id: number
  title: string
  epub_data: ArrayBuffer
}

export interface EpubMetadata {
  id: number
  title: string
  created_at: Date
}
