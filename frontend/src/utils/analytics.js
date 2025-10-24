// LitInvestorBlog-frontend/src/utils/analytics.js

export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};

export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const initAnalytics = (measurementId) => {
  if (typeof window === 'undefined' || !measurementId) return;

  const loadGA = () => {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  };

  if (document.readyState === 'complete') {
    setTimeout(loadGA, 2000);
  } else {
    window.addEventListener('load', () => setTimeout(loadGA, 2000));
  }
};
