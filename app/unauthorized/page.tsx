import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <ShieldAlert
              className="h-12 w-12 text-red-600"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-600">
            This dashboard is restricted to authorized administrators only. If
            you believe you should have access, please contact the platform
            owner to be added to the allowlist.
          </p>
        </div>
        <div className="pt-6">
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </div>
        <div className="mt-8">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} HBM Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
