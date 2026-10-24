/**
 * Client-side controller for ModelStage (plan 2.1). Imported by components' <script> tags.
 * model-viewer is loaded with a dynamic import() only when a stage actually starts.
 * One Stage per .stage element; the hero switcher calls stage.swap() to change src on the same viewer.
 */
let mvPromise: Promise<unknown> | null = null;
export function loadModelViewer(): Promise<unknown> {
  return (mvPromise ??= import('@google/model-viewer'));
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = () => matchMedia('(pointer: coarse)').matches;
const stages = new WeakMap<HTMLElement, Stage>();
export const getStage = (el: HTMLElement) => stages.get(el);

export interface SwapOpts { glb: string; usdz?: string; photoSrc?: string; photoSrcset?: string; alt: string }

class Stage {
  el: HTMLElement;
  viewer: any = null;
  started = false;
  glb: string;
  usdz?: string;
  private timeout = 0;
  private loadingTimer = 0;
  private launchTimer = 0;
  private warnedNoUsdz = false;
  private arBound = false;

  constructor(el: HTMLElement) {
    this.el = el;
    this.glb = el.dataset.glb ?? '';
    this.usdz = el.dataset.usdz || undefined;
    stages.set(el, this);
  }
  private q<T extends HTMLElement>(sel: string) { return this.el.querySelector<T>(sel); }
  private say(msg: string) { const s = this.q('[data-status]'); if (s) s.textContent = msg; }
  private setState(s: string) { this.el.dataset.state = s; }

  /** Begin loading the model (idempotent). */
  async start() {
    if (!this.glb || this.started) return;
    this.started = true;
    this.begin();
  }

  private async begin() {
    this.setState('loading');
    const timeoutMs = Number(this.el.dataset.timeoutMs) || 15000;
    this.loadingTimer = window.setTimeout(() => this.el.classList.add('is-loading-visible'), 400); // avoids flicker
    this.timeout = window.setTimeout(() => this.fail('timeout'), timeoutMs);
    try { await loadModelViewer(); } catch { return this.fail('script'); }
    if (this.el.dataset.state !== 'loading') return;
    this.mount();
  }

  private mount() {
    const v = document.createElement('model-viewer') as any;
    v.className = 'stage__viewer';
    v.setAttribute('src', this.glb);
    if (this.usdz) v.setAttribute('ios-src', this.usdz);
    else if (import.meta.env.DEV && !this.warnedNoUsdz) { this.warnedNoUsdz = true; console.info(`[stage] ${this.glb} has no .usdz: iOS will not get AR.`); }
    v.setAttribute('alt', this.el.dataset.alt ?? '');
    v.setAttribute('ar', '');
    // scene-viewer first: Google's own AR app (floor lock, shutter, menu). webxr is the bare in-browser fallback. iOS uses quick-look.
    v.setAttribute('ar-modes', 'scene-viewer webxr quick-look');
    v.setAttribute('camera-controls', '');
    v.setAttribute('touch-action', 'pan-y');
    v.setAttribute('shadow-intensity', '1');
    v.setAttribute('interaction-prompt', 'none');
    if (this.el.dataset.autorotate === 'true' && !reduced()) v.setAttribute('auto-rotate', '');

    const ar = this.q<HTMLElement>('[data-ar]');
    if (ar) { ar.setAttribute('slot', 'ar-button'); v.append(ar); if (!this.arBound) { this.arBound = true; ar.addEventListener('click', () => this.launch()); } }

    v.addEventListener('progress', (e: any) => {
      const p = Math.round((e.detail?.totalProgress ?? 0) * 100);
      const bar = this.q<HTMLElement>('[data-progress]');
      if (bar) bar.style.width = `${p}%`;
    });
    v.addEventListener('load', () => this.ready());
    v.addEventListener('error', () => this.fail('error'));
    v.addEventListener('ar-status', () => this.clearLaunch());
    v.addEventListener('pointerdown', () => { const h = this.q('[data-hint]'); if (h) h.hidden = true; }, { once: true });

    this.q('[data-viewer-host]')?.append(v);
    this.viewer = v;
  }

  private ready() {
    window.clearTimeout(this.timeout); window.clearTimeout(this.loadingTimer);
    this.el.classList.remove('is-loading-visible');
    this.setState('ready');
    this.say('Model 3D siap');
    const hint = this.q('[data-hint]'); if (hint) hint.hidden = false;
    // canActivateAR is resolved just after load.
    requestAnimationFrame(() => {
      const ar = this.q<HTMLElement>('[data-ar]');
      const qr = this.q<HTMLElement>('[data-qr-trigger]');
      if (this.viewer?.canActivateAR) { ar?.setAttribute('data-state', 'ready'); }
      else if (!coarse()) { qr?.setAttribute('data-state', 'ready'); }   // desktop: offer the phone QR
      // a phone that cannot do AR (e.g. iPhone with no .usdz) simply gets no AR affordance
    });
  }

  /** Remove the model, show the photo, tell the parent. No raw error text, no layout shift. */
  fail(reason: string) {
    if (this.el.dataset.state === 'failed') return;
    window.clearTimeout(this.timeout); window.clearTimeout(this.loadingTimer);
    this.restoreAr();
    this.viewer?.remove(); this.viewer = null;
    this.el.classList.remove('is-loading-visible');
    this.q('[data-ar]')?.setAttribute('data-state', 'hidden');
    this.q('[data-qr-trigger]')?.setAttribute('data-state', 'hidden');
    const hint = this.q('[data-hint]'); if (hint) hint.hidden = true;
    this.setState('failed');
    this.say('Pratinjau 3D tidak tersedia, menampilkan foto');
    this.el.dataset.failReason = reason;
    this.el.dispatchEvent(new CustomEvent('stage:failed', { bubbles: true, detail: { reason } }));
  }

  /** Put the AR button back in the stage before the viewer is removed, so a later swap() can reuse it. */
  private restoreAr() {
    const ar = this.viewer?.querySelector('[data-ar]');
    if (ar) { ar.removeAttribute('slot'); this.q('.stage__actions')?.prepend(ar); }
  }

  private launch() {
    const o = this.q('[data-launch]'); if (!o) return;
    o.hidden = false;
    window.clearTimeout(this.launchTimer);
    this.launchTimer = window.setTimeout(() => this.clearLaunch(), 4000);
    document.addEventListener('visibilitychange', () => this.clearLaunch(), { once: true });
  }
  private clearLaunch() {
    window.clearTimeout(this.launchTimer);
    const o = this.q('[data-launch]'); if (o) o.hidden = true;
  }

  /** Hero switcher: change the model on the SAME viewer (never two viewers). */
  swap(o: SwapOpts) {
    this.glb = o.glb; this.usdz = o.usdz;
    this.el.dataset.glb = o.glb; this.el.dataset.usdz = o.usdz ?? ''; this.el.dataset.alt = o.alt;
    const img = this.q<HTMLImageElement>('.stage__photo');
    if (img && o.photoSrc) { img.src = o.photoSrc; img.removeAttribute('srcset'); img.alt = o.alt; }
    window.clearTimeout(this.timeout); window.clearTimeout(this.loadingTimer);
    this.q('[data-ar]')?.setAttribute('data-state', 'hidden');
    this.q('[data-qr-trigger]')?.setAttribute('data-state', 'hidden');
    this.el.dataset.failReason = '';
    if (this.viewer) {
      this.setState('loading');
      this.viewer.setAttribute('alt', o.alt);
      if (o.usdz) this.viewer.setAttribute('ios-src', o.usdz); else this.viewer.removeAttribute('ios-src');
      this.viewer.setAttribute('src', o.glb);
      const timeoutMs = Number(this.el.dataset.timeoutMs) || 15000;
      this.loadingTimer = window.setTimeout(() => this.el.classList.add('is-loading-visible'), 400);
      this.timeout = window.setTimeout(() => this.fail('timeout'), timeoutMs);
    } else {
      this.started = false;
      this.start();
    }
  }
}

/** Create Stage objects for every .stage under root; start eager ones after first paint, lazy ones when visible. */
export function initStages(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-stage]').forEach((el) => {
    if (stages.has(el)) return;
    const s = new Stage(el);
    if (!s.glb) return;
    if (el.dataset.loadingMode === 'eager') afterFirstPaint(() => s.start());
    else lazyStart(el, s);
  });
}

function afterFirstPaint(fn: () => void) {
  const run = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run, { once: true });
}

function lazyStart(el: HTMLElement, s: Stage) {
  const visible = () => el.getClientRects().length > 0;       // hidden panels have no boxes
  if (!('IntersectionObserver' in window)) { if (visible()) s.start(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && visible()) { io.disconnect(); s.start(); }
  }, { rootMargin: '200px' });
  io.observe(el);
  el.addEventListener('stage:activate', () => { io.disconnect(); s.start(); }, { once: true });
}

/** Called by tab switchers when a panel containing a lazy stage becomes visible. */
export function activateStages(panel: HTMLElement) {
  panel.querySelectorAll<HTMLElement>('[data-stage]').forEach((el) => el.dispatchEvent(new CustomEvent('stage:activate')));
}
