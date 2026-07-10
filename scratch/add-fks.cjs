const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_IkK4XACPgQa7@ep-soft-wave-aidiaykq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const client = await pool.connect();
  const fks = [
    `ALTER TABLE "account" ADD CONSTRAINT "account_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade`,
    `ALTER TABLE "session" ADD CONSTRAINT "session_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade`,
  ];
  for (const sql of fks) {
    try {
      await client.query(sql);
      console.log("OK:", sql.substring(0, 80));
    } catch (e) {
      if (e.code === "42710") {
        console.log("EXISTS:", sql.substring(0, 80));
      } else {
        console.log("ERR:", e.message);
      }
    }
  }
  console.log("Done");
  client.release();
  await pool.end();
})();
