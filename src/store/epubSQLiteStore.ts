import initSqlite, { open, IDBBatchAtomicVFS } from "wa-sqlite"
import { Migrator, type Migration, type SQLLikeDB } from "../db/Migrator"
import { BlobStore } from "./blobStore"

/**
 * Migration definitions for the epub database schema.
 * Includes tables for storing epub books and their reading progress.
 */
const MIGRATIONS: Migration[] = [
  {
    name: "001_create_books_table",
    up: `
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: "002_create_reading_progress_table",
    up: `
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        book_id INT NOT NULL REFERENCES books(id),
        session_key TEXT NOT NULL DEFAULT '',
        location TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (book_id, session_key)
      );
    `,
  },
]

/**
 * Store for managing epub books and reading progress using wa-sqlite.
 * Implements a singleton pattern and handles database migrations.
 */
export class EpubSQLiteStore {
  private static instance: EpubSQLiteStore | null = null
  private constructor(private db: SQLLikeDB & { transaction: any }) {}

  static async init(): Promise<EpubSQLiteStore> {
    if (this.instance) return this.instance

    const sqlite = await initSqlite()
    const vfsName = "idb-batch"
    sqlite.registerVfs(new IDBBatchAtomicVFS(vfsName))
    const db = await open({ filename: "idb://epub.db", vfs: vfsName, flags: "c" })

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
