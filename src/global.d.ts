interface SQLiteRowResult<T = unknown> {
  rows: T[]
}
declare module "wa-sqlite" {
  export function open(opts: unknown): Promise<{
    exec(sql: string, params?: unknown[]): Promise<void>
    query<R = unknown>(sql: string, params?: unknown[]): Promise<SQLiteRowResult<R>>
    transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>
  }>
}
