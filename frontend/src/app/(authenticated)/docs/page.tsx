"use client";

import React from 'react';
import { Map, BookOpen, FileText, ExternalLink, Terminal } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full font-sans text-slate-300">
      <header className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
          <Map className="w-8 h-8 text-red-500" />
          ARENA DOCUMENTATION
        </h1>
        <p className="text-slate-400">Official technical guides and command references.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-500" /> Getting Started with Sandboxes
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-slate-400">
            <p>Welcome to DevOps Arena! This platform provisions real, isolated Kubernetes namespaces for every mission. You have full root access to your containerized environment.</p>
            <h3 className="text-slate-200 mt-6 mb-2 font-bold">Standard Workflow</h3>
            <ul className="list-disc pl-5 space-y-2 font-mono text-[11px]">
              <li>Select a mission from the Skill Map.</li>
              <li>Read the Incident Report.</li>
              <li>Click "Start Mission" to provision your K8s namespace.</li>
              <li>Open the integrated terminal or SSH into your pod.</li>
              <li>Fix the underlying infrastructure issue.</li>
              <li>Click "Verify" to run the automated tests.</li>
            </ul>
            
            <div className="mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="text-red-400 font-bold text-xs uppercase tracking-widest mb-2">Warning</div>
              <p className="text-xs">Do not attempt to break out of the sandbox. Malicious activity is logged and may result in an immediate operator ban.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
