
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    idleTimeoutMillis: 300
});

await pool.connect();


const result = await pool.query('select now()').then(
  res => console.log('Connected to the db'+res.rows[0].now)
);

export {pool}