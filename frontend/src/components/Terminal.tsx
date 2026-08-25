'use client';
import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';
import 'xterm/css/xterm.css';

interface TerminalProps {
  missionId: number;
}

export default function Terminal({ missionId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize Xterm
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: 'transparent',
        foreground: '#e0e0e0',
        cursor: '#00ffcc',
        selectionBackground: 'rgba(0, 255, 204, 0.3)',
        black: '#1e1e1e',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      scrollback: 5000,
    });
    
    xtermRef.current = term;
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    
    // Initial fits
    fitAddon.fit();
    setTimeout(() => fitAddon.fit(), 50);
    setTimeout(() => fitAddon.fit(), 200);

    // Handle Resize using ResizeObserver for perfect fitting
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // ignore errors if container is 0
      }
    });
    resizeObserver.observe(terminalRef.current);

    // Get Auth Token
    const token = localStorage.getItem('token');
    if (!token) {
      term.writeln('\x1b[31mError: Unauthorized. No token found.\x1b[0m');
      return;
    }

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If we're in dev mode on port 3001, we might need to route to port 4000 (backend). 
    // Usually the user's nginx ingress handles `/api`, but for direct local we can use the env var or ingress domain.
    // Assuming relative path works with Nginx Ingress handling `/api`
    let host = window.location.host;
    if (host.includes('3001')) {
      // Local dev workaround if accessing frontend directly via Next.js
      host = 'localhost:4000';
    }
    
    const wsUrl = `${protocol}//${host}/api/missions/${missionId}/terminal/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);
    };

    ws.onerror = (e) => {
      console.error('WebSocket Error:', e);
      term.writeln('\r\n\x1b[31mTerminal Connection Error.\x1b[0m\r\n');
    };

    ws.onclose = () => {
      term.writeln('\r\n\x1b[33mTerminal Connection Closed.\x1b[0m\r\n');
    };

    // Add Copy & Paste Support
    term.attachCustomKeyEventHandler((e) => {
      // Copy: Ctrl+C / Cmd+C (only if text is selected, to not break SIGINT)
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && e.type === 'keydown') {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection);
          term.clearSelection(); // Visual feedback
          return false; // Prevent default SIGINT
        }
      }
      // Paste: Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && e.type === 'keydown') {
        navigator.clipboard.readText().then(text => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(text);
          }
        }).catch(err => {
          console.error('Clipboard access denied', err);
        });
        return false;
      }
      return true;
    });

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      ws.close();
      term.dispose();
    };
  }, [missionId]);

  return (
    <div className="w-full h-full relative bg-[#0a0a0f] backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Mac-like Header */}
      <div className="bg-[#12121a]/80 px-4 py-2.5 flex items-center border-b border-blue-500/20">
         <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
         </div>
         <span className="ml-4 text-xs font-mono text-gray-400">sandbox@kubernetes:~</span>
      </div>

      <div className="flex-1 w-full p-4 relative overflow-hidden">
        <style>{`
          .xterm-viewport::-webkit-scrollbar {
            width: 10px;
          }
          .xterm-viewport::-webkit-scrollbar-track {
            background: transparent;
          }
          .xterm-viewport::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 5px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          .xterm-viewport::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `}</style>
        <div ref={terminalRef} className="w-full h-full" />
      </div>

      {error && (
        <div className="absolute top-12 right-4 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg text-sm shadow-lg border border-red-500/30 backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
}
