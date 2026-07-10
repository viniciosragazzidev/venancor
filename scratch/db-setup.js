const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_IkK4XACPgQa7@ep-soft-wave-aidiaykq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Connected!");

    // 1. Add role column to user table if it doesn't exist
    console.log("Adding role column to user table if not exists...");
    await client.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'CORRETOR'
    `);
    console.log("role column added or verified!");

    // 2. Create leads table if it doesn't exist
    console.log("Creating leads table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        perfil VARCHAR(100),
        idades VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Aguardando',
        "corretorId" TEXT REFERENCES "user"(id) ON DELETE SET NULL
      )
    `);
    console.log("leads table created or verified!");

    // 3. Add UTM tracking columns to leads table
    console.log("Adding UTM tracking columns to leads table...");
    await client.query(`
      ALTER TABLE leads
        ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_medium   VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255)
    `);
    console.log("UTM columns added or verified!");

    // 4. Let's see what users are in the table
    const usersRes = await client.query('SELECT id, name, email, role FROM "user"');
    console.log("\nUsers currently in database:", usersRes.rows);

    // If there are no users, or if we want to ensure we have an admin and a corretor,
    // let's print how to register them, or we can update the role of existing users if any.
    // Let's check if there are users with specific emails to set as admin or corretor.
    // For example, if there is a user, we can make one of them ADMIN.
    if (usersRes.rows.length > 0) {
      // Let's set the first user as ADMIN just for testing, or we can look for specific emails.
      console.log("Setting first user to ADMIN for testing...");
      await client.query(`
        UPDATE "user" 
        SET role = 'ADMIN' 
        WHERE id = $1
      `, [usersRes.rows[0].id]);
      console.log(`User ${usersRes.rows[0].email} is now ADMIN.`);
    }

    // 5. Let's seed some mock leads if the table is empty
    const leadsCountRes = await client.query('SELECT COUNT(*) FROM leads');
    const leadsCount = parseInt(leadsCountRes.rows[0].count);
    console.log(`Current leads count: ${leadsCount}`);

    if (leadsCount === 0) {
      console.log("Seeding mock leads...");
      const mockLeads = [
        { nome: 'Alessandra Mendonça', whatsapp: '5521999998888', perfil: 'Individual - Amep', idades: '32 anos', status: 'Aguardando' },
        { nome: 'Carlos Eduardo Silva', whatsapp: '5521988887777', perfil: 'Familiar - Unimed', idades: '45, 42 e 12 anos', status: 'Aguardando' },
        { nome: 'Juliana Paes Coimbra', whatsapp: '5521977776666', perfil: 'PME - Leve Saúde', idades: '28 e 30 anos', status: 'Aguardando' },
        { nome: 'Roberto Albuquerque', whatsapp: '5521966665555', perfil: 'Individual - Assim', idades: '61 anos', status: 'Aguardando' },
        { nome: 'Mariana Costa Ferreira', whatsapp: '5521955554444', perfil: 'Familiar - Amil', idades: '35, 8 anos', status: 'Atendimento', corretorId: usersRes.rows[0]?.id || null },
        { nome: 'Geraldo Magela Souza', whatsapp: '5521944443333', perfil: 'PME - SulAmérica', idades: '50, 48, 25, 22 anos', status: 'Atendimento', corretorId: usersRes.rows[0]?.id || null }
      ];

      for (const lead of mockLeads) {
        await client.query(`
          INSERT INTO leads (nome, whatsapp, perfil, idades, status, "corretorId")
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [lead.nome, lead.whatsapp, lead.perfil, lead.idades, lead.status, lead.corretorId]);
      }
      console.log("Mock leads seeded!");
    }

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
