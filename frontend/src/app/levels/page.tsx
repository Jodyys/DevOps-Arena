"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function Levels() {
  const [levels, setLevels] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetchApi("/levels");
        setLevels(res.data);
      } catch (error) {
        // Handle unauthorized
        router.push("/login");
      }
    };
    fetchLevels();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Training Grounds</h1>
          <Link href="/dashboard" className="text-blue-400 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="grid gap-6">
          {levels.map((level) => (
            <Link 
              href={`/levels/${level.id}`} 
              key={level.id}
              className={`block bg-slate-800 p-6 rounded-lg shadow-md border transition-all hover:scale-[1.01] ${
                level.status === 'locked' ? 'border-slate-700 opacity-50 cursor-not-allowed' : 'border-blue-500/30 hover:border-blue-500 cursor-pointer'
              }`}
              onClick={(e) => { if (level.status === 'locked') e.preventDefault(); }}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold">{level.name}</h2>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                  level.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                  level.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {level.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 mb-4">{level.description}</p>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Category: {level.category}</span>
                <span>•</span>
                <span>Reward: {level.xp_reward} XP</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
