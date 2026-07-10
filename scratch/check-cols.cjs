const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_IkK4XACPgQa7@ep-soft-wave-aidiaykq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const client = await pool.connect();
  const res = await client.query(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_name = ANY($1) ORDER BY table_name, ordinal_position",
    [["account", "session"]]
  );
  console.log(JSON.stringify(res.rows, null, 2));
  client.release();
  await pool.end();
})();
