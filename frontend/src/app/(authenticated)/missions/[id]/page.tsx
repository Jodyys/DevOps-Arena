"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Terminal, AlertOctagon, CheckCircle2, RotateCcw, AlertTriangle, ShieldAlert, Clock, Lightbulb, History, ChevronRight } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setTimerActive(false); // Pause timer while validating
    try {
      // For Kubernetes missions, we just send a generic answer 'validate' to trigger the check
      const payload = mission?.category === 'Kubernetes' ? "validate" : answer;
      
      const res = await fetchApi(`/missions/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer: payload, hints_used: hintsRevealed }),
      });
      setResult(res.data);
      
      // If validation failed, resume timer
      if (!res.data.correct) {
          setTimerActive(true);
      }
      
      // Fetch history again to update the list
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
    try {
      const startRes = await fetchApi(`/missions/${id}/replay`, { method: "POST" });
      if (startRes.data?.started_at) {
          const st = new Date(startRes.data.started_at);
          setStartedAt(st);
          setTimerActive(true);
      }
      
      // Refresh mission/history
      const historyRes = await fetchApi(`/missions/${id}/history`);
      setHistory(historyRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to restart mission");
    } finally {
      setIsReplaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderDifficultyStars = (difficulty: string) => {
      const stars = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : difficulty === 'Hard' ? 3 : 1;
      return (
          <div className="flex">
              {[1, 2, 3].map(i => (
                  <span key={i} className={`text-lg ${i <= stars ? 'text-yellow-500' : 'text-slate-600'}`}>★</span>
              ))}
          </div>
      );
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!mission) return null;

  const isK8sMission = mission.category === 'Kubernetes';

  return (
    <div className="space-y-6">
      <Link href={`/levels/${mission.level_id}`} className="flex items-center text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Level
      </Link>
      
      <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col md:flex-row">
        
        {/* Main Left Column */}
        <div className="flex-1 border-r border-slate-700">
            {/* Header - Incident Style */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center">
                <div className="bg-red-500/20 p-3 rounded-lg mr-4 border border-red-500/30">
                  <AlertOctagon className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <div className="text-red-400 text-xs font-mono font-bold tracking-widest uppercase mb-1">INCIDENT REPORT // M-{String(mission.id).padStart(2, '0')}</div>
                  <h1 className="text-2xl font-bold text-slate-100">{mission.title}</h1>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Difficulty</span>
                    {renderDifficultyStars(mission.difficulty)}
                </div>
                
                {history.some(h => h.status === 'completed') && (
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs text-blue-400 uppercase font-bold tracking-widest">Personal Best</span>
                    <span className="font-mono text-blue-300 font-bold">
                      {formatTime(Math.min(...history.filter(h => h.status === 'completed' && h.duration != null).map(h => h.duration)))}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg shadow-inner">
                    <Clock className={`w-4 h-4 mr-2 ${timerActive ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={`font-mono font-bold text-lg ${timerActive ? 'text-slate-100' : 'text-slate-500'}`}>{formatTime(timer)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Main Content Area */}
              {!result ? (
                <>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Situation</h2>
                        <p className="text-slate-300 leading-relaxed">
                          {mission.description}
                        </p>
                      </div>
                      
                      <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Objective</h2>
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                          <p className="text-blue-100 font-medium">
                            {mission.objective}
                          </p>
                        </div>
                      </div>

                      {/* Hints Section */}
                      {mission.hints && mission.hints.length > 0 && (
                          <div>
                              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                  <Lightbulb className="w-4 h-4 mr-2" /> Hints ({hintsRevealed}/{mission.hints.length})
                              </h2>
                              <div className="space-y-2">
                                  {mission.hints.map((hint: string, idx: number) => (
                                      <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm">
                                          {idx < hintsRevealed ? (
                                              <span className="text-slate-300">{hint}</span>
                                          ) : idx === hintsRevealed ? (
                                              <button 
                                                  onClick={() => setHintsRevealed(h => h + 1)}
                                                  className="text-blue-400 hover:text-blue-300 font-bold"
                                              >
                                                  Reveal Hint {idx + 1}
                                              </button>
                                          ) : (
                                              <span className="text-slate-600 italic">Hint locked</span>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                    </div>
    
                    {/* Terminal Panel */}
                    <div className="bg-black rounded-lg border border-slate-700 p-4 font-mono text-sm shadow-inner relative overflow-hidden flex flex-col min-h-[300px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-slate-500 text-xs">terminal</div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 text-slate-300">
                        <p className="text-green-400">root@devops-arena:~# status check</p>
                        {isK8sMission ? (
                          <>
                            <p className="text-red-400">ERROR: Workload failing in namespace ns-challenges.</p>
                            <p className="text-slate-400 mt-4">-- INSTRUCTIONS --</p>
                            <p className="text-yellow-200">1. Open your local terminal.</p>
                            <p className="text-yellow-200">2. Use <span className="bg-slate-800 px-1 rounded text-white">kubectl</span> to investigate the issue.</p>
                            <p className="text-yellow-200">3. Apply the fix directly to the cluster.</p>
                            <p className="text-yellow-200">4. Click "Validate Fix" below when you think it is resolved.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-red-400">ERROR: Configuration issue detected.</p>
                            <p className="text-slate-400 mt-4">Provide the exact command, string, or fix required to resolve the issue in the input box below.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
    
                  {/* Action Area */}
                  <div className="pt-6 border-t border-slate-800">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                      {!isK8sMission && (
                        <input 
                          type="text" 
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="flex-1 bg-slate-950 text-green-400 font-mono p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter solution..."
                          required
                          disabled={submitting}
                        />
                      )}
                      <button 
                        type="submit" 
                        disabled={submitting || isReplaying}
                        className={`flex-1 sm:flex-none ${isK8sMission ? 'w-full' : ''} bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)]`}
                      >
                        {submitting ? (
                          <span className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Validating...</span>
                        ) : (
                          <span className="flex items-center"><Terminal className="w-5 h-5 mr-2" /> {isK8sMission ? 'Validate Fix' : 'Execute Fix'}</span>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Result Screen */
                <div className={`p-8 rounded-xl border flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  result.correct 
                    ? 'bg-emerald-900/20 border-emerald-500/50' 
                    : 'bg-red-900/20 border-red-500/50'
                }`}>
                  
                  {result.correct ? (
                    <>
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-emerald-400 mb-2">INCIDENT RESOLVED</h3>
                      <p className="text-slate-300 mb-8 max-w-md">
                        Excellent work. The system is back online and stable.
                      </p>
                      
                      {result.xp > 0 ? (
                        <div className="bg-slate-900 border border-emerald-500/30 px-6 py-4 rounded-lg mb-8 inline-flex items-center space-x-4">
                          <span className="text-emerald-500 font-bold">REWARD</span>
                          <span className="text-3xl font-bold text-yellow-400">+{result.xp} XP</span>
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-lg mb-8 inline-flex items-center space-x-4">
                          <span className="text-slate-400 font-bold">REPLAY</span>
                          <span className="text-xl font-bold text-slate-500">+0 XP</span>
                        </div>
                      )}
                      
                      {/* Stats Overview */}
                      <div className="flex gap-4 mb-8">
                         <div className={`border px-4 py-2 rounded-lg ${result.is_new_personal_best ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-950 border-slate-800'}`}>
                             <div className={`text-xs mb-1 ${result.is_new_personal_best ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>
                               {result.is_new_personal_best ? '🔥 NEW RECORD' : 'TIME'}
                             </div>
                             <div className={`font-mono ${result.is_new_personal_best ? 'text-yellow-400' : 'text-emerald-400'}`}>{formatTime(result.duration || timer)}</div>
                         </div>
                         <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg">
                             <div className="text-xs text-slate-500 mb-1">HINTS USED</div>
                             <div className="font-mono text-slate-300">{hintsRevealed}</div>
                         </div>
                      </div>
    
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={`/levels/${mission.level_id}`} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                          Continue Training
                        </Link>
                        <button 
                          onClick={handleReplay}
                          disabled={isReplaying}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <RotateCcw className={`w-5 h-5 mr-2 ${isReplaying ? 'animate-spin' : ''}`} /> 
                          {isReplaying ? 'Resetting...' : 'Replay Mission'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-red-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-red-400 mb-2">VALIDATION FAILED</h3>
                      <p className="text-slate-300 mb-8 max-w-md">
                        The incident is still ongoing. The issue has not been fully resolved.
                      </p>
                      
                      <div className="bg-slate-900 border border-red-500/30 px-6 py-4 rounded-lg mb-8 inline-flex items-center space-x-4">
                        <span className="text-red-500 font-bold">PENALTY</span>
                        <span className="text-3xl font-bold text-red-400">{result.xp} XP</span>
                      </div>
    
                      <button 
                        onClick={() => setResult(null)} 
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-bold transition-colors border border-slate-600"
                      >
                        Return to Terminal
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Right Sidebar - History */}
        <div className={`w-full md:w-80 bg-slate-900 ${showHistory ? 'block' : 'hidden md:block'}`}>
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                 <h2 className="text-sm font-bold text-slate-400 flex items-center"><History className="w-4 h-4 mr-2" /> Attempt History</h2>
                 <button className="md:hidden text-slate-500" onClick={() => setShowHistory(false)}>✕</button>
             </div>
             <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                 {history.length === 0 ? (
                     <div className="text-center text-slate-500 text-sm py-4">No previous attempts</div>
                 ) : (
                     history.map((h, i) => (
                         <div key={h.id} className={`p-3 rounded border text-sm ${h.status === 'completed' ? 'bg-emerald-900/10 border-emerald-900/50' : h.status === 'failed' ? 'bg-red-900/10 border-red-900/50' : 'bg-slate-800 border-slate-700'}`}>
                             <div className="flex justify-between items-center mb-1">
                                 <span className={`font-bold ${h.status === 'completed' ? 'text-emerald-400' : h.status === 'failed' ? 'text-red-400' : 'text-slate-300'}`}>
                                     {h.status.toUpperCase()}
                                 </span>
                                 <span className="text-xs text-slate-500">{new Date(h.started_at).toLocaleDateString()}</span>
                             </div>
                             {h.status !== 'started' && (
                                 <div className="flex justify-between text-xs text-slate-400 mt-2">
                                     <span>XP: {h.score}</span>
                                     <span>{formatTime(h.duration || 0)}</span>
                                 </div>
                             )}
                         </div>
                     ))
                 )}
             </div>
        </div>

        {/* Mobile History Toggle */}
        <button 
           className="md:hidden absolute right-0 top-1/2 transform -translate-y-1/2 bg-slate-800 p-2 rounded-l-lg border border-r-0 border-slate-700 shadow-lg"
           onClick={() => setShowHistory(true)}
        >
            <History className="w-5 h-5 text-slate-400" />
        </button>

      </div>
    </div>
  );
}
