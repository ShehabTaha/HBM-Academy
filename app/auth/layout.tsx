export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Auth Form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>

      {/* Right Side - Decorative (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-zinc-900 border-l">
        <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
          {/* Placeholder for optional Hero Image or graphics */}
          <div className="rounded-2xl bg-zinc-800/50 p-8">
            <h2 className="text-3xl font-bold tracking-tight">HBM Academy</h2>
            <p className="mt-4 text-zinc-400">
              Transform your career with expert-led courses and a supportive
              community.
            </p>
          </div>
        </div>
        <div className="text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} HBM Academy. All rights reserved.
        </div>
      </div>
    </div>
  );
}
