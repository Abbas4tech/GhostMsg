const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Keyboard shortcuts must never fire while typing in a field, while a dialog
 * is open, or with ⌘/Ctrl/Alt held (those belong to the browser and ⌘K).
 * Shift is allowed: it's part of keys like ⇧B, ⇧C, # and ?.
 */
export function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  ) {
    return true;
  }
  const target = event.target as HTMLElement | null;
  if (target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable)) {
    return true;
  }
  return Boolean(
    document.querySelector('[role="dialog"], [role="alertdialog"]')
  );
}
