import pg from 'pg';

export const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "CineBD",
    password: "root",
    port: 5432,
})