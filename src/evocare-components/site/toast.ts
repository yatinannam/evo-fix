type ToastListener = (message: string, type: "success" | "info") => void;

let listener: ToastListener | null = null;

export function setSiteToastListener(fn: ToastListener | null) {
  listener = fn;
}

export function emitSiteToast(
  message: string,
  type: "success" | "info" = "info",
) {
  listener?.(message, type);
}
