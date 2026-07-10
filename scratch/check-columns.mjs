import { Pool } from "../lib/db.ts";

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_IkK4XACPgQa7@ep-soft-wave-aidiaykq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

const client = await pool.connect();
const res = await client.query(
  "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('account', 'session') ORDER BY table_name, ordinal_position"
);
console.log(JSON.stringify(res.rows, null, 2));
client.release();
await pool.end();
