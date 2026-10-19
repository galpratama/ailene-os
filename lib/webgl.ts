type DeviceHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// True when a worker can run WebGL2 on a hardware GPU (software GL takes seconds per shader) with enough memory and no data saver.
export function canRenderOffscreenWebGL(): boolean {
  const hints = navigator as DeviceHints;
  if (hints.connection?.saveData) return false;
  if (hints.deviceMemory !== undefined && hints.deviceMemory < 4) return false;
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return false;
  if (!("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return false;

  const gl = new OffscreenCanvas(1, 1).getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}
