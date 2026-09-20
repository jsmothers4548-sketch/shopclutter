// Enforced capitalization helpers — transform values in code so behavior
// is identical on mobile and desktop (keyboard autocapitalize hints are ignored by many keyboards).

export function applySentenceCase(value) {
  return value.replace(
    /(^\s*[a-z])|([.!?]\s+[a-z])/g,
    (m) => m.toUpperCase()
  );
}

export function applyWordCase(value) {
  return value.replace(/(^|[\s\-'])([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}