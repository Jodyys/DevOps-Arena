const url = require('url');
const jwt = require('jsonwebtoken');
const k8s = require('@kubernetes/client-node');
const db = require('./db');
const { kc } = require('./services/kubernetesService');

function setupWebSocket(server, logger) {
  const { WebSocketServer } = require('ws');
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    try {
      const parsedUrl = url.parse(request.url, true);
      
      // We only handle /api/missions/:id/terminal/ws
      const match = parsedUrl.pathname.match(/^\/api\/missions\/(\d+)\/terminal\/ws$/);
      if (!match) {
        socket.destroy();
        return;
      }

      const missionId = parseInt(match[1]);
      const token = parsedUrl.query.token;

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-me');
      const userId = decoded.id;

      // Check if user has an active sandbox for this mission
      const activeRes = await db.query(
        'SELECT namespace FROM active_challenges WHERE user_id = $1 AND mission_id = $2 AND status = $3',
        [userId, missionId, 'ACTIVE']
      );

      if (activeRes.rows.length === 0) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      const namespaceName = activeRes.rows[0].namespace;

      // Handle Upgrade
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, namespaceName);
      });
    } catch (err) {
      logger.error({ err }, 'WebSocket upgrade failed');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', async (ws, request, namespaceName) => {
    logger.info(`WebSocket connected for sandbox: ${namespaceName}`);
    
    // Set up K8s Exec
    const exec = new k8s.Exec(kc);
    const command = ['/bin/sh']; // Real terminal shell
    const { PassThrough } = require('stream');
    
    try {
      const outStream = new PassThrough();
      const inStream = new PassThrough();

      // Bridge K8s output to WebSocket
      outStream.on('data', (chunk) => {
        ws.send(chunk);
      });

      // Bridge WebSocket input to K8s
      ws.on('message', (message) => {
        inStream.write(message);
      });

      await exec.exec(
        namespaceName,
        'terminal',
        'terminal',
        command,
        outStream,
        outStream, // send stderr to stdout
        inStream,
        true, // TTY
        (status) => {
          logger.info({ status }, 'K8s Exec finished');
          ws.close();
        }
      );
      
      // Handle cleanup
      ws.on('close', () => {
        logger.info('WebSocket closed');
        inStream.end();
      });

      // Send initial terminal ready signal
      ws.send(`\r\n\x1b[32mDevOps Arena Sandbox connected to namespace: ${namespaceName}\x1b[0m\r\n\r\n`);
    } catch (err) {
      logger.error({ err }, 'Failed to exec into terminal pod');
      ws.send(`\r\n\x1b[31mError connecting to terminal pod: ${err.message}\x1b[0m\r\n`);
      ws.close();
    }
  });
}

module.exports = { setupWebSocket };
