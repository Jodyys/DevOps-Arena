const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const kc = new k8s.KubeConfig();

// Load K8s configuration
if (process.env.KUBERNETES_SERVICE_HOST) {
  kc.loadFromCluster();
  console.log("Kubernetes configuration loaded from cluster (ServiceAccount).");
} else {
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
const k8sRbacApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);

const { challengeValidator } = require('./challengeValidator');

/**
 * Validates the solution against the Kubernetes cluster state.
 * @param {number} missionId 
 * @param {string} challengeId (This is now the namespace name, e.g. arena-u1-m03-abcd)
 * @returns {Promise<boolean>} true if the mission is completed successfully
 */
async function validateChallenge(missionId, challengeId) {
  // Pass the sandbox namespace directly to the validator
  // We no longer need label selectors for isolation since namespaces provide true isolation
  return await challengeValidator(missionId, k8sApi, k8sAppApi, k8sNetworkingApi, k8sRbacApi, challengeId, undefined);
}

/**
 * Creates a dedicated challenge isolated by a true Namespace.
 * @param {number} missionId 
 * @param {number} userId 
 * @returns {Promise<string>} The challengeId (Namespace name)
 */
async function startChallenge(missionId, userId) {
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  // Requirement #3: generated namespace format arena-u<userId>-m<missionId>-<randomSuffix>
  const namespaceName = `arena-u${userId}-m${missionId.toString().padStart(2, '0')}-${randomSuffix}`;
  
  try {
    // 1. Create the Namespace
    await k8sApi.createNamespace({
      metadata: { name: namespaceName }
    });
    console.log(`Created namespace: ${namespaceName}`);

    // 2. Create the Sandbox ServiceAccount
    const saName = 'sandbox-sa';
    await k8sApi.createNamespacedServiceAccount(namespaceName, {
      metadata: { name: saName, namespace: namespaceName }
    });

    // 3. Create Role (Full access strictly within this namespace)
    const roleName = 'sandbox-role';
    await k8sRbacApi.createNamespacedRole(namespaceName, {
      metadata: { name: roleName, namespace: namespaceName },
      rules: [
        {
          apiGroups: ["", "apps", "networking.k8s.io", "batch", "extensions"],
          resources: ["*"],
          verbs: ["*"]
        },
        {
          apiGroups: ["rbac.authorization.k8s.io"],
          resources: ["roles", "rolebindings"],
          verbs: ["*"]
        }
      ]
    });

    // 4. Create RoleBinding
    await k8sRbacApi.createNamespacedRoleBinding(namespaceName, {
      metadata: { name: 'sandbox-rolebinding', namespace: namespaceName },
      subjects: [{ kind: 'ServiceAccount', name: saName, namespace: namespaceName }],
      roleRef: { kind: 'Role', name: roleName, apiGroup: 'rbac.authorization.k8s.io' }
    });

    // 5. Deploy Terminal Pod
    await k8sApi.createNamespacedPod(namespaceName, {
      metadata: { 
        name: 'terminal', 
        namespace: namespaceName,
        labels: { app: 'terminal' }
      },
      spec: {
        serviceAccountName: saName,
        containers: [{
          name: 'terminal',
          // Requirement #3: Do not use bitnami/kubectl:latest
          image: 'alpine/k8s:1.28.2',
          command: ['/bin/sh', '-c', 'until apk add --no-cache nano; do sleep 2; done; sleep infinity'],
          tty: true,
          stdin: true
        }]
      }
    });

    // 6. Deploy Mission Resources from Template
    let challengeFile = `mission-${missionId}.yaml`;
    const yamlPath = path.join(__dirname, '../../../../k8s/challenges', challengeFile);
    
    if (fs.existsSync(yamlPath)) {
      let manifestContent = await fs.promises.readFile(yamlPath, 'utf8');
      manifestContent = manifestContent.replace(/\$\{CHALLENGE_ID\}/g, namespaceName);
      const manifests = yaml.loadAll(manifestContent);

      for (const manifest of manifests) {
        if (!manifest) continue;
        
        const kind = manifest.kind;
        
        // Force the namespace to match the sandbox namespace, overriding any hardcoded values
        if (manifest.metadata) {
          manifest.metadata.namespace = namespaceName;
        }
        
        // No more prefixing! Just deploy directly into the namespace.
        try {
          if (kind === 'Deployment') {
            await k8sAppApi.createNamespacedDeployment(namespaceName, manifest);
          } else if (kind === 'Service') {
            await k8sApi.createNamespacedService(namespaceName, manifest);
          } else if (kind === 'Ingress') {
            await k8sNetworkingApi.createNamespacedIngress(namespaceName, manifest);
          } else if (kind === 'ConfigMap') {
            await k8sApi.createNamespacedConfigMap(namespaceName, manifest);
          } else if (kind === 'Secret') {
            await k8sApi.createNamespacedSecret(namespaceName, manifest);
          } else if (kind === 'Pod') {
            await k8sApi.createNamespacedPod(namespaceName, manifest);
          } else if (kind === 'Role') {
            await k8sRbacApi.createNamespacedRole(namespaceName, manifest);
          } else if (kind === 'RoleBinding') {
            await k8sRbacApi.createNamespacedRoleBinding(namespaceName, manifest);
          } else if (kind === 'ServiceAccount') {
            await k8sApi.createNamespacedServiceAccount(namespaceName, manifest);
          } else if (kind === 'Job') {
            await k8sBatchApi.createNamespacedJob(namespaceName, manifest);
          } else {
            console.error(`Unsupported kind: ${kind} in ${challengeFile}`);
          }
        } catch (applyErr) {
          console.error(`Error applying ${kind} in ${namespaceName}:`, applyErr.body ? applyErr.body.message : applyErr.message);
        }
      }
    } else {
      console.error(`ERROR: Challenge manifest not found at ${yamlPath}. Mission resources for ${missionId} will not be deployed.`);
    }

    // Special case for M41 if it still applies
    if (missionId === 41) {
      console.log(`Mission 41: Creating broken revision 2...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const depName = `m41-rollback`; // Reverted to original un-prefixed name
      try {
        const patch = [{ "op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "nginx:does-not-exist" }];
        const options = { headers: { "Content-type": k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };
        await k8sAppApi.patchNamespacedDeployment(depName, namespaceName, patch, undefined, undefined, undefined, undefined, undefined, options);
      } catch (patchErr) {
        console.error(`Error patching M41 deployment:`, patchErr.body ? patchErr.body.message : patchErr.message);
      }
    }

    return namespaceName; // Return the namespace name as the new challengeId
  } catch (err) {
    console.error(`Failed to start challenge for mission ${missionId}:`, err.message);
    throw err;
  }
}

/**
 * Deletes all resources belonging to a specific challenge ID.
 * @param {string} namespaceName 
 */
async function cleanupChallenge(namespaceName) {
  console.log(`Cleaning up challenge by deleting namespace: ${namespaceName}`);
  try {
    // Delete the entire namespace. This is the ultimate cleanup!
    await k8sApi.deleteNamespace(namespaceName);
    console.log(`Successfully requested deletion for namespace ${namespaceName}`);
  } catch (err) {
    console.error(`Failed to delete namespace ${namespaceName}:`, err.message);
  }
}

// Deprecated: We will remove this once the frontend is updated to WebSockets.
async function executeTerminalCommand(challengeId, commandStr) {
  return { success: false, stdout: '', stderr: 'Terminal API has been deprecated. Please use the WebSocket Real Terminal.', exitCode: 1 };
}

module.exports = {
  startChallenge,
  validateChallenge,
  cleanupChallenge,
  executeTerminalCommand,
  kc // Exported for WebSocket use
};
