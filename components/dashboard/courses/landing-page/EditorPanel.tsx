"use client";

import React from "react";
import HeroSectionEditor from "./HeroSectionEditor";
import ContentToggles from "./ContentToggles";
import LearningOutcomesEditor from "./LearningOutcomesEditor";
import FAQEditor from "./FAQEditor";
import StudentReviewsEditor from "./StudentReviewsEditor";
import SaveActions from "./SaveActions";
import { LandingPageSettings, FAQSchema } from "@/lib/validations/landingPage";
import { z } from "zod";

type FAQ = z.infer<typeof FAQSchema>;

interface EditorPanelProps {
  settings: LandingPageSettings;
  updateSettings: (updates: Partial<LandingPageSettings>) => void;
  uploadHeroImage: (file: File) => Promise<{ url: string; path: string }>;
  deleteHeroImage: (path: string) => Promise<boolean>;
  isDirty: boolean;
  save: () => Promise<void>;
  discard: () => void;
  loading: boolean;
}

export default function EditorPanel({
  settings,
  updateSettings,
  uploadHeroImage,
  deleteHeroImage,
  isDirty,
  save,
  discard,
  loading,
}: EditorPanelProps) {
  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Landing Page Editor
        </h1>
        <p className="text-sm text-gray-500">
          Customize how your course landing page looks to potential students.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            1. Hero Section
          </h2>
          <HeroSectionEditor
            settings={settings}
            updateSettings={updateSettings}
            uploadHeroImage={uploadHeroImage}
            deleteHeroImage={deleteHeroImage}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            2. Content Visibility
          </h2>
          <ContentToggles settings={settings} updateSettings={updateSettings} />
        </section>

        {settings.show_learning_outcomes && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              3. Learning Outcomes
            </h2>
            <LearningOutcomesEditor
              outcomes={settings.learning_outcomes || []}
              onChange={(outcomes: string[]) =>
                updateSettings({ learning_outcomes: outcomes })
              }
            />
          </section>
        )}

        {settings.show_faqs && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              4. FAQs
            </h2>
            <FAQEditor
              faqs={(settings.faqs as FAQ[]) || []}
              onChange={(faqs: FAQ[]) => updateSettings({ faqs })}
            />
          </section>
        )}

        {settings.show_reviews && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Student Reviews
            </h2>
            <StudentReviewsEditor
              settings={settings}
              updateSettings={updateSettings}
            />
          </section>
        )}
      </div>

      {/* Floating Save Actions */}
      <SaveActions
        isDirty={isDirty}
        onSave={save}
        onDiscard={discard}
        loading={loading}
      />
    </div>
  );
}
