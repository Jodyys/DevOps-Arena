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

const { challengeValidator } = require('./challengeValidator');

/**
 * Validates the solution against the Kubernetes cluster state.
 * @param {number} missionId 
 * @param {string} challengeId (e.g. u1-m4)
 * @returns {Promise<boolean>} true if the mission is completed successfully
 */
async function validateChallenge(missionId, challengeId) {
  const labelSelector = `challenge-id=${challengeId}`;
  return await challengeValidator(missionId, k8sApi, k8sAppApi, k8sNetworkingApi, CHALLENGE_NAMESPACE, labelSelector);
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

    let challengeFile = `mission-${missionId}.yaml`;

    const yamlPath = path.join(__dirname, '../../../../k8s/challenges', challengeFile);
    if (!fs.existsSync(yamlPath)) {
      return null;
    }

    const rawManifestContent = await fs.promises.readFile(yamlPath, 'utf8');
    const manifestContent = rawManifestContent.replace(/\$\{CHALLENGE_ID\}/g, challengeId);
    const manifests = yaml.loadAll(manifestContent);

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

        // Also rename configMapRefs and secretRefs to match the dynamically prefixed ConfigMap/Secret names
        if (manifest.spec.template.spec && manifest.spec.template.spec.containers) {
          for (let container of manifest.spec.template.spec.containers) {
            if (container.envFrom) {
              for (let env of container.envFrom) {
                if (env.configMapRef && env.configMapRef.name) {
                  env.configMapRef.name = `${challengeId}-${env.configMapRef.name}`;
                }
                if (env.secretRef && env.secretRef.name) {
                  env.secretRef.name = `${challengeId}-${env.secretRef.name}`;
                }
              }
            }
          }
        }
        
        // Also rename ingress backend service names
        if (kind === 'Ingress' && manifest.spec && manifest.spec.rules) {
          for (let rule of manifest.spec.rules) {
            if (rule.http && rule.http.paths) {
              for (let path of rule.http.paths) {
                if (path.backend && path.backend.service && path.backend.service.name) {
                  path.backend.service.name = `${challengeId}-${path.backend.service.name}`;
                }
              }
            }
          }
        }
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

    if (missionId === 41) {
      console.log(`Mission 41: Creating broken revision 2...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const depName = `${challengeId}-m41-rollback`;
      try {
        const patch = [
          {
            "op": "replace",
            "path": "/spec/template/spec/containers/0/image",
            "value": "nginx:does-not-exist"
          }
        ];
        const options = { headers: { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };
        await k8sAppApi.patchNamespacedDeployment(depName, CHALLENGE_NAMESPACE, patch, undefined, undefined, undefined, undefined, undefined, options);
        console.log(`Mission 41: Revision 2 created for ${depName}`);
      } catch (patchErr) {
        console.error(`Error patching M41 deployment:`, patchErr.body ? patchErr.body.message : patchErr.message);
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
