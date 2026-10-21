/** showToast('Link disalin') — shows the shared Toast (mounted once in BaseLayout). Client-side only. */
export function showToast(message: string, ms = 3000): void {
  window.dispatchEvent(new CustomEvent('toast:show', { detail: { message, ms } }));
}
