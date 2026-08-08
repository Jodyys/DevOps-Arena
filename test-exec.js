const k8s = require('@kubernetes/client-node');

async function testExec() {
  const kc = new k8s.KubeConfig();
  kc.loadFromOptions({
    clusters: [{ name: 'devops-arena', server: 'https://desktop-control-plane:65132', caData: process.env.K8S_CA_CERT }],
    users: [{ name: 'backend-sa', token: process.env.K8S_TOKEN }],
    contexts: [{ name: 'default', cluster: 'devops-arena', user: 'backend-sa' }],
    currentContext: 'default',
  });
  
  const exec = new k8s.Exec(kc);
  
  const namespace = 'ns-challenges';
  // Note: you need to set process.env.K8S_CA_CERT and K8S_TOKEN first, or just run this script inside the backend container!
}

testExec();
