import { useCallback } from "react";
import { AccountSection } from "@/types/account";
import { useUnsavedChangesContext } from "@/contexts/UnsavedChangesContext";

/**
 * useNavigationGuard — intercepts in-app section changes when any section is dirty.
 *
 * Usage in AccountPage:
 *   const { guardedSectionChange } = useNavigationGuard();
 *   // Pass guardedSectionChange to Sidebar instead of raw setActiveSection
 */
export function useNavigationGuard() {
  const { anyDirty, setPendingNav } = useUnsavedChangesContext();

  /**
   * Wraps a navigation action with a dirty-state guard.
   * If dirty → store the action in pendingNav and show the modal.
   * If clean → execute immediately.
   */
  const guardedNavigate = useCallback(
    (action: () => void) => {
      if (anyDirty) {
        setPendingNav(() => action);
      } else {
        action();
      }
    },
    [anyDirty, setPendingNav]
  );

  const guardedSectionChange = useCallback(
    (
      section: AccountSection,
      setActive: (s: AccountSection) => void
    ) => {
      guardedNavigate(() => setActive(section));
    },
    [guardedNavigate]
  );

  return { guardedNavigate, guardedSectionChange };
}
