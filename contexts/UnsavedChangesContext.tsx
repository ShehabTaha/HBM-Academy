"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AccountSection } from "@/types/account";

type DraftStore = Partial<Record<AccountSection, Record<string, unknown>>>;

interface UnsavedChangesContextValue {
  draftStore: DraftStore;
  setDraft: (section: AccountSection, data: Record<string, unknown>) => void;
  clearDraft: (section: AccountSection) => void;
  clearAllDrafts: () => void;
  getDraft: (
    section: AccountSection
  ) => Record<string, unknown> | null;
  hasDraft: (section: AccountSection) => boolean;
  anyDirty: boolean;
  /** Pending navigation that is being guarded */
  pendingNav: (() => void) | null;
  setPendingNav: (fn: (() => void) | null) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(
  null
);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draftStore, setDraftStore] = useState<DraftStore>({});
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

  const setDraft = useCallback(
    (section: AccountSection, data: Record<string, unknown>) => {
      setDraftStore((prev) => ({ ...prev, [section]: data }));
    },
    []
  );

  const clearDraft = useCallback((section: AccountSection) => {
    setDraftStore((prev) => {
      const next = { ...prev };
      delete next[section];
      return next;
    });
  }, []);

  const clearAllDrafts = useCallback(() => setDraftStore({}), []);

  const getDraft = useCallback(
    (section: AccountSection) => draftStore[section] ?? null,
    [draftStore]
  );

  const hasDraft = useCallback(
    (section: AccountSection) => Boolean(draftStore[section]),
    [draftStore]
  );

  const anyDirty = Object.keys(draftStore).length > 0;

  return (
    <UnsavedChangesContext.Provider
      value={{
        draftStore,
        setDraft,
        clearDraft,
        clearAllDrafts,
        getDraft,
        hasDraft,
        anyDirty,
        pendingNav,
        setPendingNav,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesContext() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error(
      "useUnsavedChangesContext must be used inside UnsavedChangesProvider"
    );
  }
  return ctx;
}
