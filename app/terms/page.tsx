import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | HBM Academy",
  description: "Terms and conditions for using the HBM Academy platform.",
};

const TermsPage = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: January 27, 2026
            </p>

            <div className="prose prose-blue prose-sm max-w-none text-gray-600 space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using the HBM Academy platform ("the
                  Service"), you agree to be bound by these Terms of Service. If
                  you do not agree to all of these terms, do not use the
                  Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Description of Service
                </h2>
                <p>
                  HBM Academy provides an online platform for course creation,
                  management, and learning. We reserve the right to modify or
                  discontinue the Service at any time without notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. User Accounts
                </h2>
                <p>
                  To access certain features, you must register for an account.
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activities that occur
                  under your account. You must notify us immediately of any
                  unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Content and Intellectual Property
                </h2>
                <p>
                  All content provided through the Service, including videos,
                  text, and materials, is the property of HBM Academy or its
                  licensors and is protected by intellectual property laws. You
                  are granted a limited, non-exclusive license to access content
                  for personal, non-commercial use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. User Conduct
                </h2>
                <p>
                  You agree not to use the Service for any unlawful purpose or
                  to engage in any conduct that disrupts or interferes with the
                  Service. This includes, but is not limited to, attempted
                  unauthorized access or distribution of copyrighted material.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  6. Limitation of Liability
                </h2>
                <p>
                  HBM Academy shall not be liable for any indirect, incidental,
                  special, or consequential damages resulting from the use or
                  inability to use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  7. Changes to Terms
                </h2>
                <p>
                  We may update these Terms of Service from time to time. Your
                  continued use of the Service after such changes constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  8. Contact Us
                </h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at support@hbmacademy.com.
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

export default TermsPage;
