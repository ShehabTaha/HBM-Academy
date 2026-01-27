"use client";

import React from "react";
import Image from "next/image";
import { LandingPageSettings } from "@/lib/validations/landingPage";
import {
  Star,
  CheckCircle2,
  User,
  PlayCircle,
  BookOpen,
  Clock,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

interface LandingPagePreviewProps {
  settings: LandingPageSettings;
  viewport?: "desktop" | "tablet" | "mobile";
}

export default function LandingPagePreview({
  settings,
  viewport = "desktop",
}: LandingPagePreviewProps) {
  const {
    hero_background_type,
    hero_background_image_url,
    hero_background_color,
    hero_gradient,
    hero_image_adjustments,
    hero_subtitle,
    hero_cta_text,
    show_instructor_in_hero,
    show_overview,
    show_learning_outcomes,
    show_curriculum,
    show_instructor,
    show_reviews,
    show_faqs,
    learning_outcomes,
    faqs,
  } = settings;

  // Hero Style
  const getHeroStyle = (): React.CSSProperties => {
    if (hero_background_type === "image" && hero_background_image_url) {
      const adj = hero_image_adjustments || {
        brightness: 100,
        contrast: 100,
        overlayOpacity: 30,
        overlayColor: "#000000",
      };
      return {
        backgroundImage: `url(${hero_background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: `brightness(${adj.brightness}%) contrast(${adj.contrast}%)`,
      };
    }
    if (hero_background_type === "color") {
      return { backgroundColor: hero_background_color || "#3b82f6" };
    }
    if (hero_background_type === "gradient" && hero_gradient) {
      return {
        background: `linear-gradient(${hero_gradient.direction}, ${hero_gradient.color1}, ${hero_gradient.color2})`,
      };
    }
    return { backgroundColor: "#3b82f6" };
  };

  const getOverlayStyle = (): React.CSSProperties => {
    if (hero_background_type !== "image") return {};
    const adj = hero_image_adjustments || {
      overlayOpacity: 30,
      overlayColor: "#000000",
    };
    return {
      backgroundColor: adj.overlayColor,
      opacity: adj.overlayOpacity / 100,
    };
  };

  return (
    <div className="w-full bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section
        className="relative min-h-[400px] w-full flex flex-col items-center justify-center text-center px-6 py-20"
        style={getHeroStyle()}
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={getOverlayStyle()}
        />

        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
          <div className="bg-blue-600/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
            Course Preview
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Master the Art of Modern Web Design
          </h1>
          <p className="text-lg md:text-xl text-blue-50/90 font-medium">
            {hero_subtitle ||
              "Learn everything you need to know about designing premium digital experiences from scratch."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">
              {hero_cta_text || "Enroll Now"}
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              Watch Trailer
            </button>
          </div>

          {show_instructor_in_hero && (
            <div className="flex items-center gap-3 mt-6">
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-md">
                <User className="w-full h-full p-2 text-gray-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-blue-100/80 font-medium uppercase tracking-tighter">
                  Your Instructor
                </p>
                <p className="text-sm text-white font-bold">Shehab Taha</p>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* 2. COURSE OVERVIEW */}
      {show_overview && (
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: <Clock className="text-blue-500" />,
                label: "32 Hours",
                sub: "Course Content",
              },
              {
                icon: <BookOpen className="text-purple-500" />,
                label: "85 Lessons",
                sub: "Comprehensive",
              },
              {
                icon: <PlayCircle className="text-green-500" />,
                label: "Full Access",
                sub: "Lifetime",
              },
              {
                icon: <Star className="text-orange-500" />,
                label: "4.9 Rating",
                sub: "Student Reviews",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gray-50 text-center"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm mb-1">
                  {stat.icon}
                </div>
                <div className="font-bold text-xl">{stat.label}</div>
                <div className="text-xs text-gray-500 font-medium">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-6">About this Course</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              This comprehensive course is designed for aspiring designers and
              developers who want to push the boundaries of digital interfaces.
              We dive deep into typography, color theory, layout composition,
              and interactive elements.
            </p>
          </div>
        </section>
      )}
      {/* 3. WHAT YOU'LL LEARN */}
      {show_learning_outcomes && (
        <section className="py-20 bg-gray-900 text-white px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {(learning_outcomes?.length
                ? learning_outcomes
                : [
                    "Master modern typography & grids",
                    "Build responsive layouts from scratch",
                    "Create stunning visual hierarchies",
                    "Optimizing performance & accessibility",
                  ]
              ).map((outcome, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                >
                  <CheckCircle2
                    className="text-blue-400 mt-1 shrink-0"
                    size={20}
                  />
                  <p className="text-lg font-medium text-gray-100">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* 4. CURRICULUM PREVIEW */}
      {show_curriculum && (
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Course Content</h2>
          <div className="space-y-4">
            {[
              { title: "Introduction to Design Principles", lessons: 5 },
              { title: "Advanced Typography Mastery", lessons: 12 },
              { title: "Color Psychology & Implementation", lessons: 8 },
            ].map((section, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between p-5 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold border shadow-sm">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-lg">{section.title}</h3>
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    {section.lessons} lessons
                  </span>
                </div>
                <div className="p-4 bg-white border-t border-gray-50 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                    <PlayCircle size={16} />
                    <span>Welcome to the course</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <BookOpen size={16} />
                    <span>Design Thinking 101</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 text-blue-600 font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
            View full curriculum <ChevronRight size={20} />
          </button>
        </section>
      )}
      {/* 6. REVIEWS */}
      {show_reviews && (
        <section className="py-20 bg-blue-50 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              Student Success Stories
            </h2>
            <div
              className={`grid gap-8 ${
                viewport === "mobile"
                  ? "grid-cols-1"
                  : viewport === "tablet"
                    ? "grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {(settings.reviews_source === "manual" &&
              settings.manual_reviews?.length
                ? settings.manual_reviews
                : [
                    {
                      name: "John Doe",
                      role: "UX Designer",
                      comment:
                        "This course completely changed my approach to design. The layout module is purely gold!",
                      rating: 5,
                    },
                    {
                      name: "Sarah Smith",
                      role: "Frontend Developer",
                      comment:
                        "I finally understand how to merge aesthetics with code perfectly. Highly recommended!",
                      rating: 5,
                    },
                    {
                      name: "Alex Johnson",
                      role: "Creative Director",
                      comment:
                        "Premium content. The best investment I've made in my career this year.",
                      rating: 5,
                    },
                  ]
              ).map((review: any, i: number) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl shadow-xl shadow-blue-200/20 flex flex-col gap-4 ${
                    viewport === "mobile" ? "p-6 text-center" : "p-8 text-left"
                  }`}
                >
                  <div
                    className={`flex gap-1 ${
                      viewport === "mobile" ? "justify-center" : ""
                    }`}
                  >
                    {[...Array(review.rating || 5)].map((_, s) => (
                      <Star
                        key={s}
                        size={20}
                        className="fill-orange-400 text-orange-400 shrink-0"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic break-words">
                    "{review.comment || review.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-2 border-t pt-4 justify-center md:justify-start">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {review.avatar ? (
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        review.name.charAt(0)
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-gray-900">
                        {review.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {review.role || "Student"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {settings.reviews_source === "database" && (
              <p className="mt-8 text-sm text-gray-500 italic">
                * Displaying a preview of reviews. Actual student reviews from
                the database will be shown here.
              </p>
            )}
          </div>
        </section>
      )}
      {/* 7. FAQs */}
      {show_faqs && (
        <section className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {(faqs?.length
              ? faqs
              : [
                  {
                    question: "Do I get a certificate?",
                    answer:
                      "Yes! Upon successful completion of the course, you'll receive a verifiable digital certificate.",
                  },
                  {
                    question: "Is this course for beginners?",
                    answer:
                      "While some foundational knowledge is helpful, we cover everything you need from scratch.",
                  },
                ]
            ).map((faq, i) => (
              <div key={i} className="py-6">
                <button className="flex w-full items-center justify-between text-left font-bold text-lg hover:text-blue-600 transition-colors">
                  <span>{faq.question}</span>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-gray-50 p-8 rounded-3xl text-center flex flex-col items-center gap-4">
            <MessageCircle className="text-blue-600" size={32} />
            <h3 className="font-bold text-xl">Still have questions?</h3>
            <p className="text-gray-500">
              We're here to help you make the right choice for your career.
            </p>
            <button className="text-blue-600 font-bold hover:underline">
              Contact Support
            </button>
          </div>
        </section>
      )}
      {/* 8. FINAL CTA */}
      <section className="py-20 px-6 bg-primary-blue text-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to transform your skills?
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          Join 1,240+ students already mastering modern web design and building
          stunning digital products.
        </p>
        <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform">
          Get Started Now
        </button>
      </section>
      {/* FOOTER PREVIEW */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50 flex flex-col items-center gap-6">
        <Image
          src="/logo.svg"
          alt="HBM Academy"
          width={150}
          height={40}
          className="object-contain"
        />
        <p className="text-xs text-gray-400">
          © 2026 HBM Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
