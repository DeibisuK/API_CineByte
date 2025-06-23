import pg, { Result } from 'pg';

export const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "cineBD",
    password: "root",
    port: 5432,
})