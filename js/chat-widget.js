/**
 * Thinkers AI Chat Widget
 * Self-contained chat bubble + panel that works on any page
 * Streams responses via SSE from /api/chat
 */
(function () {
  'use strict';

  const API_BASE = '/api';
  const SESSION_KEY = 'tgk_chat_session';
  const HISTORY_KEY = 'tgk_chat_history';

  // ─── State ───────────────────────────────────────────────────────
  let sessionId = localStorage.getItem(SESSION_KEY) || '';
  let isOpen = false;
  let isStreaming = false;
  let messageHistory = [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) messageHistory = JSON.parse(stored);
  } catch { /* ignore */ }

  // ─── Detect language ─────────────────────────────────────────────
  // Sync with the site's language system (localStorage key: 'thinkers-lang')
  function getLang() {
    // Primary: read from same localStorage key as main site (scripts/main.js)
    const stored = localStorage.getItem('thinkers-lang');
    if (stored === 'ja' || stored === 'en') return stored;
    // Fallback: check <html lang="...">
    const htmlLang = document.documentElement.getAttribute('lang') || 'en';
    return htmlLang.startsWith('ja') ? 'ja' : 'en';
  }

  let currentLang = getLang();

  const i18n = {
    en: {
      title: 'Chat with Us',
      subtitle: 'AI-powered assistant',
      placeholder: 'Type your message...',
      send: 'Send',
      engineer: '👨‍💻 Talk to an Engineer',
      greeting: 'Hi there! 👋 I\'m the Thinkers assistant. How can I help you today? Whether you need IT support, cybersecurity, cloud consulting, or any other IT services — I\'m here to help!',
      escalateSearching: 'Let me get an engineer for you...',
      escalateTitle: 'No engineer available at the moment. Please fill in your details and someone will get back to you shortly.',
      escalateCompany: 'Company name',
      escalateEmail: 'Email address',
      escalateAddress: 'Address',
      escalatePhone: 'Contact number',
      escalateSubmit: 'Submit',
      escalateSuccess: 'Thank you! Our engineering team has been notified and someone will get back to you shortly.',
      escalateCancel: 'Back to chat',
      poweredBy: 'Powered by Thinkers AI',
      thinking: 'Thinking...',
    },
    ja: {
      title: 'チャットで相談',
      subtitle: 'AI アシスタント',
      placeholder: 'メッセージを入力...',
      send: '送信',
      engineer: '👨‍💻 エンジニアに相談',
      greeting: 'こんにちは！👋 Thinkers のAIアシスタントです。ITサポート、サイバーセキュリティ、クラウドコンサルティングなど、どんなことでもお気軽にご相談ください！',
      escalateSearching: 'エンジニアをお探ししています...',
      escalateTitle: '現在エンジニアが対応できません。以下の情報をご記入いただければ、折り返しご連絡いたします。',
      escalateCompany: '会社名',
      escalateEmail: 'メールアドレス',
      escalateAddress: '住所',
      escalatePhone: '電話番号',
      escalateSubmit: '送信',
      escalateSuccess: 'ありがとうございます！エンジニアチームに通知しました。まもなくご連絡いたします。',
      escalateCancel: 'チャットに戻る',
      poweredBy: 'Thinkers AI',
      thinking: '考え中...',
    }
  };

  function t(key) {
    const lang = getLang();
    return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
  }

  // ─── Build DOM ───────────────────────────────────────────────────
  function createWidget() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = getCSS();
    document.head.appendChild(style);

    // Container
    const container = document.createElement('div');
    container.id = 'tgk-chat-widget';
    container.innerHTML = getHTML();
    document.body.appendChild(container);

    // Event listeners
    const bubble = container.querySelector('.tgk-chat-bubble');
    const closeBtn = container.querySelector('.tgk-chat-close');
    const sendBtn = container.querySelector('.tgk-chat-send');
    const input = container.querySelector('.tgk-chat-input');
    const engineerBtn = container.querySelector('.tgk-chat-engineer-btn');
    const escalateForm = container.querySelector('.tgk-escalate-form');
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
    engineerBtn.addEventListener('click', showEscalateForm);
    escalateCancel.addEventListener('click', hideEscalateForm);
    escalateSubmit.addEventListener('click', submitEscalation);

    // Load existing messages or show greeting
    if (messageHistory.length > 0) {
      messageHistory.forEach(m => renderMessage(m.role, m.content, false));
    } else {
      renderMessage('assistant', t('greeting'), false);
    }

    // Watch for language changes — when user clicks the EN/JP toggle,
    // main.js sets <html lang="...">, so we observe that attribute.
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

  /**
   * Re-render all translatable UI strings when language changes.
   * Chat messages stay as-is (they were in whatever language the conversation used).
   */
  function updateLanguage() {
    // Header
    const title = document.querySelector('.tgk-chat-title');
    const subtitle = document.querySelector('.tgk-chat-subtitle');
    if (title) title.textContent = t('title');
    if (subtitle) subtitle.textContent = t('subtitle');

    // Footer
    const engineerBtn = document.querySelector('.tgk-chat-engineer-btn');
    if (engineerBtn) engineerBtn.textContent = t('engineer');

    const input = document.querySelector('.tgk-chat-input');
    if (input) input.placeholder = t('placeholder');

    const powered = document.querySelector('.tgk-chat-powered');
    if (powered) powered.textContent = t('poweredBy');

    // Escalation form
    const escTitle = document.querySelector('.tgk-escalate-title');
    if (escTitle) escTitle.textContent = t('escalateTitle');

    const escCompany = document.querySelector('.tgk-escalate-company');
    if (escCompany) escCompany.placeholder = t('escalateCompany');

    const escEmail = document.querySelector('.tgk-escalate-email');
    if (escEmail) escEmail.placeholder = t('escalateEmail');

    const escAddress = document.querySelector('.tgk-escalate-address');
    if (escAddress) escAddress.placeholder = t('escalateAddress');

    const escPhone = document.querySelector('.tgk-escalate-phone');
    if (escPhone) escPhone.placeholder = t('escalatePhone');

    const escCancel = document.querySelector('.tgk-escalate-cancel');
    if (escCancel) escCancel.textContent = t('escalateCancel');

    const escSubmit = document.querySelector('.tgk-escalate-submit');
    if (escSubmit && !escSubmit.disabled) escSubmit.textContent = t('escalateSubmit');

    // If the only message is the greeting (no real conversation yet), update it too
    if (messageHistory.length === 0) {
      const msgs = document.querySelector('.tgk-chat-messages');
      if (msgs && msgs.children.length === 1) {
        const greetingEl = msgs.children[0].querySelector('.tgk-msg-text');
        if (greetingEl) greetingEl.textContent = t('greeting');
      }
    }
  }

  function getHTML() {
    return `
      <!-- Floating bubble -->
      <button class="tgk-chat-bubble" aria-label="Open chat">
        <svg class="tgk-chat-icon-open" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg class="tgk-chat-icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Chat panel -->
      <div class="tgk-chat-panel">
        <!-- Header -->
        <div class="tgk-chat-header">
          <div class="tgk-chat-header-info">
            <div class="tgk-chat-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </div>
            <div>
              <div class="tgk-chat-title">${t('title')}</div>
              <div class="tgk-chat-subtitle">${t('subtitle')}</div>
            </div>
          </div>
          <button class="tgk-chat-close" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="tgk-chat-messages"></div>

        <!-- Escalation form (hidden by default) -->
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

        <!-- Footer -->
        <div class="tgk-chat-footer">
          <button class="tgk-chat-engineer-btn">${t('engineer')}</button>
          <div class="tgk-chat-input-row">
            <textarea class="tgk-chat-input" placeholder="${t('placeholder')}" rows="1"></textarea>
            <button class="tgk-chat-send" aria-label="${t('send')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div class="tgk-chat-powered">${t('poweredBy')}</div>
        </div>
      </div>
    `;
  }

  // ─── Actions ─────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.querySelector('.tgk-chat-panel');
    const bubble = document.querySelector('.tgk-chat-bubble');
    const iconOpen = bubble.querySelector('.tgk-chat-icon-open');
    const iconClose = bubble.querySelector('.tgk-chat-icon-close');

    panel.classList.toggle('tgk-chat-open', isOpen);
    bubble.classList.toggle('tgk-chat-bubble-active', isOpen);
    iconOpen.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';

    if (isOpen) {
      const input = document.querySelector('.tgk-chat-input');
      setTimeout(() => input.focus(), 300);
      scrollToBottom();
    }
  }

  function sendMessage() {
    if (isStreaming) return;
    const input = document.querySelector('.tgk-chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    autoResizeInput();

    // Add user message
    renderMessage('user', text);
    messageHistory.push({ role: 'user', content: text });
    saveHistory();

    // Stream AI response
    streamResponse(text);
  }

  async function streamResponse(userMessage) {
    isStreaming = true;
    const sendBtn = document.querySelector('.tgk-chat-send');
    sendBtn.disabled = true;

    // Show typing indicator
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
        // Streaming SSE response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        // Remove thinking indicator and create message bubble
        thinkingEl.remove();
        const msgEl = renderMessage('assistant', '', false, false, true);
        const textEl = msgEl.querySelector('.tgk-msg-text');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();

            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);

              // Capture session_id from first event
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
            } catch { /* skip malformed */ }
          }
        }

        if (fullText) {
          messageHistory.push({ role: 'assistant', content: fullText });
          saveHistory();
        }

      } else {
        // Non-streaming JSON response (fallback)
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
      }

    } catch (err) {
      console.error('Chat error:', err);
      thinkingEl.remove();
      const errorMsg = getLang() === 'ja'
        ? '申し訳ありません。接続に問題が発生しました。もう一度お試しください。'
        : 'Sorry, I had trouble connecting. Please try again.';
      renderMessage('assistant', errorMsg);
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      document.querySelector('.tgk-chat-input').focus();
    }
  }

  let escalateTimer = null;

  function showEscalateForm() {
    // Hide the engineer button and input row immediately
    document.querySelector('.tgk-chat-engineer-btn').style.display = 'none';
    document.querySelector('.tgk-chat-footer .tgk-chat-input-row').style.display = 'none';

    // Step 1: Show "Let me get an engineer..." message in chat
    renderMessage('assistant', t('escalateSearching'));

    // Step 2: After 2 minutes, show the contact form
    escalateTimer = setTimeout(() => {
      // Show "no engineer available" message in chat
      renderMessage('assistant', t('escalateTitle'));

      // Show the form
      document.querySelector('.tgk-escalate-form').style.display = 'block';
      document.querySelector('.tgk-escalate-company').focus();
      scrollToBottom();
    }, 120000); // 2 minutes = 120,000ms
  }

  function hideEscalateForm() {
    // Clear the timer if user cancels before 2 min
    if (escalateTimer) {
      clearTimeout(escalateTimer);
      escalateTimer = null;
    }
    document.querySelector('.tgk-escalate-form').style.display = 'none';
    document.querySelector('.tgk-chat-footer .tgk-chat-input-row').style.display = 'flex';
    document.querySelector('.tgk-chat-engineer-btn').style.display = 'block';
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

      const json = await res.json();

      // Show success in chat
      hideEscalateForm();
      renderMessage('assistant', t('escalateSuccess'));
      messageHistory.push({ role: 'assistant', content: t('escalateSuccess') });
      saveHistory();

    } catch (err) {
      console.error('Escalation error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('escalateSubmit');
    }
  }

  // ─── Rendering ───────────────────────────────────────────────────
  function renderMessage(role, text, save = false, isThinking = false, isEmpty = false) {
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
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }

  function saveHistory() {
    try {
      // Keep last 30 messages in localStorage
      const recent = messageHistory.slice(-30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(recent));
    } catch { /* quota exceeded — ignore */ }
  }

  function autoResizeInput() {
    const input = document.querySelector('.tgk-chat-input');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }

  // ─── Styles ──────────────────────────────────────────────────────
  function getCSS() {
    return `
      /* ─── Chat Widget Reset ─── */
      #tgk-chat-widget, #tgk-chat-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* ─── Bubble ─── */
      .tgk-chat-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--color-accent, #2563eb);
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        z-index: 10000;
      }
      .tgk-chat-bubble:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 24px rgba(37, 99, 235, 0.5);
      }
      .tgk-chat-bubble-active {
        background: var(--color-text-secondary, #6b7280);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }

      /* ─── Panel ─── */
      .tgk-chat-panel {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 380px;
        max-height: 560px;
        background: var(--color-bg, #ffffff);
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .tgk-chat-panel.tgk-chat-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* ─── Header ─── */
      .tgk-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;
        background: var(--color-accent, #2563eb);
        color: #fff;
      }
      .tgk-chat-header-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .tgk-chat-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tgk-chat-title {
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 15px;
        font-weight: 600;
        line-height: 1.2;
      }
      .tgk-chat-subtitle {
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 12px;
        opacity: 0.8;
        line-height: 1.2;
      }
      .tgk-chat-close {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        opacity: 0.7;
        transition: opacity 0.15s;
      }
      .tgk-chat-close:hover { opacity: 1; }

      /* ─── Messages ─── */
      .tgk-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 200px;
        max-height: 320px;
        scroll-behavior: smooth;
      }
      .tgk-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 14px;
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
        animation: tgkMsgIn 0.2s ease;
      }
      @keyframes tgkMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .tgk-msg-user {
        align-self: flex-end;
        background: var(--color-accent, #2563eb);
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .tgk-msg-assistant {
        align-self: flex-start;
        background: var(--color-bg-alt, #f8f9fb);
        color: var(--color-text, #111827);
        border-bottom-left-radius: 4px;
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
        background: var(--color-accent, #2563eb);
        border-radius: 2px;
        animation: tgkBlink 0.8s infinite;
        margin-left: 2px;
      }
      @keyframes tgkBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }

      /* ─── Escalation Form ─── */
      .tgk-escalate-form {
        padding: 16px;
        background: var(--color-bg-alt, #f8f9fb);
        border-top: 1px solid var(--color-border, #e5e7eb);
      }
      .tgk-escalate-title {
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text, #111827);
        margin-bottom: 10px;
      }
      .tgk-escalate-form input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 8px;
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 13px;
        margin-bottom: 8px;
        background: var(--color-bg, #fff);
        color: var(--color-text, #111827);
        outline: none;
        transition: border-color 0.15s;
      }
      .tgk-escalate-form input:focus {
        border-color: var(--color-accent, #2563eb);
      }
      .tgk-escalate-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
      .tgk-escalate-cancel {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 8px;
        background: var(--color-bg, #fff);
        color: var(--color-text-secondary, #6b7280);
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 13px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .tgk-escalate-cancel:hover {
        background: var(--color-bg-alt, #f8f9fb);
      }
      .tgk-escalate-submit {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 8px;
        background: var(--color-accent, #2563eb);
        color: #fff;
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
      }
      .tgk-escalate-submit:hover {
        background: var(--color-accent-hover, #1d4ed8);
      }

      /* ─── Footer ─── */
      .tgk-chat-footer {
        padding: 8px 12px 10px;
        border-top: 1px solid var(--color-border, #e5e7eb);
        background: var(--color-bg, #ffffff);
      }
      .tgk-chat-engineer-btn {
        width: 100%;
        padding: 7px 12px;
        margin-bottom: 8px;
        border: 1px dashed var(--color-accent, #2563eb);
        border-radius: 8px;
        background: var(--color-accent-light, #eff6ff);
        color: var(--color-accent, #2563eb);
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .tgk-chat-engineer-btn:hover {
        background: var(--color-accent, #2563eb);
        color: #fff;
      }
      .tgk-chat-input-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      .tgk-chat-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 10px;
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 14px;
        line-height: 1.4;
        resize: none;
        outline: none;
        background: var(--color-bg, #fff);
        color: var(--color-text, #111827);
        transition: border-color 0.15s;
        max-height: 100px;
      }
      .tgk-chat-input:focus {
        border-color: var(--color-accent, #2563eb);
      }
      .tgk-chat-send {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: none;
        background: var(--color-accent, #2563eb);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s;
      }
      .tgk-chat-send:hover { background: var(--color-accent-hover, #1d4ed8); }
      .tgk-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
      .tgk-chat-powered {
        text-align: center;
        font-family: var(--font, 'Inter', sans-serif);
        font-size: 10px;
        color: var(--color-text-muted, #9ca3af);
        margin-top: 6px;
      }

      /* ─── Mobile responsive ─── */
      @media (max-width: 480px) {
        .tgk-chat-panel {
          width: calc(100vw - 16px);
          right: 8px;
          bottom: 88px;
          max-height: calc(100vh - 120px);
          border-radius: 12px;
        }
        .tgk-chat-bubble {
          bottom: 16px;
          right: 16px;
          width: 54px;
          height: 54px;
        }
      }

      /* ─── Scrollbar ─── */
      .tgk-chat-messages::-webkit-scrollbar { width: 4px; }
      .tgk-chat-messages::-webkit-scrollbar-track { background: transparent; }
      .tgk-chat-messages::-webkit-scrollbar-thumb {
        background: var(--color-border, #e5e7eb);
        border-radius: 4px;
      }
    `;
  }

  // ─── Initialize ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
