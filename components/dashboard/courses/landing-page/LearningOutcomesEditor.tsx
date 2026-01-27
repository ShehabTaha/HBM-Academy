"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";

interface LearningOutcomesEditorProps {
  outcomes: string[];
  onChange: (outcomes: string[]) => void;
}

export default function LearningOutcomesEditor({
  outcomes,
  onChange,
}: LearningOutcomesEditorProps) {
  const [newOutcome, setNewOutcome] = useState("");

  const addOutcome = () => {
    if (newOutcome.trim() && outcomes.length < 8) {
      onChange([...outcomes, newOutcome.trim()]);
      setNewOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    onChange(outcomes.filter((_, i) => i !== index));
  };

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-primary-blue">
              {index + 1}
            </div>
            <Input
              value={outcome}
              onChange={(e) => updateOutcome(index, e.target.value)}
              className="flex-1 text-sm h-9"
              placeholder={`Outcome #${index + 1}`}
            />
            <button
              onClick={() => removeOutcome(index)}
              className="text-gray-400 transition-colors hover:text-red-500 p-1"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>

      {outcomes.length < 8 ? (
        <div className="flex gap-2">
          <Input
            value={newOutcome}
            onChange={(e) => setNewOutcome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOutcome()}
            placeholder="Add a learning outcome..."
            className="flex-1 text-sm h-9"
          />
          <Button
            type="button"
            onClick={addOutcome}
            disabled={!newOutcome.trim()}
            className="h-9 bg-primary-blue hover:bg-blue-700 text-white"
          >
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
      ) : (
        <p className="text-xs text-orange-500 bg-orange-50 p-2 rounded border border-orange-100 italic">
          Maximum of 8 learning outcomes reached.
        </p>
      )}

      <p className="text-[11px] text-gray-400">
        Best for: Listing concrete benefits or skills students will acquire.
      </p>
    </div>
  );
}
