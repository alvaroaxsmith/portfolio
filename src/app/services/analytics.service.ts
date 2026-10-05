import { Injectable, signal } from '@angular/core';

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __analytics?: { enabled: boolean };
};

const CONSENT_KEY = 'portfolio:consent';

export type ConsentChoice = 'granted' | 'denied';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly win = window as AnalyticsWindow;
  private lastKeys: string[] = [];
  readonly consentBannerVisible = signal(false);

  constructor() {
    this.consentBannerVisible.set(this.enabled && this.consent === null);
  }

  openConsentBanner(): void {
    if (this.enabled) {
      this.consentBannerVisible.set(true);
    }
  }

  get enabled(): boolean {
    return !!this.win.__analytics?.enabled;
  }

  get consent(): ConsentChoice | null {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch {
      return null;
    }
  }

  setConsent(choice: ConsentChoice): void {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
    }
    this.consentBannerVisible.set(false);
    this.win.gtag?.('consent', 'update', { analytics_storage: choice });
    this.track('consent_update', { analytics_storage: choice });
  }

  pageView(path: string, title: string, language: string): void {
    this.track('page_view', {
      page_path: path,
      page_location: location.origin + path,
      page_title: title,
      language
    });
  }

  track(event: string, params: AnalyticsParams = {}): void {
    if (!this.enabled) {
      return;
    }
    const reset = Object.fromEntries(this.lastKeys.map((key) => [key, undefined]));
    this.lastKeys = Object.keys(params);
    this.win.dataLayer = this.win.dataLayer || [];
    this.win.dataLayer.push({ ...reset, event, ...params });
  }
}
