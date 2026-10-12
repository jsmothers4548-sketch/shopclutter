// Scroll the window back to a remembered position.
//
// A screen usually grows after it renders (its data arrives a moment later), so
// the first scroll attempt can land short and get clamped. Retry briefly until
// the position sticks. If the person scrolls or presses a key during that short
// window, their input wins and the retries stop.
//
// Returns a cleanup function that cancels any pending retries.
export function restoreScroll(y) {
  if (!y) return () => {};

  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };

  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('keydown', cancel);

  const timers = [0, 60, 140, 280, 480, 750, 1050, 1400].map((delay) =>
    window.setTimeout(() => {
      if (!cancelled) window.scrollTo(0, y);
    }, delay)
  );

  return () => {
    cancelled = true;
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', cancel);
  };
}