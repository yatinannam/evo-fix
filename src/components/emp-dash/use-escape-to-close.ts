'use client';

import { useEffect } from 'react';

/** Closes a modal on Escape while it's open. Shared across every emp-dash modal for consistent behavior. */
export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
