interface SQLiteRowResult<T = any> {
  rows: T[]
}
declare module "wa-sqlite" {
  export function open(opts: unknown): Promise<{
    exec(sql: string, params?: unknown[]): Promise<void>
    query<R = any>(sql: string, params?: unknown[]): Promise<SQLiteRowResult<R>>
    transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>
  }>
}
