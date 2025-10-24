// LitInvestorBlog-frontend/src/utils/performanceMonitor.js

export class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window === 'undefined' || !window.performance) return null;

    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => this.measurePageLoad());
      return null;
    }

    const perfData = window.performance.timing;
    const metrics = {
      pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
      ttfb: perfData.responseStart - perfData.navigationStart,
    };

    if (import.meta.env.DEV) {
      console.log('📊 Performance:', metrics);
    }

    return metrics;
  }

  static measureComponentRender(componentName, renderTime) {
    if (import.meta.env.DEV && renderTime > 100) {
      console.warn(`⚠️ ${componentName} slow: ${renderTime}ms`);
    }
  }
}

export default PerformanceMonitor;
