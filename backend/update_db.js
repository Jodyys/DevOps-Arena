const db = require('./src/db');
async function run() {
  try {
    await db.query(`UPDATE missions SET level_id = 3, description = 'The backend cannot connect to the database in Kubernetes.' WHERE id = 3;`);
    console.log("Updated mission 3 in DB successfully.");
    
    // Add status column to active_challenges
    await db.query(`ALTER TABLE active_challenges ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PROVISIONING';`);
    console.log("Added status column to active_challenges successfully.");
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
