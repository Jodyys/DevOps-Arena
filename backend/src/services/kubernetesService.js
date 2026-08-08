const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const kc = new k8s.KubeConfig();

// Load K8s configuration
if (process.env.KUBERNETES_SERVICE_HOST) {
  // In-cluster authentication
  kc.loadFromCluster();
  console.log("Kubernetes configuration loaded from cluster (ServiceAccount).");
} else {
  // Local Docker Compose configuration
  const apiUrl = process.env.K8S_API_URL;
  const apiToken = process.env.K8S_TOKEN;
  const caCert = process.env.K8S_CA_CERT;

  if (apiUrl && apiToken && caCert) {
    kc.loadFromOptions({
      clusters: [{ name: 'devops-arena', server: apiUrl, caData: caCert }],
      users: [{ name: 'backend-sa', token: apiToken }],
      contexts: [{ name: 'default', cluster: 'devops-arena', user: 'backend-sa' }],
      currentContext: 'default',
    });
    console.log("Kubernetes configuration loaded from environment variables.");
  } else {
    console.warn("K8S_API_URL, K8S_TOKEN, or K8S_CA_CERT is not set. Kubernetes challenges will not work locally.");
  }
}

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

const CHALLENGE_NAMESPACE = 'ns-challenges';

/**
 * Validates the solution against the Kubernetes cluster state.
 * @param {number} missionId 
 * @param {string} challengeId (e.g. u1-m4)
 * @returns {Promise<boolean>} true if the mission is completed successfully
 */
