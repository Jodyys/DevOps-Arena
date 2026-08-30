const k8s = require('@kubernetes/client-node');

const validateDeployment = async (k8sAppApi, namespace, labelSelector) => {
  const deps = await k8sAppApi.listNamespacedDeployment(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const dep = deps.body.items[0];
  if (dep && dep.status && dep.status.readyReplicas === dep.spec.replicas) {
    return true;
  }
  return false;
};

const validateService = async (k8sApi, namespace, labelSelector, expectedPort) => {
  const endpoints = await k8sApi.listNamespacedEndpoints(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const serviceEndpoint = endpoints.body.items[0];
  
  if (serviceEndpoint && serviceEndpoint.subsets && serviceEndpoint.subsets.length > 0) {
    const addresses = serviceEndpoint.subsets[0].addresses;
    if (addresses && addresses.length > 0) {
      if (expectedPort) {
         const ports = serviceEndpoint.subsets[0].ports;
         if (ports && ports.some(p => p.port === expectedPort)) return true;
         return false;
      }
      return true;
    }
  }
  return false;
};

const validateIngress = async (k8sNetworkingApi, namespace, labelSelector, expectedPort) => {
  const ingresses = await k8sNetworkingApi.listNamespacedIngress(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const ingress = ingresses.body.items[0];
  
  if (ingress && ingress.spec.rules && ingress.spec.rules.length > 0) {
    const paths = ingress.spec.rules[0].http.paths;
    if (paths && paths.length > 0) {
      const port = paths[0].backend.service.port.number;
      if (port === expectedPort) return true;
    }
  }
  return false;
};

const validatePodRunning = async (k8sApi, namespace, labelSelector) => {
  const pods = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const pod = pods.body.items.find(p => p.metadata.name.indexOf('terminal') === -1);
  if (pod && pod.status.phase === 'Running') {
    const allReady = pod.status.containerStatuses && pod.status.containerStatuses.every(c => c.ready);
    if (allReady) return true;
  }
  return false;
};

const validateLinuxPermissions = async (k8sApi, namespace, labelSelector) => {
  const pods = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const pod = pods.body.items.find(p => p.metadata.name.indexOf('terminal') === -1);
  if (!pod || pod.status.phase !== 'Running') return false;
  
  try {
    let kc;
    if (k8sApi.kubeconfig) {
        kc = k8sApi.kubeconfig;
    } else {
        kc = new k8s.KubeConfig();
        if (process.env.KUBERNETES_SERVICE_HOST) {
            kc.loadFromCluster();
        } else {
            kc.loadFromOptions({
              clusters: [{ name: 'devops-arena', server: process.env.K8S_API_URL, caData: process.env.K8S_CA_CERT }],
              users: [{ name: 'backend-sa', token: process.env.K8S_TOKEN }],
              contexts: [{ name: 'default', cluster: 'devops-arena', user: 'backend-sa' }],
              currentContext: 'default',
            });
        }
    }
    const exec = new k8s.Exec(kc);

    // We can't easily capture output from Exec in JS client without streams, 
    // but a simpler way is to check the pod's status. However, since the pod just sleeps,
    // let's check file permissions directly using exec
    
    return new Promise((resolve) => {
      let output = '';
      const outStream = new require('stream').PassThrough();
      outStream.on('data', (chunk) => { output += chunk.toString(); });
      const errStream = new require('stream').PassThrough();
      
      exec.exec(namespace, pod.metadata.name, 'alpine', ['/bin/sh', '-c', 'test -x /app/script.sh && echo YES'], outStream, errStream, null, true, 
        (status) => {
          if (output.includes('YES')) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      ).catch((err) => {
          console.error("exec catch:", err);
          resolve(false);
      });
    });
  } catch (e) {
    console.error("Exec error:", e);
    return false;
  }
};

const validateLinuxCommand = async (k8sApi, namespace, labelSelector, command, expectedOutput) => {
  console.log(`[DEBUG] validateLinuxCommand called for namespace ${namespace}, label ${labelSelector}, command ${command}`);
  const pods = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const pod = pods.body.items.find(p => p.metadata.name.indexOf('terminal') === -1);
  if (!pod) { console.log(`[DEBUG] Pod not found for label ${labelSelector}`); return false; }
  if (pod.status.phase !== 'Running') { console.log(`[DEBUG] Pod ${pod.metadata.name} is not Running`); return false; }
  
  try {
    let kc;
    if (k8sApi.kubeconfig) {
        kc = k8sApi.kubeconfig;
    } else {
        kc = new k8s.KubeConfig();
        if (process.env.KUBERNETES_SERVICE_HOST) {
            kc.loadFromCluster();
        } else {
            kc.loadFromOptions({
              clusters: [{ name: 'devops-arena', server: process.env.K8S_API_URL, caData: process.env.K8S_CA_CERT }],
              users: [{ name: 'backend-sa', token: process.env.K8S_TOKEN }],
              contexts: [{ name: 'default', cluster: 'devops-arena', user: 'backend-sa' }],
              currentContext: 'default',
            });
        }
    }
    const exec = new k8s.Exec(kc);
    
    return new Promise((resolve) => {
      let output = '';
      const outStream = new require('stream').PassThrough();
      outStream.on('data', (chunk) => { output += chunk.toString(); });
      const errStream = new require('stream').PassThrough();
      
      exec.exec(namespace, pod.metadata.name, 'alpine', command, outStream, errStream, null, true, 
        (status) => {
          console.log(`[VALIDATE ${pod.metadata.name}] Status: ${JSON.stringify(status)}`);
          console.log(`[VALIDATE ${pod.metadata.name}] Command: ${command.join(' ')}`);
          console.log(`[VALIDATE ${pod.metadata.name}] Output: ${output}`);
          if (expectedOutput === 'EXIT_CODE_0') {
            resolve(status && status.status === 'Success');
          } else if (output.includes(expectedOutput)) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      ).catch((err) => {
          console.error("exec catch:", err);
          resolve(false);
      });
    });
  } catch (e) {
    console.error("Exec error:", e);
    return false;
  }
};

const validateDockerComposeConfig = async (k8sApi, namespace, labelSelector) => {
  return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep "80:80" /workspace/docker-compose.yml | grep -v "8080:80"'], 'EXIT_CODE_0');
};

const validateLinuxFileStat = async (k8sApi, namespace, labelSelector) => {
  return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'stat -c "%a" /app/config.txt | grep "644"'], 'EXIT_CODE_0');
};

const validateDockerfileFix = async (k8sApi, namespace, labelSelector) => {
  return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -E "CMD.*npm.*start" /workspace/Dockerfile'], 'EXIT_CODE_0');
};

const validateJenkinsfileFix = async (k8sApi, namespace, labelSelector) => {
  return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -E "npm run test" /workspace/Jenkinsfile'], 'EXIT_CODE_0');
};

const validateTrivyDockerfileFix = async (k8sApi, namespace, labelSelector) => {
  return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -E "FROM alpine:(latest|3\\.20)" /workspace/Dockerfile'], 'EXIT_CODE_0');
};

const validateDatabaseConnectionFix = async (k8sAppApi, k8sApi, namespace, labelSelector) => {
  let success = true;
  let checks = [];
  
  let backendExists = false;
  try {
    const deps = await k8sAppApi.listNamespacedDeployment(namespace, undefined, undefined, undefined, undefined, 'app=backend');
    if (deps.body.items.length > 0) backendExists = true;
  } catch (e) {}
  
  checks.push({
    name: "Backend Deployment",
    status: backendExists ? "PASS" : "FAIL",
    message: backendExists ? undefined : "Backend deployment not found."
  });
  if (!backendExists) success = false;

  let dbExists = false;
  try {
    const dbDeps = await k8sAppApi.listNamespacedDeployment(namespace, undefined, undefined, undefined, undefined, 'app=postgres');
    if (dbDeps.body.items.length > 0) dbExists = true;
  } catch (e) {}
  
  checks.push({
    name: "Database Deployment",
    status: dbExists ? "PASS" : "FAIL",
    message: dbExists ? undefined : "PostgreSQL deployment not found."
  });
  if (!dbExists) success = false;

  let dbSvcExists = false;
  let dbSvcName = '';
  try {
    const svcs = await k8sApi.listNamespacedService(namespace, undefined, undefined, undefined, undefined, 'app=postgres');
    if (svcs.body.items.length > 0) {
      dbSvcExists = true;
      dbSvcName = svcs.body.items[0].metadata.name;
    }
  } catch (e) {}
  
  checks.push({
    name: "Database Service",
    status: dbSvcExists ? "PASS" : "FAIL",
    message: dbSvcExists ? undefined : "PostgreSQL service not found."
  });
  if (!dbSvcExists) success = false;

  let dbHostCorrect = false;
  let backendReady = false;
  let dbHostVal = '';
  
  try {
    const deps = await k8sAppApi.listNamespacedDeployment(namespace, undefined, undefined, undefined, undefined, 'app=backend');
    if (deps.body.items.length > 0) {
       const dep = deps.body.items[0];
       const envs = dep.spec.template.spec.containers[0].env || [];
       const dbHostEnv = envs.find(e => e.name === 'DB_HOST');
       if (dbHostEnv) {
         dbHostVal = dbHostEnv.value;
         if (dbHostVal === dbSvcName) {
           dbHostCorrect = true;
         }
       }
       
       if (dep.status && dep.status.readyReplicas === dep.spec.replicas) {
         backendReady = true;
       }
    }
  } catch(e) {}
  
  checks.push({
    name: "DB_HOST Configuration",
    status: dbHostCorrect ? "PASS" : "FAIL",
    message: dbHostCorrect ? undefined : `Backend DB_HOST is set to '${dbHostVal}', expected '${dbSvcName}'.`
  });
  if (!dbHostCorrect) success = false;
  
  checks.push({
    name: "Database Connectivity & Health",
    status: backendReady ? "PASS" : "FAIL",
    message: backendReady ? undefined : "Backend pod is crashing or not ready. Connection likely failing."
  });
  if (!backendReady) success = false;

  return { success, checks };
};

const validateRbac = async (k8sRbacApi, namespace) => {
  try {
    const rbs = await k8sRbacApi.listNamespacedRoleBinding(namespace);
    const rb = rbs.body.items.find(r => 
      r.roleRef && r.roleRef.name === 'secret-reader' &&
      r.subjects && r.subjects.some(s => s.kind === 'ServiceAccount')
    );
    return !!rb;
  } catch (e) {
    console.error('validateRbac error:', e.message);
    return false;
  }
};

const challengeValidator = async (missionId, k8sApi, k8sAppApi, k8sNetworkingApi, k8sRbacApi, namespace, labelSelector) => {
  try {
    switch (missionId) {
      case 1: // Fix the Dockerfile (npm install)
        return await validateLinuxCommand(k8sApi, namespace, 'app=m1-dockerfile', ['/bin/sh', '-c', 'grep -E "RUN npm install" /workspace/Dockerfile'], 'EXIT_CODE_0');
        
      case 2: // Reduce Docker Image Size
        return await validateLinuxCommand(k8sApi, namespace, 'app=m2-dockerfile', ['/bin/sh', '-c', 'grep -E "FROM node:18-alpine" /workspace/Dockerfile'], 'EXIT_CODE_0');

      case 10: // Fix Dockerfile CMD instruction
        console.log(`[DEBUG] Validating mission 10 in namespace ${namespace}`);
        return await validateLinuxCommand(k8sApi, namespace, 'app=m10-dockerfile', ['/bin/sh', '-c', 'grep \'"npm"\' /workspace/Dockerfile | grep \'"start"\' | grep CMD'], 'EXIT_CODE_0');

      case 3: // Fix Database Connection
        return await validateDatabaseConnectionFix(k8sAppApi, k8sApi, namespace, labelSelector);
        
      case 4: // Fix ImagePullBackOff
      case 5: // Fix CrashLoopBackOff
      case 16: // Fix Kubernetes Deployment
      case 17: // Fix ConfigMap Mount
      case 18: // ImagePullBackOff
      case 19: // CrashLoopBackOff (Env Var)
      case 33: // ConfigMap Value Misconfiguration
      case 36: // Kubernetes CrashLoopBackOff
      case 37: // Kubernetes Secret Configuration
      case 40: // Docker Image Tag Failure
      case 41: // Kubernetes Deployment Rollback
        return await validatePodRunning(k8sApi, namespace, labelSelector);

      case 20: // Fix RBAC (ServiceAccount) - validate RoleBinding exists linking secret-reader role
        return await validateRbac(k8sRbacApi, namespace);
        
      case 34: // Fix Failed Kubernetes Deployment
        return await validateDeployment(k8sAppApi, namespace, labelSelector);
        
      case 6: // Service Selector Mismatch
      case 9: // Service Not Reachable (obsolete but kept for backwards compat)
      case 15: // Fix Kubernetes Service
        return await validateService(k8sApi, namespace, labelSelector);
        
      case 7: // Fix Ingress 502
      case 38: // Kubernetes Ingress / 502
        return await validateIngress(k8sNetworkingApi, namespace, labelSelector, 80);

      case 11: // Linux File Permissions
        return await validateLinuxPermissions(k8sApi, namespace, labelSelector);

      case 31: // Docker - Container Port Misconfiguration
        return await validateDockerComposeConfig(k8sApi, namespace, labelSelector);

      case 32: // Linux - Broken File Permissions
        return await validateLinuxFileStat(k8sApi, namespace, labelSelector);
        
      case 35: // Docker - Dockerfile Build Failure
        return await validateDockerfileFix(k8sApi, namespace, labelSelector);
        
      case 39: // CI/CD Pipeline Failure
        return await validateJenkinsfileFix(k8sApi, namespace, labelSelector);
        
      case 42: // Trivy / Container Security
        return await validateTrivyDockerfileFix(k8sApi, namespace, labelSelector);

      case 12: // Zombie Process Hunt
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'ps aux | grep rogue.sh | grep -v grep | grep -v mkdir || echo YES'], 'YES');
        
      case 13: // Network Connection Test (Port) - validate user changed config.json to port 8080
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'cat /app/config.json'], '8080');
        
      case 14: // Log Analysis - find error code from the log file
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep ERR-59021 /var/log/app.log 2>/dev/null | head -1 | grep -o "ERR-59021" || cat /app/error_code.txt 2>/dev/null || true'], 'ERR-59021');

      case 21: // Jenkins Pipeline Syntax Error - check closing brace exists
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "}" /workspace/Jenkinsfile'], 'EXIT_CODE_0');
        
      case 22: // Failing Unit Test
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'node /workspace/test.js'], 'EXIT_CODE_0');
        
      case 23: // Docker Build Error - check FROM node:18-alpine exists
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "FROM node:18-alpine" /workspace/Dockerfile'], 'EXIT_CODE_0');
        
      case 24: // Failing Integration Test
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', '/workspace/run-tests.sh'], 'EXIT_CODE_0');
        
      case 25: // Image Push Authentication Error
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "docker login" /workspace/push.sh'], 'EXIT_CODE_0');

      default:
        console.warn(`No validator implemented for mission ${missionId}`);
        return false;
    }
  } catch (err) {
    console.error(`Validation error for mission ${missionId}:`, err.message);
    return false;
  }
};

module.exports = {
  challengeValidator
};
