const util = require('util');
const exec = util.promisify(require('child_process').exec);

const API_URL = 'http://127.0.0.1:4000/api';

async function fetchApi(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_URL}${url}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

async function runTest() {
  console.log("=== PHASE 2 MISSION 11 E2E TEST ===");

  const userSuffix = Date.now();
  const username = `testuser_${userSuffix}`;
  const email = `testuser_${userSuffix}@example.com`;
  const password = "password123";

  let token = null;
  let userId = null;

  try {
    // 1. Dynamic User Registration
    console.log(`\n1. Registering user ${username}...`);
    const regRes = await fetchApi(`/auth/register`, { method: 'POST', body: { username, email, password } });
    console.log(`User registered: ${regRes.data.username}`);

    console.log(`\n2. Logging in...`);
    const loginRes = await fetchApi(`/auth/login`, { method: 'POST', body: { email, password } });
    token = loginRes.data.token;
    userId = loginRes.data.user.id;
    console.log(`Logged in successfully. Token obtained.`);

    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log(`\n3. Modifying DB to meet prerequisites (Mission 10 completed)...`);
    await exec(`docker exec devops-arena-postgres psql -U devops_arena -d devops_arena -c "INSERT INTO attempts (user_id, mission_id, status, score) VALUES (${userId}, 10, 'completed', 500);"`);
    
    // 4. Start Mission 11
    console.log(`\n4. Starting Mission 11 (Linux File Permissions)...`);
    const startRes = await fetchApi(`/missions/11/start`, { method: 'POST', headers: authHeaders });
    console.log(`Mission started. Challenge ID should be created.`);

    // 5. Verify Broken State
    console.log(`\n5. Verifying initial broken state (script should not be executable)...`);
    await new Promise(r => setTimeout(r, 5000)); // wait for pod to start
    
    // Validate from API (should fail)
    const failRes = await fetchApi(`/missions/11/submit`, { method: 'POST', headers: authHeaders, body: { answer: 'validate', hints_used: 0 } });
    console.log(`Initial validation result (should be false):`, failRes.data.correct);
    if (failRes.data.correct === true) throw new Error("Mission should have failed!");

    // 6. Apply Fix
    console.log(`\n6. Applying fix (chmod +x /app/script.sh)...`);
    const { stdout: podsOut } = await exec(`kubectl get pods -n ns-challenges -l challenge-id=u${userId}-m11 -o jsonpath='{.items[0].metadata.name}'`);
    const podName = podsOut.trim();
    console.log(`Target Pod: ${podName}`);
    
    await exec(`kubectl exec -n ns-challenges ${podName} -- chmod +x /app/script.sh`);
    console.log(`Fix applied successfully.`);

    // 7. Verify Validation Succeeds
    console.log(`\n7. Validating correct solution...`);
    const successRes = await fetchApi(`/missions/11/submit`, { method: 'POST', headers: authHeaders, body: { answer: 'validate', hints_used: 0 } });
    console.log(`Validation result (should be true):`, successRes.data.correct);
    
    if (successRes.data.correct !== true) {
        throw new Error("Validation failed even after fix.");
    }
    console.log(`XP Awarded: ${successRes.data.xp}`);

    console.log(`\n=== MISSION 11 E2E TEST PASSED ===`);

  } catch (err) {
    console.error("\n!!! TEST FAILED !!!");
    console.error(err.message || err);
    process.exit(1);
  }
}

runTest();
