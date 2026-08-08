"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function MissionDetail() {
  const { id } = useParams();
  const [mission, setMission] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await fetchApi(`/missions/${id}`);
        setMission(res.data);
        // Automatically start mission
        await fetchApi(`/missions/${id}/start`, { method: "POST" });
      } catch (error) {
        console.error(error);
      }
    };
    if (id) fetchMission();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetchApi(`/missions/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!mission) return <div className="p-8 bg-slate-900 min-h-screen text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/levels/${mission.level_id}`} className="text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Level</Link>
        
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-950 p-6 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{mission.title}</h1>
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase rounded">
                {mission.difficulty}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-300 mb-2">Scenario</h2>
              <p className="text-slate-100 bg-slate-900 p-4 rounded font-mono text-sm leading-relaxed border border-slate-700">
                {mission.description}
              </p>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-slate-300 mb-2">Objective</h2>
              <p className="text-slate-300">
                {mission.objective}
              </p>
            </div>

            {result ? (
              <div className={`p-6 rounded-lg text-center ${result.correct ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'}`}>
                <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
                  {result.correct ? 'Mission Accomplished!' : 'Mission Failed'}
                </h3>
                <p className="text-lg mb-4">You earned {result.xp} XP</p>
                {result.correct ? (
                  <Link href={`/levels/${mission.level_id}`} className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors">
                    Continue to Next Mission
                  </Link>
                ) : (
                  <button onClick={() => setResult(null)} className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-semibold transition-colors">
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 bg-slate-900 p-6 rounded border border-slate-700">
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <label className="block text-slate-300 font-bold mb-2">Your Solution / Command</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1 bg-slate-950 text-green-400 font-mono p-3 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="Enter the fix..."
                    required
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold rounded transition-colors">
                    Execute
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
