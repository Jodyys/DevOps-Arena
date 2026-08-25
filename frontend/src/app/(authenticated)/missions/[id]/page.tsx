"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Terminal, AlertOctagon, CheckCircle2, RotateCcw, ShieldAlert, Clock, Lightbulb, History, ChevronRight, Activity, TerminalSquare } from "lucide-react";
import dynamic from 'next/dynamic';

const TerminalComponent = dynamic(() => import('@/components/Terminal'), { ssr: false });

export default function MissionDetail() {
  const { id } = useParams();
  const [mission, setMission] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  
  // New Mechanics State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const [sandboxStatus, setSandboxStatus] = useState<string>("PROVISIONING");

  const router = useRouter();

  const fetchMissionAndHistory = async () => {
    try {
      setLoading(true);
      const [missionRes, historyRes] = await Promise.all([
        fetchApi(`/missions/${id}`),
        fetchApi(`/missions/${id}/history`)
      ]);
      setMission(missionRes.data);
      setHistory(historyRes.data);
      
      // Automatically start mission
      const startRes = await fetchApi(`/missions/${id}/start`, { method: "POST" });
      if (startRes.data?.started_at) {
          const st = new Date(startRes.data.started_at);
          setStartedAt(st);
          setTimerActive(true);
      }
    } catch (error) {
      console.error(error);
      router.push("/levels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMissionAndHistory();
  }, [id]);

  useEffect(() => {
    if (timerActive && startedAt) {
      timerRef.current = setInterval(() => {
        setTimer(Math.floor((Date.now() - startedAt.getTime()) / 1000));
      }, 1000);
    } else if (!timerActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, startedAt]);

  const isSandboxMission = mission?.category === 'Kubernetes' || mission?.category === 'Docker' || mission?.category === 'Linux' || mission?.category === 'CI/CD';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSandboxMission && id) {
      interval = setInterval(async () => {
        try {
          const res = await fetchApi(`/missions/${id}/status`);
          if (res.data) setSandboxStatus(res.data.status);
        } catch(e) {}
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [id, mission, isSandboxMission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setTimerActive(false); // Pause timer while validating
    try {
      const payload = isSandboxMission ? "validate" : answer;
      
      const res = await fetchApi(`/missions/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer: payload, hints_used: hintsRevealed }),
      });
      setResult(res.data);
      
      if (!res.data.correct) {
          setTimerActive(true);
      }
      
      const historyRes = await fetchApi(`/missions/${id}/history`);
      setHistory(historyRes.data);
      
    } catch (err: any) {
      setError(err.message || "Failed to submit mission");
      setTimerActive(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplay = async () => {
    setIsReplaying(true);
    setResult(null);
    setError("");
    setHintsRevealed(0);
    setTimer(0);
    setSandboxStatus("PROVISIONING");
    try {
      const startRes = await fetchApi(`/missions/${id}/replay`, { method: "POST" });
      if (startRes.data?.started_at) {
          const st = new Date(startRes.data.started_at);
          setStartedAt(st);
          setTimerActive(true);
      }
      const historyRes = await fetchApi(`/missions/${id}/history`);
      setHistory(historyRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to restart mission");
    } finally {
      setIsReplaying(false);
    }
  };

  const handleAbort = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/missions/${id}/abort`, { method: "POST" });
    } catch(e) {}
    router.push(`/levels/${mission.level_id}`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!mission) return null;

  return (
    <div className="space-y-6 w-full max-w-[1600px] px-4 md:px-8 mx-auto pb-12">
      <div className="flex items-center justify-between">
        <button onClick={handleAbort} className="flex items-center text-slate-400 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest w-fit border border-surface-secondary px-4 py-2 rounded">
          <ArrowLeft className="w-4 h-4 mr-2" /> Abort Incident
        </button>
        <div className="text-[10px] font-mono text-slate-500 flex items-center">
          <Activity className={`w-3 h-3 mr-2 ${sandboxStatus === 'ACTIVE' ? 'animate-pulse text-emerald-500' : sandboxStatus === 'PROVISIONING' ? 'animate-spin text-yellow-500' : 'text-red-500'}`} />
          {sandboxStatus === 'ACTIVE' ? 'CONNECTION SECURE' : sandboxStatus === 'PROVISIONING' ? 'PROVISIONING SANDBOX...' : 'SANDBOX ' + sandboxStatus}
        </div>
      </div>
      
      <div className="bg-surface rounded-xl shadow-2xl overflow-hidden border border-surface-secondary flex flex-col md:flex-row">
        
        {/* Main Left Column */}
        <div className="flex-1 border-r border-surface-secondary flex flex-col">
            
            {/* Header - Incident Style */}
            <div className="bg-slate-900 border-b border-surface-secondary p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-[50px] rounded-full"></div>
              <div className="flex items-start z-10">
                <div className="bg-red-500/10 p-3 rounded mr-4 border border-red-500/30">
                  <AlertOctagon className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <div className="text-red-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-1">
                    INCIDENT // M-{String(mission.id).padStart(2, '0')} // {mission.category.toUpperCase()}
                  </div>
                  <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">{mission.title}</h1>
                </div>
              </div>
              <div className="flex gap-4 items-center z-10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Severity</span>
                  <span className={`text-sm font-bold uppercase tracking-wider ${
                    mission.difficulty === 'Hard' ? 'text-red-400' : 
                    mission.difficulty === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {mission.difficulty}
                  </span>
                </div>
                <div className="h-8 w-px bg-surface-secondary mx-2"></div>
                <div className="flex items-center">
                    <Clock className={`w-5 h-5 mr-2 ${timerActive ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={`font-mono font-bold text-xl ${timerActive ? 'text-slate-100' : 'text-slate-500'}`}>
                      {formatTime(timer)}
                    </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              {!result ? (
                <div className="flex flex-col gap-8 flex-1">
                  
                  {/* Incident Details */}
                  <div className="space-y-6 flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        <ChevronRight className="w-4 h-4 text-blue-500" /> System Status
                      </h2>
                      <div className="p-4 bg-slate-900 border border-red-900/30 rounded border-l-2 border-l-red-500">
                        <p className="text-slate-300 font-mono text-sm leading-relaxed">
                          {mission.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        <ChevronRight className="w-4 h-4 text-emerald-500" /> Objective
                      </h2>
                      <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded border-l-2 border-l-emerald-500">
                        <p className="text-emerald-100 font-mono text-sm leading-relaxed">
                          {mission.objective}
                        </p>
                      </div>
                    </div>

                    {/* Hints Section */}
                    {mission.hints && mission.hints.length > 0 && (
                        <div className="xl:pl-6 xl:border-l xl:border-surface-secondary">
                            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" /> Tactical Hints ({hintsRevealed}/{mission.hints.length})
                            </h2>
                            <div className="space-y-2">
                                {mission.hints.map((hint: string, idx: number) => (
                                    <div key={idx} className="bg-slate-900 border border-surface-secondary rounded p-3 text-sm font-mono">
                                        {idx < hintsRevealed ? (
                                            <span className="text-slate-400">{hint}</span>
                                        ) : idx === hintsRevealed ? (
                                            <button 
                                                onClick={() => setHintsRevealed(h => h + 1)}
                                                className="text-yellow-500 hover:text-yellow-400 font-bold uppercase text-[10px] tracking-widest"
                                            >
                                                [ Request Hint {idx + 1} ]
                                            </button>
                                        ) : (
                                            <span className="text-slate-600 italic uppercase text-[10px] tracking-widest">Hint Locked</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
  
                  {/* Terminal Panel */}
                  <div className="flex-1 flex flex-col w-full mt-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                      <TerminalSquare className="w-4 h-4 mr-2 text-blue-500" /> Operational Console
                    </h2>
                    
                    <div className="bg-[#0c0c0c] rounded-xl border border-surface-secondary p-4 font-mono text-sm shadow-inner flex flex-col flex-1 min-h-[500px]">
                      
                      {isSandboxMission && sandboxStatus === 'ACTIVE' ? (
                        <div className="flex-1 w-full h-full min-h-[400px]">
                           <TerminalComponent missionId={parseInt(id as string)} />
                        </div>
                      ) : isSandboxMission && sandboxStatus !== 'ACTIVE' ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 flex-col">
                           <Activity className={`w-8 h-8 mb-4 ${sandboxStatus === 'PROVISIONING' ? 'animate-spin text-yellow-500' : 'text-red-500'}`} />
                           <span>{sandboxStatus === 'PROVISIONING' ? 'Provisioning Sandbox Environment...' : 'Sandbox Offline'}</span>
                        </div>
                      ) : (
                        <div className="flex-1 text-slate-400">
                          <p className="text-red-500 bg-red-900/20 py-1 px-2">{'>'} ERROR: Configuration anomaly detected.</p>
                          <p className="text-slate-500 mt-4 px-2">Provide the exact command, string, or fix required to resolve the issue.</p>
                        </div>
                      )}
                      
                      {/* Action Area Inside Terminal */}
                      <div className="pt-4 border-t border-slate-800 mt-4">
                        {error && (
                          <div className="bg-red-900/20 border-l-2 border-red-500 text-red-400 p-3 mb-4 text-xs font-mono flex items-start">
                            <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                          {!isSandboxMission && (
                            <input 
                              type="text" 
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              className="w-full bg-[#0c0c0c] text-emerald-400 font-mono p-3 border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                              placeholder="> enter command..."
                              required
                              disabled={submitting}
                            />
                          )}
                          <button 
                            type="submit" 
                            disabled={submitting || isReplaying || (isSandboxMission && sandboxStatus !== 'ACTIVE')}
                            className={`w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 uppercase tracking-widest text-xs py-4 font-bold transition-all flex items-center justify-center disabled:opacity-50`}
                          >
                            {submitting ? (
                              <span className="flex items-center text-blue-400">EXECUTING...</span>
                            ) : (
                              <span className="flex items-center"><Terminal className="w-4 h-4 mr-2" /> {isSandboxMission ? 'VALIDATE_FIX' : 'EXECUTE'}</span>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Result Screen */
                <div className={`p-8 rounded border flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out flex-1 ${
                  result.correct 
                    ? 'bg-emerald-900/10 border-emerald-900/50' 
                    : 'bg-red-900/10 border-red-900/50'
                }`}>
                  
                  {result.correct ? (
                    <div className="flex flex-col items-center max-w-md w-full">
                      <h3 className="text-3xl font-mono font-bold text-slate-100 tracking-wide uppercase mb-6">
                         {result.is_first_completion || result.xp > 0 ? 'MISSION RESOLVED' : 'MISSION REPLAY'}
                      </h3>
                      
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
                      
                      {result.xp > 0 ? (
                        <div className="text-3xl font-mono font-bold text-emerald-400 mb-8">+{result.xp} XP</div>
                      ) : (
                        <div className="text-3xl font-mono font-bold text-slate-500 mb-8">+0 XP</div>
                      )}
                      
                      <div className="flex flex-col items-center mb-10 w-full border-t border-b border-surface-secondary py-6">
                          <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${result.is_new_personal_best ? 'text-yellow-500' : 'text-slate-500'}`}>
                            {result.is_new_personal_best ? 'PERSONAL BEST' : 'DURATION'}
                          </div>
                          <div className={`text-3xl font-mono font-bold ${result.is_new_personal_best ? 'text-yellow-500' : 'text-slate-300'}`}>
                            {formatTime(result.duration || timer)}
                          </div>
                      </div>
    
                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href={`/levels/${mission.level_id}`} className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-xs tracking-widest px-8 py-4 font-bold transition-colors min-w-[200px]">
                          Continue
                        </Link>
                        <button 
                          onClick={handleReplay}
                          disabled={isReplaying}
                          className="bg-transparent hover:bg-surface-secondary text-slate-300 border border-surface-secondary uppercase text-xs tracking-widest px-8 py-4 font-bold transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <RotateCcw className={`w-4 h-4 mr-2 ${isReplaying ? 'animate-spin' : ''}`} /> 
                          {isReplaying ? 'RESETTING...' : 'REPLAY'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
                      <div className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase mb-2">CRITICAL ALERT</div>
                      <h3 className="text-3xl font-mono font-bold text-slate-100 mb-4 tracking-wide">VALIDATION FAILED</h3>
                      <p className="text-slate-400 mb-8 max-w-md font-mono text-sm">
                        Incident is still active. Your proposed solution did not resolve the system anomalies.
                      </p>
                      
                      {result.checks && result.checks.length > 0 && (
                        <div className="w-full max-w-md mb-8 text-left space-y-2">
                          {result.checks.map((check: any, idx: number) => (
                            <div key={idx} className="bg-slate-900 border border-surface-secondary p-4 rounded flex flex-col">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-slate-300">{check.name}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${check.status === 'PASS' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                  {check.status}
                                </span>
                              </div>
                              {check.message && (
                                <span className="text-xs text-slate-500 font-mono mt-2">{check.message}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-slate-900 border border-surface-secondary px-6 py-4 rounded flex flex-col items-center mb-8">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">XP PENALTY</span>
                        <span className="text-2xl font-mono font-bold text-red-500">{result.xp} XP</span>
                      </div>
    
                      <button 
                        onClick={() => setResult(null)} 
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white uppercase text-xs tracking-widest px-8 py-4 font-bold transition-colors"
                      >
                        Return to Console
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
        </div>
        
        {/* Right Sidebar - History Log */}
        <div className={`w-full md:w-72 bg-surface-secondary/20 ${showHistory ? 'block' : 'hidden md:block'}`}>
             <div className="p-4 border-b border-surface-secondary flex justify-between items-center">
                 <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center">
                   <History className="w-3 h-3 mr-2" /> Action Log
                 </h2>
                 <button className="md:hidden text-slate-500" onClick={() => setShowHistory(false)}>✕</button>
             </div>
             <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                 {history.length === 0 ? (
                     <div className="text-center text-slate-600 text-xs py-8 font-mono">No previous actions logged.</div>
                 ) : (
                     history.map((h, i) => (
                         <div key={h.id} className="relative pl-4 border-l border-surface-secondary pb-4 last:pb-0">
                             <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${h.status === 'completed' ? 'bg-emerald-500' : h.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                             <div className="text-[10px] font-mono text-slate-500 mb-1">
                               {new Date(h.started_at).toLocaleString()}
                             </div>
                             <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${h.status === 'completed' ? 'text-emerald-400' : h.status === 'failed' ? 'text-red-400' : 'text-blue-400'}`}>
                               {h.status}
                             </div>
                             {h.status !== 'started' && (
                                 <div className="flex justify-between text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-surface-secondary">
                                     <span>{h.score > 0 ? `+${h.score}` : h.score} XP</span>
                                     <span>{formatTime(h.duration || 0)}</span>
                                 </div>
                             )}
                         </div>
                     ))
                 )}
             </div>
        </div>
      </div>
    </div>
  );
}
