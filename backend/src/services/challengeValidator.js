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
  const pod = pods.body.items[0];
  if (pod && pod.status.phase === 'Running') {
    const allReady = pod.status.containerStatuses && pod.status.containerStatuses.every(c => c.ready);
    if (allReady) return true;
  }
  return false;
};

const validateLinuxPermissions = async (k8sApi, namespace, labelSelector) => {
  const pods = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const pod = pods.body.items[0];
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
  const pods = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
  const pod = pods.body.items[0];
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
    
    return new Promise((resolve) => {
      let output = '';
      const outStream = new require('stream').PassThrough();
      outStream.on('data', (chunk) => { output += chunk.toString(); });
      const errStream = new require('stream').PassThrough();
      
      exec.exec(namespace, pod.metadata.name, 'alpine', command, outStream, errStream, null, true, 
        (status) => {
          if (output.includes(expectedOutput)) {
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

const challengeValidator = async (missionId, k8sApi, k8sAppApi, k8sNetworkingApi, namespace, labelSelector) => {
  try {
    switch (missionId) {
      case 4: // Fix ImagePullBackOff
      case 5: // Fix CrashLoopBackOff
      case 16: // Fix Kubernetes Deployment
      case 17: // Fix ConfigMap Mount
      case 18: // ImagePullBackOff
      case 19: // CrashLoopBackOff (Env Var)
      case 20: // Fix RBAC (ServiceAccount)
        return await validatePodRunning(k8sApi, namespace, labelSelector);
        
      case 6: // Service Selector Mismatch
      case 9: // Service Not Reachable (obsolete but kept for backwards compat)
      case 15: // Fix Kubernetes Service
        return await validateService(k8sApi, namespace, labelSelector);
        
      case 7: // Fix Ingress 502
        return await validateIngress(k8sNetworkingApi, namespace, labelSelector, 80);

      case 11: // Linux File Permissions
        return await validateLinuxPermissions(k8sApi, namespace, labelSelector);

      case 12: // Zombie Process Hunt
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'ps aux | grep rogue.sh | grep -v grep || echo YES'], 'YES');
        
      case 13: // Network Connection Test (Port)
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'cat /app/config.json'], '8080');
        
      case 14: // Log Analysis
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'cat /app/error_code.txt 2>/dev/null || true'], 'ERR-59021');

      case 21: // Jenkins Pipeline Syntax Error
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "}" /workspace/Jenkinsfile && echo YES || true'], 'YES');
        
      case 22: // Failing Unit Test
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'node /workspace/test.js && echo YES || true'], 'YES');
        
      case 23: // Docker Build Error
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "FROM node:18-alpine" /workspace/Dockerfile && echo YES || true'], 'YES');
        
      case 24: // Failing Integration Test
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', '/workspace/run-tests.sh && echo YES || true'], 'YES');
        
      case 25: // Image Push Authentication Error
        return await validateLinuxCommand(k8sApi, namespace, labelSelector, ['/bin/sh', '-c', 'grep -q "docker login" /workspace/push.sh && echo YES || true'], 'YES');

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
