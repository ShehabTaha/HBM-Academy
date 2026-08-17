import { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login | HBM Academy",
  description: "Private HBM Academy administrator portal",
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="HBM Academy" width={42} height={42} />
            <div>
              <p className="text-lg font-semibold leading-tight">HBM Academy</p>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="max-w-2xl py-20">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Private administrator access
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
              Staff access for managing courses, students, analytics, payments,
              messages, and academy operations.
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} HBM Academy. Restricted access.
          </p>
        </section>

        <section className="flex items-center justify-center border-t border-white/10 bg-white px-6 py-12 text-zinc-950 lg:border-l lg:border-t-0">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Administrator
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Sign in
              </h2>
            </div>
            <Suspense fallback={<div className="text-sm text-zinc-500">Loading...</div>}>
              <AdminLoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
