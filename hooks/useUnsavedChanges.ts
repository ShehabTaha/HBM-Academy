import { useCallback, useEffect, useRef } from "react";
import { AccountSection } from "@/types/account";
import { useUnsavedChangesContext } from "@/contexts/UnsavedChangesContext";

/**
 * useUnsavedChanges — per-section draft state management.
 *
 * Usage:
 *   const { draftData, setDraft, isDirty, clearDraft } =
 *     useUnsavedChanges("profile", savedData);
 *
 * - draftData: the current in-progress draft (falls back to savedData)
 * - setDraft: call on every form change with the full form object
 * - isDirty: true if draft differs from savedData
 * - clearDraft: call on Save success or Cancel
 */
export function useUnsavedChanges<T extends Record<string, unknown>>(
  section: AccountSection,
  savedData: T
) {
  const { getDraft, setDraft, clearDraft, hasDraft } =
    useUnsavedChangesContext();

  const raw = getDraft(section) as T | null;
  const draftData: T = raw ?? savedData;
  const isDirty = hasDraft(section);

  const handleSetDraft = useCallback(
    (data: T) => {
      setDraft(section, data as Record<string, unknown>);
    },
    [section, setDraft]
  );

  const handleClearDraft = useCallback(() => {
    clearDraft(section);
  }, [section, clearDraft]);

  // Register beforeunload when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return {
    draftData,
    setDraft: handleSetDraft,
    isDirty,
    clearDraft: handleClearDraft,
  };
}
