import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          Welcome to <span className="text-blue-500">DevOps Arena</span>
        </h1>
        <p className="text-xl text-slate-300">
          The ultimate platform to learn DevOps end-to-end through interactive challenges.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md font-semibold transition-colors">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
