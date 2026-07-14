(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-LSD1CGSKBS';
  var CONSENT_KEY = 'tgk-analytics-consent';
  var savedConsent = null;

  try {
    savedConsent = window.localStorage.getItem(CONSENT_KEY);
  } catch (error) {
    savedConsent = null;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: savedConsent === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500
  });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: true });

  var googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(googleTag);

  function setConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Consent still applies for this page when storage is unavailable.
    }
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    var banner = document.getElementById('tgk-analytics-consent');
    if (banner) banner.remove();
  }

  window.tgkTrackEvent = function (name, parameters) {
    window.gtag('event', name, parameters || {});
  };

  window.tgkTrackLead = function (parameters) {
    window.gtag('event', 'generate_lead', parameters || {});
  };

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('calendar.google.com/calendar/appointments') !== -1) {
      window.tgkTrackEvent('book_appointment_click', { link_url: href });
    } else if (href.indexOf('#consultation') === 0) {
      window.tgkTrackEvent('contact_consultation_choice_click', { link_url: href });
    } else if (href.indexOf('line.me/') !== -1 || href.indexOf('lin.ee/') !== -1) {
      window.tgkTrackEvent('contact_line_click', { link_url: href });
    } else if (href.indexOf('mailto:') === 0) {
      window.tgkTrackEvent('contact_email_click', { link_url: href });
    } else if (href.indexOf('tel:') === 0) {
      window.tgkTrackEvent('contact_phone_click', { link_url: href });
    }
  });

  function showConsentBanner() {
    if (savedConsent === 'granted' || savedConsent === 'denied') return;

    var isJapanese = (document.documentElement.lang || '').toLowerCase().indexOf('ja') === 0;
    var banner = document.createElement('aside');
    banner.id = 'tgk-analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', isJapanese ? 'アクセス解析の設定' : 'Analytics preferences');
    banner.innerHTML =
      '<div class="tgk-consent-copy">' +
      (isJapanese
        ? '当サイトでは、利用状況の把握とサービス改善のためGoogle Analyticsを使用します。広告用Cookieは使用しません。'
        : 'We use Google Analytics to understand website use and improve our services. Advertising cookies remain disabled.') +
      ' <a href="/privacy-policy' + (isJapanese ? '.ja' : '') + '.html">' +
      (isJapanese ? '詳細' : 'Privacy details') +
      '</a></div>' +
      '<div class="tgk-consent-actions">' +
      '<button type="button" data-consent="denied">' + (isJapanese ? '拒否' : 'Decline') + '</button>' +
      '<button type="button" class="tgk-consent-accept" data-consent="granted">' + (isJapanese ? '同意する' : 'Accept') + '</button>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#tgk-analytics-consent{position:fixed;z-index:100000;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:16px 18px;border:1px solid rgba(148,163,184,.35);border-radius:12px;background:#0f172a;color:#f8fafc;box-shadow:0 18px 50px rgba(0,0,0,.3);font:14px/1.5 Inter,system-ui,sans-serif;display:flex;gap:18px;align-items:center;justify-content:space-between}' +
      '#tgk-analytics-consent a{color:#93c5fd;text-decoration:underline}' +
      '.tgk-consent-actions{display:flex;gap:8px;flex:0 0 auto}' +
      '.tgk-consent-actions button{border:1px solid #64748b;border-radius:8px;padding:8px 14px;background:transparent;color:#f8fafc;cursor:pointer;font:inherit}' +
      '.tgk-consent-actions .tgk-consent-accept{border-color:#2563eb;background:#2563eb}' +
      '@media(max-width:640px){#tgk-analytics-consent{align-items:stretch;flex-direction:column}.tgk-consent-actions{justify-content:flex-end}}';
    document.head.appendChild(style);
    document.body.appendChild(banner);

    banner.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-consent]');
      if (button) setConsent(button.getAttribute('data-consent'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showConsentBanner);
  } else {
    showConsentBanner();
  }
})();
