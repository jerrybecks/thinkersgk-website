/**
 * Thinkers GK Chat Widget
 * Branded chat launcher + panel for website visitors in English and Japanese
 */
(function () {
  'use strict';

  const API_BASE = '/api';
  const WIDGET_VERSION = '2026-07-07-v8';
  const VERSION_KEY = 'tgk_chat_widget_version';
  const SESSION_KEY = 'tgk_chat_session';
  const HISTORY_KEY = 'tgk_chat_history';
  const FALLBACK_MARKERS = [
    'having trouble right now',
    'assistant is currently offline',
    'trouble connecting',
    'please try again in a moment'
  ];

  runVersionMigration();

  let sessionId = localStorage.getItem(SESSION_KEY) || '';
  let isOpen = false;
  let isStreaming = false;
  let messageHistory = [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) messageHistory = JSON.parse(stored);
  } catch {
    // ignore corrupted localStorage
  }

  function runVersionMigration() {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY);
      if (savedVersion !== WIDGET_VERSION) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(HISTORY_KEY);
        localStorage.setItem(VERSION_KEY, WIDGET_VERSION);
      }
    } catch {
      // ignore storage errors
    }
  }

  function getLang() {
    const stored = localStorage.getItem('thinkers-lang');
    if (stored === 'ja' || stored === 'en') return stored;
    const htmlLang = document.documentElement.getAttribute('lang') || 'en';
    return htmlLang.startsWith('ja') ? 'ja' : 'en';
  }

  let currentLang = getLang();

  const i18n = {
    en: {
      title: 'Ask Thinker',
      launcher: 'Ask Thinker',
      subtitle: 'Bilingual IT help for Japan',
      status: 'English / Japanese support',
      placeholder: 'Tell us what you need in Japan...',
      send: 'Send',
      engineer: 'Talk to an engineer',
      greeting: 'Hi, I’m Thinker. Tell me what needs to get done in Japan, and I’ll help route the next step.',
      escalateSearching: 'Thanks. I’ll collect your details so an engineer can follow up directly.',
      escalateTitle: 'Share your details below and our team will get back to you shortly.',
      escalateCompany: 'Company name',
      escalateEmail: 'Work email',
      escalateAddress: 'Office or site location',
      escalatePhone: 'Phone number',
      escalateSubmit: 'Request follow-up',
      escalateSuccess: 'Thanks. Our engineering team has been notified and will follow up shortly.',
      escalateCancel: 'Back to chat',
      poweredBy: 'Thinkers GK assistant',
      thinking: 'Thinking...',
      newChat: 'New chat',
      fallbackHint: 'If you prefer, use “Talk to an engineer” and we’ll follow up directly.',
      q1: 'IT support for our team',
      q2: 'Device retrieval or ITAD',
      q3: 'Office setup in Japan'
    },
    ja: {
      title: 'Thinker に相談',
      launcher: 'Thinker に相談',
      subtitle: '日本向けバイリンガル IT サポート',
      status: '英語 / 日本語対応',
      placeholder: '日本で必要なことをご入力ください...',
      send: '送信',
      engineer: 'エンジニアに相談',
      greeting: 'こんにちは。Thinker です。日本で何を進めたいか教えてください。次の一手を整理します。',
      escalateSearching: 'ありがとうございます。エンジニアが折り返せるよう、連絡先をお願いします。',
      escalateTitle: '以下をご入力ください。担当チームから折り返しご連絡します。',
      escalateCompany: '会社名',
      escalateEmail: '会社メールアドレス',
      escalateAddress: '拠点または現場住所',
      escalatePhone: '電話番号',
      escalateSubmit: '折り返しを依頼',
      escalateSuccess: 'ありがとうございます。エンジニアチームへ通知しました。追ってご連絡します。',
      escalateCancel: 'チャットに戻る',
      poweredBy: 'Thinkers GK アシスタント',
      thinking: '考え中...',
      newChat: '新しいチャット',
      fallbackHint: '必要であれば「エンジニアに相談」から直接折り返し依頼もできます。',
      q1: '社内ITサポートを相談したい',
      q2: '端末回収やITADを相談したい',
      q3: '日本でのオフィス立ち上げ'
    }
  };

  function t(key) {
    const lang = getLang();
    return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
  }

  function getQuickActions() {
    return [
      { key: 'q1', prompt: t('q1') },
      { key: 'q2', prompt: t('q2') },
      { key: 'q3', prompt: t('q3') }
    ];
  }

  function isBackendFallback(text) {
    const normalized = String(text || '').toLowerCase();
    return FALLBACK_MARKERS.some((marker) => normalized.includes(marker));
  }

  function createWidget() {
    document.querySelector('#tgk-chat-widget')?.remove();
    [...document.querySelectorAll('style')].forEach((node) => {
      if (node.textContent.includes('#tgk-chat-widget')) node.remove();
    });

    const style = document.createElement('style');
    style.textContent = getCSS();
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'tgk-chat-widget';
    container.innerHTML = getHTML();
    document.body.appendChild(container);

    const bubble = container.querySelector('.tgk-chat-bubble');
    const closeBtn = container.querySelector('.tgk-chat-close');
    const sendBtn = container.querySelector('.tgk-chat-send');
    const input = container.querySelector('.tgk-chat-input');
    const engineerBtn = container.querySelector('.tgk-chat-engineer-btn');
    const resetBtn = container.querySelector('.tgk-chat-reset');
    const escalateSubmit = container.querySelector('.tgk-escalate-submit');
    const escalateCancel = container.querySelector('.tgk-escalate-cancel');

    bubble.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener('input', autoResizeInput);
    engineerBtn.addEventListener('click', showEscalateForm);
    resetBtn.addEventListener('click', () => resetConversation(true));
    escalateCancel.addEventListener('click', hideEscalateForm);
    escalateSubmit.addEventListener('click', submitEscalation);

    container.querySelectorAll('.tgk-suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isStreaming) return;
        input.value = btn.dataset.prompt || btn.textContent || '';
        autoResizeInput();
        sendMessage();
      });
    });

    if (messageHistory.length > 0) {
      messageHistory.forEach((m) => renderMessage(m.role, m.content, false));
    } else {
      renderMessage('assistant', t('greeting'), false);
    }

    const langObserver = new MutationObserver(() => {
      const newLang = getLang();
      if (newLang !== currentLang) {
        currentLang = newLang;
        updateLanguage();
      }
    });
    langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }

  function updateLanguage() {
    const title = document.querySelector('.tgk-chat-title');
    const subtitle = document.querySelector('.tgk-chat-subtitle');
    const launcher = document.querySelector('.tgk-chat-bubble-label');
    const status = document.querySelector('.tgk-chat-status');
    const engineerBtn = document.querySelector('.tgk-chat-engineer-btn');
    const resetBtn = document.querySelector('.tgk-chat-reset');
    const input = document.querySelector('.tgk-chat-input');
    const powered = document.querySelector('.tgk-chat-powered');
    const escTitle = document.querySelector('.tgk-escalate-title');
    const escCompany = document.querySelector('.tgk-escalate-company');
    const escEmail = document.querySelector('.tgk-escalate-email');
    const escAddress = document.querySelector('.tgk-escalate-address');
    const escPhone = document.querySelector('.tgk-escalate-phone');
    const escCancel = document.querySelector('.tgk-escalate-cancel');
    const escSubmit = document.querySelector('.tgk-escalate-submit');

    if (title) title.textContent = t('title');
    if (subtitle) subtitle.textContent = t('subtitle');
    if (launcher) launcher.textContent = t('launcher');
    if (status) status.textContent = t('status');
    if (engineerBtn) engineerBtn.textContent = t('engineer');
    if (resetBtn) resetBtn.textContent = t('newChat');
    if (input) input.placeholder = t('placeholder');
    if (powered) powered.textContent = t('poweredBy');
    if (escTitle) escTitle.textContent = t('escalateTitle');
    if (escCompany) escCompany.placeholder = t('escalateCompany');
    if (escEmail) escEmail.placeholder = t('escalateEmail');
    if (escAddress) escAddress.placeholder = t('escalateAddress');
    if (escPhone) escPhone.placeholder = t('escalatePhone');
    if (escCancel) escCancel.textContent = t('escalateCancel');
    if (escSubmit && !escSubmit.disabled) escSubmit.textContent = t('escalateSubmit');

    document.querySelectorAll('.tgk-suggestion').forEach((btn, idx) => {
      const action = getQuickActions()[idx];
      if (!action) return;
      btn.textContent = action.prompt;
      btn.dataset.prompt = action.prompt;
    });

    if (messageHistory.length === 0) {
      const msgs = document.querySelector('.tgk-chat-messages');
      if (msgs && msgs.children.length === 1) {
        const greetingEl = msgs.children[0].querySelector('.tgk-msg-text');
        if (greetingEl) greetingEl.textContent = t('greeting');
      }
    }
  }

  function getHTML() {
    const actions = getQuickActions();
    return `
      <button class="tgk-chat-bubble" aria-label="${t('launcher')}">
        <span class="tgk-chat-bubble-mark">
          <img src="/assets/logo-thinkers-new-small.png" alt="Thinkers GK" class="tgk-chat-bubble-logo">
        </span>
        <span class="tgk-chat-bubble-copy">
          <span class="tgk-chat-bubble-label">${t('launcher')}</span>
          <span class="tgk-chat-bubble-sub">${t('status')}</span>
        </span>
        <svg class="tgk-chat-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="tgk-chat-panel" aria-live="polite">
        <div class="tgk-chat-header">
          <div class="tgk-chat-header-info">
            <div class="tgk-chat-logo-wrap">
              <img src="/assets/logo-light.png" alt="Thinkers GK" class="tgk-chat-logo">
            </div>
            <div class="tgk-chat-header-copy">
              <div class="tgk-chat-title">${t('title')}</div>
              <div class="tgk-chat-subtitle">${t('subtitle')}</div>
            </div>
          </div>
          <div class="tgk-chat-header-actions">
            <button class="tgk-chat-reset" type="button">${t('newChat')}</button>
            <span class="tgk-chat-status">${t('status')}</span>
            <button class="tgk-chat-close" aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="tgk-chat-messages"></div>

        <div class="tgk-escalate-form" style="display:none">
          <div class="tgk-escalate-title">${t('escalateTitle')}</div>
          <input type="text" class="tgk-escalate-company" placeholder="${t('escalateCompany')}">
          <input type="email" class="tgk-escalate-email" placeholder="${t('escalateEmail')}">
          <input type="text" class="tgk-escalate-address" placeholder="${t('escalateAddress')}">
          <input type="tel" class="tgk-escalate-phone" placeholder="${t('escalatePhone')}">
          <div class="tgk-escalate-actions">
            <button class="tgk-escalate-cancel">${t('escalateCancel')}</button>
            <button class="tgk-escalate-submit">${t('escalateSubmit')}</button>
          </div>
        </div>

        <div class="tgk-chat-footer">
          <div class="tgk-chat-suggestions">
            ${actions.map((action) => `<button class="tgk-suggestion" type="button" data-prompt="${escapeHtmlAttr(action.prompt)}">${action.prompt}</button>`).join('')}
          </div>
          <button class="tgk-chat-engineer-btn">${t('engineer')}</button>
          <div class="tgk-chat-input-row">
            <textarea class="tgk-chat-input" placeholder="${t('placeholder')}" rows="1"></textarea>
            <button class="tgk-chat-send" aria-label="${t('send')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="tgk-chat-powered">${t('poweredBy')}</div>
        </div>
      </div>
    `;
  }

  function toggleChat(forceState) {
    isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
    const panel = document.querySelector('.tgk-chat-panel');
    const bubble = document.querySelector('.tgk-chat-bubble');
    const iconClose = bubble.querySelector('.tgk-chat-icon-close');

    panel.classList.toggle('tgk-chat-open', isOpen);
    bubble.classList.toggle('tgk-chat-bubble-active', isOpen);
    bubble.classList.toggle('tgk-chat-bubble-hidden', isOpen);
    iconClose.style.display = isOpen ? 'block' : 'none';

    if (isOpen) {
      const input = document.querySelector('.tgk-chat-input');
      setTimeout(() => input.focus(), 220);
      scrollToBottom();
    }
  }

  function sendMessage() {
    if (isStreaming) return;
    const input = document.querySelector('.tgk-chat-input');
    const text = input.value.trim();
    if (!text) return;

    clearHumanFallbackState();
    input.value = '';
    autoResizeInput();

    renderMessage('user', text);
    messageHistory.push({ role: 'user', content: text });
    saveHistory();

    streamResponse(text);
  }

  async function streamResponse(userMessage) {
    isStreaming = true;
    const sendBtn = document.querySelector('.tgk-chat-send');
    sendBtn.disabled = true;

    const thinkingEl = renderMessage('assistant', t('thinking'), false, true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        thinkingEl.remove();
        const msgEl = renderMessage('assistant', '', false, false, true);
        const textEl = msgEl.querySelector('.tgk-msg-text');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);

              if (parsed.session_id && !sessionId) {
                sessionId = parsed.session_id;
                localStorage.setItem(SESSION_KEY, sessionId);
              }

              if (parsed.text) {
                fullText += parsed.text;
                textEl.textContent = fullText;
                scrollToBottom();
              }

              if (parsed.error) {
                textEl.textContent = fullText || parsed.error;
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }

        if (fullText) {
          messageHistory.push({ role: 'assistant', content: fullText });
          saveHistory();
          if (isBackendFallback(fullText)) markHumanFallbackState();
        }
      } else {
        const json = await res.json();
        thinkingEl.remove();

        if (json.session_id) {
          sessionId = json.session_id;
          localStorage.setItem(SESSION_KEY, sessionId);
        }

        const msg = json.message || 'Sorry, I had trouble responding. Please try again.';
        renderMessage('assistant', msg);
        messageHistory.push({ role: 'assistant', content: msg });
        saveHistory();

        if (isBackendFallback(msg)) {
          markHumanFallbackState();
          renderMessage('assistant', t('fallbackHint'));
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      thinkingEl.remove();
      const errorMsg = getLang() === 'ja'
        ? '申し訳ありません。接続に問題が発生しました。もう一度お試しください。'
        : 'Sorry, I had trouble connecting. Please try again.';
      renderMessage('assistant', errorMsg);
      renderMessage('assistant', t('fallbackHint'));
      markHumanFallbackState();
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      const input = document.querySelector('.tgk-chat-input');
      if (input) input.focus();
    }
  }

  function markHumanFallbackState() {
    const panel = document.querySelector('.tgk-chat-panel');
    const engineerBtn = document.querySelector('.tgk-chat-engineer-btn');
    if (panel) panel.classList.add('tgk-chat-needs-human');
    if (engineerBtn) engineerBtn.classList.add('tgk-chat-engineer-btn-urgent');
  }

  function clearHumanFallbackState() {
    const panel = document.querySelector('.tgk-chat-panel');
    const engineerBtn = document.querySelector('.tgk-chat-engineer-btn');
    if (panel) panel.classList.remove('tgk-chat-needs-human');
    if (engineerBtn) engineerBtn.classList.remove('tgk-chat-engineer-btn-urgent');
  }

  function showEscalateForm() {
    clearHumanFallbackState();
    document.querySelector('.tgk-chat-engineer-btn').style.display = 'none';
    document.querySelector('.tgk-chat-suggestions').style.display = 'none';
    document.querySelector('.tgk-chat-footer .tgk-chat-input-row').style.display = 'none';

    renderMessage('assistant', t('escalateSearching'));
    document.querySelector('.tgk-escalate-form').style.display = 'block';
    document.querySelector('.tgk-escalate-company').focus();
    scrollToBottom();
  }

  function hideEscalateForm() {
    document.querySelector('.tgk-escalate-form').style.display = 'none';
    document.querySelector('.tgk-chat-footer .tgk-chat-input-row').style.display = 'flex';
    document.querySelector('.tgk-chat-engineer-btn').style.display = 'block';
    document.querySelector('.tgk-chat-suggestions').style.display = 'flex';
  }

  async function submitEscalation() {
    const company = document.querySelector('.tgk-escalate-company').value.trim();
    const email = document.querySelector('.tgk-escalate-email').value.trim();
    const address = document.querySelector('.tgk-escalate-address').value.trim();
    const phone = document.querySelector('.tgk-escalate-phone').value.trim();

    if (!email) {
      document.querySelector('.tgk-escalate-email').focus();
      return;
    }

    const submitBtn = document.querySelector('.tgk-escalate-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
      const res = await fetch(`${API_BASE}/chat/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          company,
          email,
          address,
          phone,
          preferred_contact: phone ? 'phone' : 'email'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      await res.json();
      hideEscalateForm();
      renderMessage('assistant', t('escalateSuccess'));
      messageHistory.push({ role: 'assistant', content: t('escalateSuccess') });
      saveHistory();
    } catch (err) {
      console.error('Escalation error:', err);
      renderMessage('assistant', t('fallbackHint'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('escalateSubmit');
    }
  }

  function renderMessage(role, text, save = false, isThinking = false) {
    const container = document.querySelector('.tgk-chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `tgk-msg tgk-msg-${role}`;
    if (isThinking) msgDiv.classList.add('tgk-msg-thinking');

    const textSpan = document.createElement('span');
    textSpan.className = 'tgk-msg-text';
    textSpan.textContent = text;
    msgDiv.appendChild(textSpan);

    container.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  function scrollToBottom() {
    const container = document.querySelector('.tgk-chat-messages');
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  function resetConversation(keepOpen = false) {
    if (isStreaming) return;

    sessionId = '';
    messageHistory = [];

    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.setItem(VERSION_KEY, WIDGET_VERSION);
    } catch {
      // ignore storage errors
    }

    clearHumanFallbackState();

    const messages = document.querySelector('.tgk-chat-messages');
    const input = document.querySelector('.tgk-chat-input');
    const escForm = document.querySelector('.tgk-escalate-form');
    const escCompany = document.querySelector('.tgk-escalate-company');
    const escEmail = document.querySelector('.tgk-escalate-email');
    const escAddress = document.querySelector('.tgk-escalate-address');
    const escPhone = document.querySelector('.tgk-escalate-phone');
    const inputRow = document.querySelector('.tgk-chat-footer .tgk-chat-input-row');
    const suggestions = document.querySelector('.tgk-chat-suggestions');
    const engineerBtn = document.querySelector('.tgk-chat-engineer-btn');

    if (messages) messages.innerHTML = '';
    if (escForm) escForm.style.display = 'none';
    if (inputRow) inputRow.style.display = 'flex';
    if (suggestions) suggestions.style.display = 'flex';
    if (engineerBtn) engineerBtn.style.display = 'block';
    if (escCompany) escCompany.value = '';
    if (escEmail) escEmail.value = '';
    if (escAddress) escAddress.value = '';
    if (escPhone) escPhone.value = '';
    if (input) {
      input.value = '';
      autoResizeInput();
    }

    renderMessage('assistant', t('greeting'), false);

    if (keepOpen) {
      toggleChat(true);
      if (input) input.focus();
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messageHistory.slice(-30)));
    } catch {
      // ignore quota issues
    }
  }

  function autoResizeInput() {
    const input = document.querySelector('.tgk-chat-input');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 104) + 'px';
  }

  function escapeHtmlAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getCSS() {
    return `
      #tgk-chat-widget, #tgk-chat-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #tgk-chat-widget {
        --tgk-brand-1: #2d3edb;
        --tgk-brand-2: #4f46e5;
        --tgk-brand-3: #0f172a;
        --tgk-surface: #ffffff;
        --tgk-surface-2: #f8fafc;
        --tgk-border: #dbe3f0;
        --tgk-text: #0f172a;
        --tgk-muted: #64748b;
        --tgk-shadow: 0 26px 70px rgba(15, 23, 42, 0.18);
        font-family: var(--font, Inter, sans-serif);
      }

      .tgk-chat-bubble {
        position: fixed;
        right: var(--floating-control-right, 24px);
        bottom: calc(var(--floating-control-bottom, 24px) + var(--floating-control-size, 56px) + var(--floating-control-gap, 14px));
        min-width: 172px;
        min-height: 58px;
        padding: 10px 14px 10px 10px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 18px;
        background: linear-gradient(135deg, var(--tgk-brand-3), var(--tgk-brand-1));
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 18px 40px rgba(45, 62, 219, 0.28);
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        z-index: 9200;
      }
      .tgk-chat-bubble:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 46px rgba(45, 62, 219, 0.34);
      }
      .tgk-chat-bubble-active {
        background: linear-gradient(135deg, #1e293b, #334155);
      }
      .tgk-chat-bubble-hidden {
        opacity: 0;
        transform: translateY(10px) scale(0.96);
        pointer-events: none;
      }
      .tgk-chat-bubble-mark {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.96);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 38px;
        overflow: hidden;
      }
      .tgk-chat-bubble-logo {
        width: 30px;
        height: 30px;
        object-fit: contain;
      }
      .tgk-chat-bubble-copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        min-width: 0;
      }
      .tgk-chat-bubble-label {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      .tgk-chat-bubble-sub {
        font-size: 11px;
        line-height: 1.2;
        color: rgba(255,255,255,0.78);
        white-space: nowrap;
      }
      .tgk-chat-icon-close {
        width: 18px;
        height: 18px;
        margin-left: auto;
        opacity: 0.9;
        flex: 0 0 18px;
      }

      .tgk-chat-panel {
        position: fixed;
        right: var(--floating-control-right, 24px);
        bottom: calc(var(--floating-control-bottom, 24px) + (var(--floating-control-size, 56px) * 2) + (var(--floating-control-gap, 14px) * 2));
        width: 420px;
        max-height: min(640px, calc(100vh - 180px));
        background: var(--tgk-surface);
        border: 1px solid rgba(219, 227, 240, 0.95);
        border-radius: 22px;
        box-shadow: var(--tgk-shadow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9300;
        opacity: 0;
        transform: translateY(20px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.24s ease, transform 0.24s ease;
      }
      .tgk-chat-panel.tgk-chat-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .tgk-chat-panel.tgk-chat-needs-human {
        box-shadow: 0 26px 70px rgba(15, 23, 42, 0.18), 0 0 0 3px rgba(45, 62, 219, 0.08);
      }

      .tgk-chat-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        background: linear-gradient(135deg, var(--tgk-brand-3), var(--tgk-brand-1) 72%, var(--tgk-brand-2));
        color: #fff;
      }
      .tgk-chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .tgk-chat-logo-wrap {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.14);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex: 0 0 44px;
        backdrop-filter: blur(10px);
      }
      .tgk-chat-logo {
        width: 34px;
        height: 34px;
        object-fit: contain;
      }
      .tgk-chat-header-copy {
        min-width: 0;
      }
      .tgk-chat-title {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.15;
      }
      .tgk-chat-subtitle {
        font-size: 12px;
        color: rgba(255,255,255,0.8);
        margin-top: 4px;
      }
      .tgk-chat-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .tgk-chat-reset {
        min-height: 32px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }
      .tgk-chat-reset:hover {
        background: rgba(255, 255, 255, 0.18);
      }
      .tgk-chat-status {
        display: inline-flex;
        align-items: center;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.14);
        font-size: 11px;
        font-weight: 700;
        color: rgba(255,255,255,0.94);
        white-space: nowrap;
      }
      .tgk-chat-close {
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .tgk-chat-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .tgk-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 240px;
        max-height: 360px;
        background:
          radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 34%),
          linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        scroll-behavior: smooth;
      }
      .tgk-msg {
        max-width: 88%;
        padding: 12px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.55;
        color: var(--tgk-text);
        word-wrap: break-word;
        animation: tgkMsgIn 0.18s ease;
      }
      @keyframes tgkMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .tgk-msg-user {
        align-self: flex-end;
        background: linear-gradient(135deg, var(--tgk-brand-1), var(--tgk-brand-2));
        color: #fff;
        border-bottom-right-radius: 6px;
        box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
      }
      .tgk-msg-assistant {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid var(--tgk-border);
        border-bottom-left-radius: 6px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
      }
      .tgk-msg-thinking .tgk-msg-text {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }
      .tgk-msg-thinking .tgk-msg-text::after {
        content: '';
        display: inline-block;
        width: 4px;
        height: 14px;
        background: var(--tgk-brand-1);
        border-radius: 2px;
        animation: tgkBlink 0.8s infinite;
        margin-left: 2px;
      }
      @keyframes tgkBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
      }

      .tgk-escalate-form {
        padding: 16px 18px 6px;
        background: #f8fafc;
        border-top: 1px solid var(--tgk-border);
      }
      .tgk-escalate-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--tgk-text);
        margin-bottom: 10px;
      }
      .tgk-escalate-form input {
        width: 100%;
        padding: 11px 12px;
        border: 1px solid var(--tgk-border);
        border-radius: 12px;
        font-size: 13px;
        margin-bottom: 8px;
        background: #fff;
        color: var(--tgk-text);
        outline: none;
      }
      .tgk-escalate-form input:focus {
        border-color: var(--tgk-brand-1);
        box-shadow: 0 0 0 4px rgba(45, 62, 219, 0.08);
      }
      .tgk-escalate-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
      .tgk-escalate-cancel,
      .tgk-escalate-submit {
        flex: 1;
        min-height: 42px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
      .tgk-escalate-cancel {
        border: 1px solid var(--tgk-border);
        background: #fff;
        color: var(--tgk-muted);
      }
      .tgk-escalate-submit {
        border: none;
        background: linear-gradient(135deg, var(--tgk-brand-1), var(--tgk-brand-2));
        color: #fff;
      }

      .tgk-chat-footer {
        padding: 12px;
        border-top: 1px solid var(--tgk-border);
        background: rgba(255,255,255,0.98);
      }
      .tgk-chat-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }
      .tgk-suggestion {
        border: 1px solid rgba(45, 62, 219, 0.14);
        background: #f8fafc;
        color: #334155;
        border-radius: 999px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.2;
        cursor: pointer;
      }
      .tgk-suggestion:hover {
        background: #eef2ff;
        color: var(--tgk-brand-1);
      }
      .tgk-chat-engineer-btn {
        width: 100%;
        min-height: 42px;
        padding: 10px 12px;
        margin-bottom: 10px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        background: #0f172a;
        color: #fff;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      }
      .tgk-chat-engineer-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
      }
      .tgk-chat-engineer-btn-urgent {
        background: linear-gradient(135deg, #0f172a, #1d4ed8);
        box-shadow: 0 10px 20px rgba(29, 78, 216, 0.2);
      }
      .tgk-chat-input-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      .tgk-chat-input {
        flex: 1;
        min-height: 42px;
        padding: 10px 12px;
        border: 1px solid var(--tgk-border);
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.4;
        resize: none;
        outline: none;
        background: #fff;
        color: var(--tgk-text);
        max-height: 104px;
      }
      .tgk-chat-input:focus {
        border-color: var(--tgk-brand-1);
        box-shadow: 0 0 0 4px rgba(45, 62, 219, 0.08);
      }
      .tgk-chat-send {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, var(--tgk-brand-1), var(--tgk-brand-2));
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tgk-chat-send:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .tgk-chat-powered {
        text-align: center;
        font-size: 10px;
        color: #94a3b8;
        margin-top: 8px;
      }

      @media (max-width: 640px) {
        .tgk-chat-panel {
          width: calc(100vw - 16px);
          right: 8px;
          bottom: calc(var(--floating-control-bottom, 16px) + (var(--floating-control-size, 52px) * 2) + (var(--floating-control-gap, 10px) * 2));
          max-height: calc(100vh - 94px);
          border-radius: 18px;
        }
        .tgk-chat-bubble {
          right: var(--floating-control-right, 16px);
          bottom: calc(var(--floating-control-bottom, 16px) + var(--floating-control-size, 52px) + var(--floating-control-gap, 10px));
          min-width: 0;
          width: auto;
          max-width: calc(100vw - 32px);
          padding-right: 12px;
        }
        .tgk-chat-bubble-sub,
        .tgk-chat-status {
          display: none;
        }
        .tgk-chat-reset {
          padding: 0 8px;
        }
      }

      @media (max-width: 480px) {
        .tgk-chat-bubble {
          min-height: 54px;
          border-radius: 16px;
        }
        .tgk-chat-bubble-label {
          font-size: 13px;
        }
        .tgk-chat-bubble-mark {
          width: 34px;
          height: 34px;
          flex-basis: 34px;
        }
        .tgk-chat-bubble-logo {
          width: 26px;
          height: 26px;
        }
        .tgk-chat-header {
          padding: 16px;
        }
        .tgk-chat-messages {
          padding: 14px;
        }
        .tgk-msg {
          max-width: 92%;
        }
      }

      .tgk-chat-messages::-webkit-scrollbar {
        width: 5px;
      }
      .tgk-chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      .tgk-chat-messages::-webkit-scrollbar-thumb {
        background: #dbe3f0;
        border-radius: 999px;
      }
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
