$API_URL = "http://localhost:4000/api"
$timestamp = (Get-Date -UFormat %s).Replace(".","")
$username = "testuser_$timestamp"
$email = "test_$timestamp@example.com"
$password = "password123"

Write-Host "=== PHASE 2 CI/CD MISSION 21 E2E TEST ===`n"

# 1. Register
Write-Host "1. Registering user $username..."
$regBody = @{ username = $username; email = $email; password = $password } | ConvertTo-Json
Invoke-RestMethod -Uri "$API_URL/auth/register" -Method Post -Body $regBody -ContentType "application/json" | Out-Null
Write-Host "User registered: $username`n"

# 2. Login
Write-Host "2. Logging in..."
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.data.token
$userId = $loginRes.data.user.id
Write-Host "Logged in successfully. Token obtained.`n"

$headers = @{
    "Authorization" = "Bearer $token"
}

# 3. Prerequisites
Write-Host "3. Modifying DB to meet prerequisites (Mission 16 completed)..."
# Just fake complete 16
docker exec devops-arena-postgres psql -U devops_arena -d devops_arena -c "INSERT INTO attempts (user_id, mission_id, status, is_first_completion) VALUES ($userId, 16, 'completed', true);" | Out-Null

# 4. Start Mission 21
Write-Host "4. Starting Mission 21 (Jenkins Syntax Error)..."
$startRes = Invoke-RestMethod -Uri "$API_URL/missions/21/start" -Method Post -Headers $headers
Write-Host "Mission started.`n"

# 5. Verify Broken State
Write-Host "5. Waiting for pod to be ready..."
kubectl wait --for=condition=ready pod -l "challenge-id=u${userId}-m21" -n ns-challenges --timeout=30s

$submitBody = @{ answer = "validate"; hints_used = 0 } | ConvertTo-Json
$failRes = Invoke-RestMethod -Uri "$API_URL/missions/21/submit" -Method Post -Headers $headers -Body $submitBody -ContentType "application/json"
Write-Host "Initial validation result (should be False): $($failRes.data.correct)`n"

# 6. Apply Fix (Add '}' to Jenkinsfile)
Write-Host "6. Applying fix (echo '}' >> /workspace/Jenkinsfile)..."
$podName = (kubectl get pods -n ns-challenges -l "challenge-id=u${userId}-m21" -o jsonpath='{.items[0].metadata.name}')
Write-Host "Target Pod: $podName"
kubectl exec -n ns-challenges $podName -- /bin/sh -c "echo '}' >> /workspace/Jenkinsfile"
Write-Host "Fix applied successfully.`n"

# 7. Validate Fix
Write-Host "7. Validating correct solution..."
$successRes = Invoke-RestMethod -Uri "$API_URL/missions/21/submit" -Method Post -Headers $headers -Body $submitBody -ContentType "application/json"
Write-Host "Validation result (should be True): $($successRes.data.correct)"
if ($successRes.data.correct -eq $true) {
    Write-Host "XP Awarded: $($successRes.data.xp)`n"
    Write-Host "=== MISSION 21 E2E TEST PASSED ==="
} else {
    throw "Validation failed even after fix."
}
