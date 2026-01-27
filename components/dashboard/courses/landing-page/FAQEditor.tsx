"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface FAQEditorProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

export default function FAQEditor({ faqs, onChange }: FAQEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addFAQ = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newFAQ = {
      id: newId,
      question: "",
      answer: "",
      order: faqs.length,
    };
    onChange([...faqs, newFAQ]);
    setExpandedId(newId);
  };

  const removeFAQ = (id: string) => {
    onChange(faqs.filter((f) => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateFAQ = (id: string, updates: Partial<FAQ>) => {
    onChange(faqs.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <div
              className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                expandedId === faq.id
                  ? "bg-gray-50 border-b"
                  : "bg-white hover:bg-gray-50"
              }`}
              onClick={() =>
                setExpandedId(expandedId === faq.id ? null : faq.id)
              }
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xs font-bold text-gray-400 min-w-[20px]">
                  Q:
                </span>
                <span className="truncate text-sm font-medium text-gray-700">
                  {faq.question || (
                    <span className="text-gray-400 italic">Empty Question</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFAQ(faq.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash size={14} />
                </button>
                {expandedId === faq.id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </div>

            {expandedId === faq.id && (
              <div className="bg-white p-4 flex flex-col gap-4 animate-in slide-in-from-top-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Question
                  </label>
                  <Input
                    value={faq.question}
                    onChange={(e) =>
                      updateFAQ(faq.id, { question: e.target.value })
                    }
                    className="text-sm"
                    placeholder="e.g. Is there a money-back guarantee?"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Answer
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) =>
                      updateFAQ(faq.id, { answer: e.target.value })
                    }
                    className="min-h-[100px] w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-primary-blue"
                    placeholder="Enter the answer here..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addFAQ}
        className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-primary-blue hover:text-primary-blue transition-all"
      >
        <Plus size={16} className="mr-2" /> Add FAQ Item
      </Button>
    </div>
  );
}
