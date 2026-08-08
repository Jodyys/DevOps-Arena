"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function LevelDetail() {
  const { id } = useParams();
  const [level, setLevel] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await fetchApi(`/levels/${id}`);
        setLevel(res.data);
      } catch (error) {
        console.error(error);
        router.push("/levels");
      }
    };
    if (id) fetchLevel();
  }, [id, router]);

  if (!level) return <div className="p-8 bg-slate-900 min-h-screen text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/levels" className="text-blue-400 hover:underline mb-4 inline-block">&larr; Back to Levels</Link>
          <h1 className="text-4xl font-bold mb-2">{level.name}</h1>
          <p className="text-xl text-slate-400">{level.description}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Missions</h2>
        <div className="grid gap-4">
          {level.missions.map((mission: any) => (
            <div key={mission.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{mission.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{mission.description}</p>
                <div className="mt-2 text-xs text-yellow-500 font-semibold">{mission.difficulty}</div>
              </div>
              <Link 
                href={`/missions/${mission.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors shrink-0 ml-4"
              >
                Start Mission
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
