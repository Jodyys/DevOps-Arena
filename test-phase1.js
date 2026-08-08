const fs = require('fs');
const { execSync } = require('child_process');

const API_URL = 'http://localhost:4000/api';
let token = '';

async function request(path, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${path}`, options);
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse JSON: ${text}`);
    }
    if (!res.ok) throw new Error(data.message || `API Error: ${res.status}`);
    return data.data;
}

async function runTests() {
    console.log("=== DEVOP ARENA PHASE 1 E2E TEST REPORT ===\n");

    // 1. Register & Login
        const testUser = `testuser${Date.now()}`;
        const testEmail = `${testUser}@example.com`;
        const testPass = 'password123';
        
        console.log(`Registering test user: ${testUser}`);
        await request('/auth/register', 'POST', { username: testUser, email: testEmail, password: testPass });
        
        console.log(`Logging in...`);
        const loginData = await request('/auth/login', 'POST', { email: testEmail, password: testPass });
        token = loginData.token;
        console.log("✅ Logged in successfully.\n");

    if (!token) throw new Error("Could not log in");
    
    // Get profile initially
    let profile = await request('/auth/me');
    let initialXp = profile.total_xp;
    const userId = profile.id;
    console.log(`User: ${profile.username}, Initial XP: ${initialXp}\n`);

    // --- MISSION 10: Fix Dockerfile ---
    console.log("--- Testing Mission 10 (Fix Dockerfile) ---");
    const m10Start = await request('/missions/10/start', 'POST');
    console.log(`Started Mission 10. Attempt ID: ${m10Start.id}`);
    
    // Submit wrong answer
    try {
        const m10Fail = await request('/missions/10/submit', 'POST', { answer: 'npm run start' });
        console.log(`Wrong answer validation: ${m10Fail.correct ? 'FAIL' : 'PASS'} (Correct=${m10Fail.correct})`);
    } catch (e) {
        console.log(`Wrong answer error (expected): ${e.message}`);
    }

    // Submit correct answer
    const m10Pass = await request('/missions/10/submit', 'POST', { answer: 'CMD ["npm", "start"]' });
    console.log(`Correct answer validation: ${m10Pass.correct ? 'PASS' : 'FAIL'}`);
    console.log(`XP Awarded: ${m10Pass.xp}`);
    
    // Replay M10
    const m10ReplayStart = await request('/missions/10/replay', 'POST');
    console.log(`Started Mission 10 Replay. Attempt ID: ${m10ReplayStart.id}`);
    const m10ReplayPass = await request('/missions/10/submit', 'POST', { answer: 'CMD ["npm", "start"]' });
    console.log(`Replay XP Awarded: ${m10ReplayPass.xp} (Expected 0)`);
    console.log("\n");


    // --- MISSION 15: Fix Kubernetes Service ---
    console.log("--- Testing Mission 15 (Fix Kubernetes Service) ---");
    const m15Start = await request('/missions/15/start', 'POST');
    console.log(`Started Mission 15. Attempt ID: ${m15Start.id}`);
    
    // Check initial state
    console.log("Initial state of ns-challenges:");
    console.log(execSync('kubectl get all -n ns-challenges').toString());
    
    // Submit before fixing
    const m15Fail = await request('/missions/15/submit', 'POST', { answer: 'validate' });
    console.log(`Submit before fix: ${m15Fail.correct ? 'FAIL' : 'PASS'} (Correct=${m15Fail.correct})`);

    // Fix the service
    console.log("Applying fix to service...");
    const svcName = `frontend-service-u${userId}-m15`;
    execSync(`kubectl patch svc ${svcName} -n ns-challenges -p '{"spec":{"selector":{"app":"frontend-challenge"}}}'`);
    
    // Wait a sec for endpoints
    await new Promise(r => setTimeout(r, 2000));
    console.log("Endpoints after fix:");
    console.log(execSync('kubectl get endpoints -n ns-challenges').toString());

    // Submit after fix
    const m15Pass = await request('/missions/15/submit', 'POST', { answer: 'validate' });
    console.log(`Submit after fix: ${m15Pass.correct ? 'PASS' : 'FAIL'}`);
    console.log(`XP Awarded: ${m15Pass.xp}`);
    
    // Check cleanup
    console.log("State after cleanup:");
    console.log(execSync('kubectl get all -n ns-challenges').toString());
    console.log("\n");


    // --- MISSION 18: ImagePullBackOff ---
    console.log("--- Testing Mission 18 (ImagePullBackOff) ---");
    const m18Start = await request('/missions/18/start', 'POST');
    console.log(`Started Mission 18. Attempt ID: ${m18Start.id}`);
    
    // Wait for ImagePullBackOff (takes a few seconds)
    console.log("Waiting 5 seconds for ImagePullBackOff...");
    await new Promise(r => setTimeout(r, 5000));
    console.log("Initial state of ns-challenges:");
    console.log(execSync('kubectl get pods -n ns-challenges').toString());

    // Submit before fixing
    const m18Fail = await request('/missions/18/submit', 'POST', { answer: 'validate' });
    console.log(`Submit before fix: ${m18Fail.correct ? 'FAIL' : 'PASS'} (Correct=${m18Fail.correct})`);

    // Fix the deployment
    console.log("Applying fix to deployment...");
    const deployName = `image-pull-challenge-u${userId}-m18`;
    execSync(`kubectl set image deployment/${deployName} app=nginx:alpine -n ns-challenges`);
    
    // Wait for Pod to run
    console.log("Waiting 10 seconds for Pod to run...");
    await new Promise(r => setTimeout(r, 10000));
    console.log("State after fix:");
    console.log(execSync('kubectl get pods -n ns-challenges').toString());

    // Submit after fix
    const m18Pass = await request('/missions/18/submit', 'POST', { answer: 'validate' });
    console.log(`Submit after fix: ${m18Pass.correct ? 'PASS' : 'FAIL'}`);
    console.log(`XP Awarded: ${m18Pass.xp}`);
    
    // Check cleanup
    console.log("State after cleanup:");
    console.log(execSync('kubectl get all -n ns-challenges').toString());
    console.log("\n");


    // --- RBAC REGRESSION ---
    console.log("--- Testing RBAC Regression ---");
    try {
        const canI = execSync('kubectl auth can-i create pods -n ns-challenges --as system:serviceaccount:ns-challenges:devops-arena-backend').toString().trim();
        console.log(`Can backend create pods directly? ${canI} (Expected: no)`);
    } catch (e) {
        console.log(`Can backend create pods directly? ${e.stdout?.toString().trim() || e.message}`);
    }

    console.log("=== TESTS COMPLETE ===");
}

runTests().catch(console.error);