async function validateChallenge(missionId, challengeId) {
  const labelSelector = `challenge-id=${challengeId}`;
  
  try {
    switch (missionId) {
      case 4: // Fix ImagePullBackOff
      case 5: // Fix CrashLoopBackOff
        // Check if pod is running
        const pods = await k8sApi.listNamespacedPod(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
        const backendPod = pods.body.items.find(p => p.metadata.labels && p.metadata.labels.app === 'backend-challenge');
        if (backendPod && backendPod.status.phase === 'Running') {
          // Check if all containers are ready
          const allReady = backendPod.status.containerStatuses && backendPod.status.containerStatuses.every(c => c.ready);
          if (allReady) return true;
        }
        return false;

      case 6: // Service Selector Mismatch
        // Check if service has active endpoints
        const endpoints = await k8sApi.listNamespacedEndpoints(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
        const serviceEndpoint = endpoints.body.items.find(e => e.metadata.name.includes('backend-service'));
        
        if (serviceEndpoint && serviceEndpoint.subsets && serviceEndpoint.subsets.length > 0) {
          const addresses = serviceEndpoint.subsets[0].addresses;
          if (addresses && addresses.length > 0) {
            return true;
          }
        }
        return false;

      case 7: // Fix Ingress 502
        // Check if ingress backend port is corrected to 80
        const ingresses = await k8sNetworkingApi.listNamespacedIngress(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
        const ingress = ingresses.body.items.find(i => i.metadata.name.includes('backend-ingress'));
        
        if (ingress) {
          const rules = ingress.spec.rules;
          if (rules && rules.length > 0) {
            const paths = rules[0].http.paths;
            if (paths && paths.length > 0) {
              const port = paths[0].backend.service.port.number;
              if (port === 80) return true;
            }
          }
        }
        return false;

      default:
        return false;
    }
  } catch (err) {
    console.error(`Validation error for mission ${missionId} with label ${labelSelector}:`, err.message);
    return false;
  }
}

/**
 * Creates a dedicated challenge isolated by labels.
 * @param {number} missionId 
 * @param {number} userId 
 * @returns {Promise<string>} The challengeId (used instead of namespace in DB)
 */
async function startChallenge(missionId, userId) {
  const challengeId = `u${userId}-m${missionId}`;
  const labelSelector = `challenge-id=${challengeId}`;
  
  try {
    // Check if challenge already exists (query pods with label)
    const existingPods = await k8sApi.listNamespacedPod(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    if (existingPods.body.items.length > 0) {
      console.log(`Challenge ${challengeId} already exists, reusing.`);
      return challengeId; // Reuse existing challenge
    }

    // Determine which YAML to load based on missionId
    let challengeFile = '';
    if (missionId >= 4 && missionId <= 7) {
      challengeFile = `mission-${missionId}.yaml`;
    } else {
      return null;
    }

    const yamlPath = path.join(__dirname, '../../../../k8s/challenges', challengeFile);
    if (!fs.existsSync(yamlPath)) {
      throw new Error(`Challenge YAML not found: ${yamlPath}`);
    }

    const fileContent = fs.readFileSync(yamlPath, 'utf8');
    const manifests = yaml.loadAll(fileContent);

    // Deploy all documents in the YAML with label injection
    for (const manifest of manifests) {
      if (!manifest) continue;
      
      const kind = manifest.kind;
      
      // Inject labels and prefix names
      if (!manifest.metadata) manifest.metadata = {};
      if (!manifest.metadata.labels) manifest.metadata.labels = {};
      
      manifest.metadata.labels['challenge-id'] = challengeId;
      manifest.metadata.name = `${challengeId}-${manifest.metadata.name}`;

      // If it's a deployment, inject labels into pod template selector
      if (kind === 'Deployment' && manifest.spec && manifest.spec.template) {
        if (!manifest.spec.template.metadata) manifest.spec.template.metadata = {};
        if (!manifest.spec.template.metadata.labels) manifest.spec.template.metadata.labels = {};
        
        manifest.spec.template.metadata.labels['challenge-id'] = challengeId;
        
        // We must also add the label to the matchLabels selector
        if (!manifest.spec.selector) manifest.spec.selector = {};
        if (!manifest.spec.selector.matchLabels) manifest.spec.selector.matchLabels = {};
        manifest.spec.selector.matchLabels['challenge-id'] = challengeId;
      }
      
      try {
        if (kind === 'Deployment') {
          await k8sAppApi.createNamespacedDeployment(CHALLENGE_NAMESPACE, manifest);
        } else if (kind === 'Service') {
          await k8sApi.createNamespacedService(CHALLENGE_NAMESPACE, manifest);
        } else if (kind === 'Ingress') {
          await k8sNetworkingApi.createNamespacedIngress(CHALLENGE_NAMESPACE, manifest);
        } else if (kind === 'ConfigMap') {
          await k8sApi.createNamespacedConfigMap(CHALLENGE_NAMESPACE, manifest);
        } else if (kind === 'Secret') {
          await k8sApi.createNamespacedSecret(CHALLENGE_NAMESPACE, manifest);
        } else {
          console.warn(`Unsupported kind: ${kind} in ${challengeFile}`);
        }
      } catch (applyErr) {
        console.error(`Error applying ${kind}:`, applyErr.body ? applyErr.body.message : applyErr.message);
      }
    }

    return challengeId;
  } catch (err) {
    console.error(`Failed to start challenge for mission ${missionId}:`, err.message);
    throw err;
  }
}

/**
 * Deletes all resources belonging to a specific challenge ID.
 * @param {string} challengeId 
 */
async function cleanupChallenge(challengeId) {
  const labelSelector = `challenge-id=${challengeId}`;
  console.log(`Cleaning up challenge resources for ${labelSelector}`);
  try {
    // Delete Deployments
    const deps = await k8sAppApi.listNamespacedDeployment(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const dep of deps.body.items) {
      await k8sAppApi.deleteNamespacedDeployment(dep.metadata.name, CHALLENGE_NAMESPACE);
    }
    
    // Delete Services
    const svcs = await k8sApi.listNamespacedService(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const svc of svcs.body.items) {
      await k8sApi.deleteNamespacedService(svc.metadata.name, CHALLENGE_NAMESPACE);
    }
    
    // Delete Ingresses
    const ings = await k8sNetworkingApi.listNamespacedIngress(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const ing of ings.body.items) {
      await k8sNetworkingApi.deleteNamespacedIngress(ing.metadata.name, CHALLENGE_NAMESPACE);
    }
    
    // Delete ConfigMaps
    const cms = await k8sApi.listNamespacedConfigMap(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const cm of cms.body.items) {
      await k8sApi.deleteNamespacedConfigMap(cm.metadata.name, CHALLENGE_NAMESPACE);
    }
    
    // Delete Secrets
    const secs = await k8sApi.listNamespacedSecret(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const sec of secs.body.items) {
      await k8sApi.deleteNamespacedSecret(sec.metadata.name, CHALLENGE_NAMESPACE);
    }

    // Pods created by deployment will automatically terminate, but we can delete standalone ones
    const pods = await k8sApi.listNamespacedPod(CHALLENGE_NAMESPACE, undefined, undefined, undefined, undefined, labelSelector);
    for (const pod of pods.body.items) {
      await k8sApi.deleteNamespacedPod(pod.metadata.name, CHALLENGE_NAMESPACE);
    }

    console.log(`Successfully cleaned up resources for ${challengeId}`);
  } catch (err) {
    console.error(`Failed to cleanup challenge ${challengeId}:`, err.message);
  }
}

module.exports = {
  startChallenge,
  validateChallenge,
  cleanupChallenge
};
