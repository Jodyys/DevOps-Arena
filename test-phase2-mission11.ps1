$ErrorActionPreference = "Stop"

$API_URL = "http://localhost:4000/api"
$USER_SUFFIX = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
$USERNAME = "testuser_$USER_SUFFIX"
$EMAIL = "testuser_$USER_SUFFIX@example.com"
$PASSWORD = "password123"

Write-Host "=== PHASE 2 MISSION 11 E2E TEST ==="

try {
    # 1. Registration
    Write-Host "`n1. Registering user $USERNAME..."
    $regBody = @{ username = $USERNAME; email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
    $regRes = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "User registered: $($regRes.data.username)"

    # 2. Login
    Write-Host "`n2. Logging in..."
    $loginBody = @{ email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.token
    $userId = $loginRes.data.user.id
    Write-Host "Logged in successfully. Token obtained."

    $headers = @{ Authorization = "Bearer $token" }

    # 3. Prerequisites
    Write-Host "`n3. Modifying DB to meet prerequisites (Mission 10 completed)..."
    $dbCmd = "INSERT INTO attempts (user_id, mission_id, status, score) VALUES ($userId, 10, 'completed', 500);"
    docker exec devops-arena-postgres psql -U devops_arena -d devops_arena -c $dbCmd

    # 4. Start Mission 11
    Write-Host "`n4. Starting Mission 11 (Linux File Permissions)..."
    $startRes = Invoke-RestMethod -Uri "$API_URL/missions/11/start" -Method Post -Headers $headers
    Write-Host "Mission started."

    # 5. Verify Broken State
    Write-Host "`n5. Waiting for pod to be ready..."
    kubectl wait --for=condition=ready pod -l "challenge-id=u${userId}-m11" -n ns-challenges --timeout=30s
    
    $submitBody = @{ answer = "validate"; hints_used = 0 } | ConvertTo-Json
    $failRes = Invoke-RestMethod -Uri "$API_URL/missions/11/submit" -Method Post -Headers $headers -Body $submitBody -ContentType "application/json"
    Write-Host "Initial validation result (should be False): $($failRes.data.correct)"
    if ($failRes.data.correct -eq $true) { throw "Mission should have failed!" }

    # 6. Apply Fix
    Write-Host "`n6. Applying fix (chmod +x /app/script.sh)..."
    $podName = (kubectl get pods -n ns-challenges -l "challenge-id=u${userId}-m11" -o jsonpath="{.items[0].metadata.name}").Trim()
    Write-Host "Target Pod: $podName"
    kubectl exec -n ns-challenges $podName -- chmod +x /app/script.sh
    Write-Host "Fix applied successfully."

    # 7. Verify Validation Succeeds
    Write-Host "`n7. Validating correct solution..."
    $successRes = Invoke-RestMethod -Uri "$API_URL/missions/11/submit" -Method Post -Headers $headers -Body $submitBody -ContentType "application/json"
    Write-Host "Validation result (should be True): $($successRes.data.correct)"
    
    if ($successRes.data.correct -ne $true) {
        throw "Validation failed even after fix."
    }
    Write-Host "XP Awarded: $($successRes.data.xp)"

    Write-Host "`n=== MISSION 11 E2E TEST PASSED ==="
} catch {
    Write-Host "`n!!! TEST FAILED !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    exit 1
}
