// Runs work once the page has loaded and the main thread is idle, so it never competes with first paint or hydration.
export function runAfterLoadIdle(callback: () => void, timeout = 3000): () => void {
  let cancelled = false;
  const run = () => {
    if (!cancelled) callback();
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout });
    else setTimeout(run, 1);
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
  };
}
