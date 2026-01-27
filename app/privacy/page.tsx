import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | HBM Academy",
  description: "Privacy policy and data protection practices at HBM Academy.",
};

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-2 text-gray-600">
            <Link href="/auth/login" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-primary-blue">
                <Lock size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: January 27, 2026
            </p>

            <div className="prose prose-blue prose-sm max-w-none text-gray-600 space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us when you
                  create an account, such as your name, email address, and
                  profile details. We also collect data about your interactions
                  with the platform, including course progress and quiz results.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. How We Use Your Information
                </h2>
                <p>
                  Your information is used to provide, maintain, and improve our
                  services. This includes personalizing your learning
                  experience, processing payments, sending service updates, and
                  communicating with you about your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Data Security
                </h2>
                <p>
                  We implement industry-standard security measures to protect
                  your personal information from unauthorized access,
                  alteration, or disclosure. However, no method of transmission
                  over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Cookies and Tracking
                </h2>
                <p>
                  We use cookies and similar technologies to enhance your
                  experience, analyze usage patterns, and remember your
                  preferences. You can control cookie settings through your
                  browser.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Third-Party Services
                </h2>
                <p>
                  We may share information with trusted third-party service
                  providers (such as payment processors and hosting services)
                  who assist us in operating the platform, subject to strict
                  confidentiality agreements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  6. Your Rights
                </h2>
                <p>
                  You have the right to access, correct, or delete your personal
                  information. You can manage most of your data through your
                  account settings or by contacting us directly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  7. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any significant changes by posting the new
                  policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  8. Contact Information
                </h2>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy, please contact us at privacy@hbmacademy.com.
                </p>
              </section>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 HBM Academy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
