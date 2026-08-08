# Apply RBAC
kubectl apply -f k8s/jenkins-rbac.yaml

# Wait for SA
Start-Sleep -Seconds 2

# Create token for jenkins-deployer SA
$TOKEN = kubectl create token jenkins-deployer -n ns-devops-arena --duration=8760h
if (-not $TOKEN) {
    Write-Error "Failed to get token"
    exit 1
}

# Get CA Cert from a pod or cluster info (Since it's local kind, we can skip TLS verify or get the CA). We'll use insecure-skip-tls-verify for simplicity in this local DooD setup, but document it.
# Build Jenkins image
docker build -t custom-jenkins:lts -f Dockerfile.jenkins .

# Remove existing jenkins container if any
docker rm -f devops-arena-jenkins 2>$null

# Run Jenkins container
# Mount docker.sock
# Mount jenkins_home
# Set KUBECONFIG env var and inject token

# Create a local kubeconfig file to mount
$KubeconfigContent = @"
apiVersion: v1
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://desktop-control-plane:6443
  name: kind-cluster
contexts:
- context:
    cluster: kind-cluster
    namespace: ns-devops-arena
    user: jenkins-deployer
  name: jenkins-context
current-context: jenkins-context
kind: Config
preferences: {}
users:
- name: jenkins-deployer
  user:
    token: $TOKEN
"@

$KubeconfigContent | Out-File -FilePath .\jenkins-kubeconfig.yaml -Encoding ASCII

# Ensure jenkins_home volume exists
docker volume create jenkins_home

# Start Jenkins
docker run -d --name devops-arena-jenkins `
  --network kind `
  -p 8080:8080 -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  -v ${PWD}\jenkins-kubeconfig.yaml:/root/.kube/config `
  custom-jenkins:lts

Write-Host "Jenkins is starting. It may take a minute."
Write-Host "To get the initial admin password, run: docker exec devops-arena-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
