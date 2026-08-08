"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchApi("/auth/me");
        setUser(res.data);
      } catch (error) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">DevOps Arena</h1>
        <div className="flex items-center gap-4">
          <span>{user.username}</span>
          <button 
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className="text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 p-4">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total XP</h3>
            <p className="text-4xl font-bold text-blue-500">{user.total_xp}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Rank</h3>
            <p className="text-4xl font-bold text-yellow-500">Unranked</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Achievements</h3>
            <p className="text-4xl font-bold text-purple-500">0 / 3</p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
          <h3 className="text-xl font-bold mb-4">Jump Back In</h3>
          <p className="text-slate-300 mb-6">Ready to tackle more DevOps challenges?</p>
          <Link href="/levels" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors">
            View Levels
          </Link>
        </div>
      </main>
    </div>
  );
}
