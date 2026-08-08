"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.success) {
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Login</h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-slate-300 mb-2 text-sm">Email</label>
          <input 
            type="email" 
            className="w-full bg-slate-700 text-white rounded p-3 outline-none focus:ring-2 focus:ring-blue-500" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block text-slate-300 mb-2 text-sm">Password</label>
          <input 
            type="password" 
            className="w-full bg-slate-700 text-white rounded p-3 outline-none focus:ring-2 focus:ring-blue-500" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors">
          Sign In
        </button>
        <p className="mt-4 text-center text-slate-400 text-sm">
          Don't have an account? <Link href="/register" className="text-blue-400 hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}
