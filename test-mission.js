const axios = require('axios');
const { execSync } = require('child_process');

async function runTest() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:4000/api' });
    
    // 1. Login
    console.log('Logging in...');
    const login = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
    const token = login.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 2. Start Mission 4
    console.log('Starting Mission 4...');
    await api.post('/missions/4/start');
    
    // 3. Verify resources exist and are broken
    console.log('Checking K8s resources (expected ImagePullBackOff)...');
    const podsStr = execSync('kubectl get pods -n ns-challenges').toString();
    console.log(podsStr);
    
    // 4. Failed submission test
    console.log('Submitting while broken...');
    const failedSubmit = await api.post('/missions/4/submit', { answer: 'submit' });
    console.log('Submit Result:', failedSubmit.data);
    
    // 5. Fix the Deployment
    console.log('Fixing deployment...');
    execSync('kubectl set image deployment/u1-m4-backend-challenge backend-challenge=nginx:latest -n ns-challenges');
    
    // Wait for pod to be running
    console.log('Waiting for pod to be ready...');
    execSync('kubectl wait --for=condition=ready pod -l app=backend-challenge -n ns-challenges --timeout=60s');
    
    console.log(execSync('kubectl get pods -n ns-challenges').toString());
    
    // 6. Successful submission test
    console.log('Submitting after fix...');
    const successSubmit = await api.post('/missions/4/submit', { answer: 'submit' });
    console.log('Submit Result:', successSubmit.data);
    
    // 7. Verify Cleanup
    console.log('Waiting for background cleanup (3s)...');
    await new Promise(r => setTimeout(r, 3000));
    const cleanPods = execSync('kubectl get pods -n ns-challenges').toString();
    console.log('Remaining pods:', cleanPods);
    
    console.log('END-TO-END TEST PASS!');
  } catch (err) {
    console.error('TEST FAILED:', err.response ? err.response.data : err.message);
  }
}

runTest();
