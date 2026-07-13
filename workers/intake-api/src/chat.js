/**
 * AI Chat Module — Real-time conversational assistant for Thinkers
 *
 * Features:
 * - Streaming responses via Server-Sent Events (SSE)
 * - Conversation history stored in KV (per session)
 * - Lead qualification extracted from conversation
 * - Escalation to human engineer via Telegram
 */

const CHAT_SYSTEM_PROMPT = `You are the AI assistant for Thinkers, a premium IT services company based in Tokyo, Japan. You help potential clients understand our services and gather information about their needs.

ABOUT THINKERS GK:
- Premium IT services for businesses in Japan (local and international companies)
- Based in Tokyo, serves all of Japan
- Bilingual support: English and Japanese
- Email: info@thinkersgk.com
- Website: https://www.thinkersgk.com

YOUR PERSONALITY:
- Friendly, professional, and knowledgeable
- Respond in the same language the user writes in (English or Japanese)
- Keep responses concise (2-3 sentences typically, never more than 4)
- Be helpful but not pushy — build trust through expertise

CONVERSATION FLOW:
1. Warmly greet and understand what the visitor needs
2. Once you identify the service area, ask the SERVICE-SPECIFIC QUESTIONS below (1-2 at a time, naturally)
3. Gather qualifying info: company name, size, location, timeline, urgency
4. When you have enough info, summarize what you've learned and suggest a consultation
5. If they want to talk to a human, say "Absolutely! Let me connect you with one of our engineers."

SERVICE-SPECIFIC QUESTION PACKS (ask these based on the service they need):

IT SUPPORT & HELPDESK:
- How many users/devices need support?
- What systems do you use? (Microsoft 365, Google Workspace, Mac/Windows?)
- Do you have any IT support currently, or is this new?
- Is this for ongoing support or a specific issue?

CYBERSECURITY:
- Have you had any security incidents recently?
- Do you have any compliance requirements? (ISO 27001, P-Mark, APPI?)
- What security tools do you currently use? (antivirus, firewall, EDR?)
- How many employees need to be covered?

FIELD ENGINEERING / ONSITE DISPATCH:
- What type of work is needed? (hardware install, network setup, troubleshooting?)
- Where is the site located?
- How urgent is this? Do you have a preferred date?
- Is this a one-time job or recurring?

OFFICE RELOCATION:
- When is the move planned?
- How many floors/desks/users are moving?
- Do you have server racks or just user devices?
- Will carrier/ISP services need to be transferred?

IT ASSET LIFECYCLE:
- What type of assets? (laptops, servers, phones, storage?)
- Approximately how many units?
- Do you need data destruction (NIST 800-88 compliant)?
- Is this a one-time project or ongoing lifecycle management?

CLOUD & CONSULTING:
- What are you looking to move to the cloud? (email, servers, applications?)
- What cloud platform do you use or prefer? (AWS, Azure, GCP?)
- How many users will be affected?
- What's your timeline for the migration?

MANAGED SERVICES:
- How many users/devices would be under management?
- What's your biggest IT headache right now?
- Do you have any in-house IT staff?
- What's your current monthly IT spend (rough range)?

NETWORKING:
- What's the issue? (slow WiFi, new office setup, network redesign?)
- How large is the space? (sqm or number of floors?)
- How many users/devices connect to the network?
- Do you have a floor plan available?

GENERAL (if service unclear):
- What's the main IT challenge you're facing?
- How many people are in your company?
- Are you based in Tokyo or elsewhere in Japan?
- Is this urgent or are you planning ahead?

BALLPARK PRICING (share ranges when asked, always say "exact pricing depends on your specific needs"):
- Managed IT Services: from ~¥9,000/user/month (Essential) to ~¥27,000/user/month (Premium)
- Onsite Dispatch: from ¥25,000 base + ¥8,000/hour (Tokyo area)
- Cybersecurity Assessment: from ¥300,000 per engagement
- Office Relocation IT: from ¥150,000 (small) to ¥1,500,000+ (large)
- Data Destruction: from ¥3,000/unit (NIST 800-88 compliant, with certificate)
- AI Chatbot Setup: from ¥200,000 (basic) to ¥800,000 (custom integration)
- AI Workflow Automation: from ¥150,000 per workflow
- Wireless Survey: from ¥100,000 per floor
Always add: "We can give you an exact quote after a quick consultation. Want to schedule one?"

IMPORTANT RULES:
- Ask only 1-2 questions at a time — don't overwhelm
- When sharing pricing, always give RANGES and emphasize these are ballpark estimates
- Never guarantee specific outcomes
- If asked about competitors, stay professional — focus on Thinkers strengths
- If the conversation goes off-topic, gently steer back to how you can help
- Keep responses SHORT and conversational — this is a chat, not an essay
- After gathering enough info (usually 4-6 exchanges), suggest a consultation or direct them to the Get Started form at /get-started.html`;

function getChatProviderOrder(env) {
  const requested = String(env.AI_CHAT_PRIMARY_PROVIDER || 'gemini').toLowerCase();
  const order = requested === 'workers-ai'
    ? ['workers-ai', 'gemini']
    : ['gemini', 'workers-ai'];

  const geminiEnabled = env.GEMINI_API_KEY && env.GEMINI_ENABLED !== 'false';
  const workersEnabled = !!env.AI;

  return order.filter((provider) => {
    if (provider === 'gemini') return geminiEnabled;
    if (provider === 'workers-ai') return workersEnabled;
    return false;
  });
}

function detectLang(text) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(String(text || '')) ? 'ja' : 'en';
}

function normalizeHistoryMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((entry) => {
      const role = entry?.role === 'assistant' ? 'assistant' : 'user';
      const content = String(entry?.content || '').trim().slice(0, 2000);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

function pickBestHistory(storedHistory, clientHistory) {
  const stored = normalizeHistoryMessages(storedHistory);
  const client = normalizeHistoryMessages(clientHistory);
  if (client.length > stored.length) return client;
  if (stored.length > 0) return stored;
  return client;
}

function appendUserMessage(history, message) {
  const content = String(message || '').trim().slice(0, 2000);
  if (!content) return history;
  const last = history[history.length - 1];
  if (last?.role === 'user' && last?.content === content) return history;
  history.push({ role: 'user', content });
  return history;
}

function countMatches(text, regex) {
  const matches = String(text || '').match(regex);
  return matches ? matches.length : 0;
}

function extractConversationFacts(history, message) {
  const normalizedHistory = normalizeHistoryMessages(history);
  const latest = String(message || '').trim();
  const userTexts = normalizedHistory.filter((m) => m.role === 'user').map((m) => m.content);
  if (latest) userTexts.push(latest);

  const combined = userTexts.join('\n');
  const lowerAll = combined.toLowerCase();
  const lowerLatest = latest.toLowerCase();
  const lang = detectLang(combined || latest);

  const servicePatterns = {
    support: /(it support|helpdesk|service desk|microsoft 365|google workspace|account|ticket|user support|ongoing support|itサポート|ヘルプデスク|ユーザーサポート|アカウント)/gi,
    security: /(security|cyber|intune|mfa|defender|endpoint|compliance|cleanup plan|offboarding access|セキュリティ|コンプライアンス|intune|mfa|defender)/gi,
    itad: /(itad|retrieval|retrieve|dispose|disposal|wipe|wiping|asset|laptop|device retrieval|pickup|回収|廃棄|消去|端末|資産)/gi,
    office: /(office|move|relocation|setup|launch|opening|site|network setup|office setup|移転|拠点|オフィス|立ち上げ|開設|現場)/gi,
    pricing: /(price|pricing|quote|cost|budget|料金|見積|費用|価格)/gi
  };

  const serviceScores = {
    support: countMatches(lowerAll, servicePatterns.support) + countMatches(lowerLatest, servicePatterns.support) * 2,
    security: countMatches(lowerAll, servicePatterns.security) + countMatches(lowerLatest, servicePatterns.security) * 3,
    itad: countMatches(lowerAll, servicePatterns.itad) + countMatches(lowerLatest, servicePatterns.itad) * 2,
    office: countMatches(lowerAll, servicePatterns.office) + countMatches(lowerLatest, servicePatterns.office) * 2
  };

  let service = 'general';
  let bestScore = 0;
  for (const [key, score] of Object.entries(serviceScores)) {
    if (score > bestScore) {
      bestScore = score;
      service = key;
    }
  }

  const cityPatterns = [
    ['Tokyo', /(tokyo|東京都|東京)/i],
    ['Osaka', /(osaka|大阪)/i],
    ['Nagoya', /(nagoya|名古屋)/i],
    ['Fukuoka', /(fukuoka|福岡)/i],
    ['Sapporo', /(sapporo|札幌)/i],
    ['Sendai', /(sendai|仙台)/i],
    ['Hiroshima', /(hiroshima|広島)/i],
    ['Naha', /(naha|沖縄|那覇)/i]
  ];
  const city = cityPatterns.find(([, pattern]) => pattern.test(combined))?.[0] || '';

  const countMatch = combined.match(/(\d{1,4})\s*(users?|devices?|units?|台|人)/i);
  const countValue = countMatch ? countMatch[1] : '';
  const countLabel = countMatch ? countMatch[2] : '';

  const envList = [];
  if (/microsoft 365/i.test(combined)) envList.push('Microsoft 365');
  if (/google workspace/i.test(combined)) envList.push('Google Workspace');
  if (/intune/i.test(combined)) envList.push('Intune');
  if (/windows/i.test(combined)) envList.push('Windows');
  if (/mac|macos/i.test(combined)) envList.push('Mac');

  let timeline = '';
  if (/(next week|来週)/i.test(combined)) timeline = lang === 'ja' ? '来週' : 'next week';
  else if (/(this week|今週)/i.test(combined)) timeline = lang === 'ja' ? '今週' : 'this week';
  else if (/(tomorrow|明日)/i.test(combined)) timeline = lang === 'ja' ? '明日' : 'tomorrow';
  else if (/(asap|urgent|immediately|至急|緊急|急ぎ)/i.test(combined)) timeline = lang === 'ja' ? '至急' : 'urgent';

  const isSummaryRequest = /(summari[sz]e|summary|recap|what did i say|what have you learned|one sentence|要約|まとめ|何を伝えた|覚えて)/i.test(latest);
  const isPricing = countMatches(lowerAll, servicePatterns.pricing) > 0 || countMatches(lowerLatest, servicePatterns.pricing) > 0;

  return {
    lang,
    service,
    city,
    countValue,
    countLabel,
    environments: envList,
    timeline,
    isSummaryRequest,
    isPricing,
    combined,
    latest
  };
}

function buildSummaryReply(facts) {
  const serviceLabelEn = {
    support: 'bilingual IT support',
    security: 'security or Intune cleanup',
    itad: 'device retrieval / ITAD',
    office: 'office setup or relocation',
    general: 'help in Japan'
  };
  const serviceLabelJa = {
    support: 'バイリンガルITサポート',
    security: 'セキュリティやIntune整理',
    itad: '端末回収 / ITAD',
    office: '拠点立ち上げや移転',
    general: '日本でのIT支援'
  };

  if (facts.lang === 'ja') {
    const parts = [serviceLabelJa[facts.service] || serviceLabelJa.general];
    if (facts.city) parts.push(`${facts.city}`);
    if (facts.countValue && facts.countLabel) parts.push(`${facts.countValue}${facts.countLabel}`);
    if (facts.timeline) parts.push(facts.timeline);
    return `これまでの内容では、${parts.join('・')}のご相談です。必要であれば、この内容を前提に次に確認すべき点を1つずつ整理します。`;
  }

  const parts = [serviceLabelEn[facts.service] || serviceLabelEn.general];
  if (facts.city) parts.push(`in ${facts.city}`);
  if (facts.countValue && facts.countLabel) parts.push(`for ${facts.countValue} ${facts.countLabel}`);
  if (facts.timeline) parts.push(facts.timeline);
  return `So far, you’re asking about ${parts.join(' ')}. If you want, I can use that as the working summary and ask only the next missing detail.`;
}

function generateRuleBasedReply(message, history = []) {
  const facts = extractConversationFacts(history, message);

  if (facts.isSummaryRequest) {
    return buildSummaryReply(facts);
  }

  if (facts.lang === 'ja') {
    if (facts.isPricing) {
      return '概算は内容次第ですが、たとえばオンサイト対応は東京圏で基本料金25,000円＋時間単価、データ消去は1台3,000円から、セキュリティ診断は30万円からが目安です。対象拠点、台数、希望時期が分かれば、もう少し実務寄りに絞れます。';
    }
    if (facts.service === 'itad') {
      if (facts.city && facts.countValue && facts.timeline) {
        return `${facts.city}で${facts.timeline}、${facts.countValue}${facts.countLabel || '台'}の端末回収 / ITADですね。回収、消去、記録、証明書まで進められます。次に、対象機器の種類と消去証跡の要否を教えてください。`;
      }
      if (facts.city && facts.countValue) {
        return `${facts.city}で${facts.countValue}${facts.countLabel || '台'}の端末回収 / ITADですね。次に、希望時期と、チェーン・オブ・カストディや消去証明書が必要かを教えてください。`;
      }
      return '端末回収やITADのご相談ですね。対象の都市、台数、機器の種類、データ消去証跡の要否が分かると進めやすいです。必要なら回収、消去、記録、証明書まで一括で整理できます。';
    }
    if (facts.service === 'security') {
      if (facts.environments.includes('Intune')) {
        return 'Intuneやコンプライアンス整理のご相談ですね。影響しているユーザー数または端末数、Microsoft 365 側も含むか、どのくらい急ぎかを教えてください。オフボーディング後の設定ずれや証跡整理も含めて進められます。';
      }
      return 'セキュリティや運用整理も対応可能です。現在の課題、対象ユーザー数、使っているツール、急ぎ度を教えてください。実務に落ちる是正と証跡づくりを中心に進めます。';
    }
    if (facts.service === 'support') {
      if (facts.countValue && facts.environments.length > 0) {
        return `ありがとうございます。${facts.countValue}${facts.countLabel || '名'}規模で ${facts.environments.join(' / ')} の支援ですね。継続運用か単発対応か、いま一番困っている内容を教えてください。`;
      }
      if (facts.countValue) {
        return `ありがとうございます。${facts.countValue}${facts.countLabel || '名'}規模の支援ですね。次に、利用環境と、継続運用か単発対応かを教えてください。`;
      }
      return 'ITサポートのご相談ありがとうございます。対象ユーザー数、利用環境、継続運用か単発対応かを教えてください。英語報告と日本語現地対応の両方に合わせられます。';
    }
    if (facts.service === 'office') {
      return '日本での拠点立ち上げや移転支援ですね。都市名、現場数、対象ユーザー数、いつまでに必要かを教えてください。回線、端末、現地調整、完了記録までまとめて整理できます。';
    }
    if (facts.city || facts.countValue || facts.timeline) {
      return `ありがとうございます。${[facts.city, facts.countValue && facts.countLabel ? `${facts.countValue}${facts.countLabel}` : '', facts.timeline].filter(Boolean).join('・')}までは把握できました。次に、ITサポート、端末回収 / ITAD、拠点対応、セキュリティ整理のどれに近いか教えてください。`;
    }
    return 'ありがとうございます。日本で何を進めたいか、対象拠点、ユーザー数または端末数、希望時期が分かると具体的にご案内できます。必要ならエンジニアへの引き継ぎ前提で整理します。';
  }

  if (facts.isPricing) {
    return 'Ballpark pricing depends on scope, but onsite dispatch typically starts around ¥25,000 plus hourly time, certified data destruction from about ¥3,000 per unit, and security assessments from around ¥300,000. If you share the city, device or user count, and timeline, I can narrow the right lane for you.';
  }
  if (facts.service === 'itad') {
    if (facts.city && facts.countValue && facts.timeline) {
      return `Understood. You need device retrieval or ITAD in ${facts.city} ${facts.timeline} for ${facts.countValue} ${facts.countLabel || 'devices'}. We can help with pickup, wiping, and closeout records. Do you also need chain-of-custody or destruction certificates?`;
    }
    if (facts.city && facts.countValue) {
      return `Got it. You need device retrieval or ITAD in ${facts.city} for ${facts.countValue} ${facts.countLabel || 'devices'}. What is the target timing, and do you also need chain-of-custody or destruction certificates?`;
    }
    return 'Yes, we can help with retrieval, wiping, and ITAD closeout in Japan. The fastest way to scope this is to share the city, approximate unit count, device types, and whether you need chain-of-custody or destruction certificates.';
  }
  if (facts.service === 'security') {
    if (facts.environments.includes('Intune')) {
      return 'Understood. This sounds like Intune or compliance cleanup, possibly around offboarding or endpoint control drift. Tell me how many users or devices are affected, whether this is Microsoft 365 only or also endpoints, and how urgent it is.';
    }
    return 'We can help with practical security cleanup, especially around Microsoft 365, Intune, endpoint controls, and documented remediation. Tell me the main issue, the number of users or devices, and how urgent this is.';
  }
  if (facts.service === 'support') {
    if (facts.countValue && facts.environments.length > 0) {
      return `Got it. This looks like bilingual IT support for ${facts.countValue} ${facts.countLabel || 'users'} using ${facts.environments.join(' / ')}. Is this ongoing support or a specific issue you want solved first?`;
    }
    if (facts.countValue) {
      return `Got it. This looks like support for ${facts.countValue} ${facts.countLabel || 'users'}. What environment are you using, and is this ongoing support or a specific issue you want solved first?`;
    }
    return 'Yes, we can help with bilingual IT support in Japan. Please share how many users or devices are involved, your environment such as Microsoft 365 or Google Workspace, and whether this is ongoing support or a specific issue.';
  }
  if (facts.service === 'office') {
    return 'We can support office setup, moves, and onsite coordination in Japan. Please share the city, site count, rough user count, and target timing so I can point you to the right next step.';
  }
  if (facts.city || facts.countValue || facts.timeline) {
    return `Thanks. I have ${[facts.city, facts.countValue && facts.countLabel ? `${facts.countValue} ${facts.countLabel}` : '', facts.timeline].filter(Boolean).join(', ')} so far. What kind of work is this closest to: IT support, device retrieval / ITAD, office setup, or security cleanup?`;
  }
  return 'Thanks for reaching out. Tell me what needs to get done in Japan, which city or site is involved, the rough user or device count, and your target timing, and I’ll help map the next step.';
}

async function startGeminiStream(env, recentHistory) {
  const geminiContents = recentHistory.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;
  const geminiResponse = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
      contents: geminiContents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 }
    })
  });

  if (!geminiResponse.ok) {
    throw new Error(`Gemini API error: ${geminiResponse.status}`);
  }

  return { stream: geminiResponse.body, streamType: 'gemini' };
}

async function startWorkersAIStream(env, messages) {
  const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    max_tokens: 300,
    temperature: 0.6,
    stream: true
  });

  return { stream, streamType: 'workers-ai' };
}

async function generateGeminiText(env, recentHistory) {
  const geminiContents = recentHistory.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const geminiResponse = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
      contents: geminiContents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 }
    })
  });

  if (!geminiResponse.ok) {
    throw new Error(`Gemini API error: ${geminiResponse.status}`);
  }

  const payload = await geminiResponse.json();
  return payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim() || '';
}

async function generateWorkersAIText(env, messages) {
  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    max_tokens: 300,
    temperature: 0.6,
    stream: false
  });

  return String(result?.response || result?.result || '').trim();
}

/**
 * Handle incoming chat message — returns streaming SSE response
 */
export async function handleChat(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (env.ENVIRONMENT === 'production' && !origin.includes('thinkersgk.com')) {
    return jsonResp({ error: 'Forbidden' }, 403);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResp({ error: 'Invalid JSON' }, 400);
  }

  const { session_id, message, history: clientHistory } = data;
  if (!message || !message.trim()) {
    return jsonResp({ error: 'Message is required' }, 400);
  }

  // Get or create session
  const sessionId = session_id || crypto.randomUUID();
  const historyKey = `chat:${sessionId}`;

  // Load conversation history from KV
  let history = [];
  try {
    const stored = await env.SUBMISSIONS.get(historyKey, 'json');
    if (stored && Array.isArray(stored.messages)) {
      history = stored.messages;
    }
  } catch (err) {
    console.error('Failed to load chat history:', err);
  }

  history = pickBestHistory(history, clientHistory);

  // Add user message to history
  appendUserMessage(history, message);

  // Keep last 20 messages to stay within token limits
  const recentHistory = history.slice(-20);

  // Build messages array for AI
  const messages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...recentHistory
  ];

  const providerOrder = getChatProviderOrder(env);

  // Check if any AI provider is available
  if (providerOrder.length === 0) {
    const fallbackMsg = generateRuleBasedReply(message, recentHistory);
    history.push({ role: 'assistant', content: fallbackMsg });
    await saveHistory(env, historyKey, history, sessionId);
    return jsonResp({ session_id: sessionId, message: fallbackMsg, streaming: false }, 200, origin);
  }

  // Reliability-first path: use non-streaming responses.
  // The frontend already supports JSON replies, and this avoids brittle SSE/provider startup issues.
  for (const provider of providerOrder) {
    try {
      let text = '';

      if (provider === 'gemini') {
        text = await generateGeminiText(env, recentHistory);
      } else if (provider === 'workers-ai') {
        text = await generateWorkersAIText(env, messages);
      }

      if (text) {
        history.push({ role: 'assistant', content: text });
        await saveHistory(env, historyKey, history, sessionId);
        return jsonResp({ session_id: sessionId, message: text, streaming: false }, 200, origin);
      }
    } catch (err) {
      console.error(`${provider} non-streaming chat provider failed:`, err);
    }
  }

  const fallbackMsg = generateRuleBasedReply(message, recentHistory);
  history.push({ role: 'assistant', content: fallbackMsg });
  await saveHistory(env, historyKey, history, sessionId);
  return jsonResp({ session_id: sessionId, message: fallbackMsg, streaming: false }, 200, origin);

  try {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const processStream = async () => {
      let fullResponse = '';
      const reader = aiStream.getReader();

      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ session_id: sessionId })}\n\n`));

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                let text = null;

                if (streamType === 'gemini') {
                  text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                } else {
                  text = parsed?.response;
                }

                if (text) {
                  fullResponse += text;
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        await writer.write(encoder.encode('data: [DONE]\n\n'));

        if (fullResponse) {
          history.push({ role: 'assistant', content: fullResponse });
        }
        await saveHistory(env, historyKey, history, sessionId);

      } catch (err) {
        console.error('Stream processing error:', err);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
      } finally {
        await writer.close();
      }
    };

    processStream();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });

  } catch (err) {
    console.error('Chat AI error:', err);
    const errorMsg = 'I apologize, but I\'m having trouble right now. Please try again in a moment, or feel free to use our contact form at /contact.html';
    history.push({ role: 'assistant', content: errorMsg });
    await saveHistory(env, historyKey, history, sessionId);
    return jsonResp({ session_id: sessionId, message: errorMsg, streaming: false }, 200, origin);
  }
}

/**
 * Handle escalation to human engineer
 */
export async function handleEscalate(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (env.ENVIRONMENT === 'production' && !origin.includes('thinkersgk.com')) {
    return jsonResp({ error: 'Forbidden' }, 403);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResp({ error: 'Invalid JSON' }, 400);
  }

  const { session_id, company, email, address, phone, preferred_contact } = data;
  if (!session_id) {
    return jsonResp({ error: 'Session ID is required' }, 400);
  }

  // Load chat history
  const historyKey = `chat:${session_id}`;
  let history = [];
  let meta = {};
  try {
    const stored = await env.SUBMISSIONS.get(historyKey, 'json');
    if (stored) {
      history = stored.messages || [];
      meta = stored.meta || {};
    }
  } catch (err) {
    console.error('Failed to load chat history for escalation:', err);
  }

  // Mark session as escalated
  meta.escalated = true;
  meta.escalated_at = new Date().toISOString();
  meta.contact_company = company || meta.contact_company || '';
  meta.contact_email = email || meta.contact_email || '';
  meta.contact_address = address || meta.contact_address || '';
  meta.contact_phone = phone || meta.contact_phone || '';
  meta.preferred_contact = preferred_contact || 'email';

  await saveHistory(env, historyKey, history, session_id, meta);

  // Format conversation transcript for Telegram
  const transcript = history
    .map(m => `${m.role === 'user' ? '👤 Client' : '🤖 AI'}: ${m.content}`)
    .join('\n\n');

  const contactInfo = [
    company ? `🏢 Company: ${escapeHtml(company)}` : null,
    email ? `📧 Email: ${escapeHtml(email)}` : null,
    address ? `📍 Address: ${escapeHtml(address)}` : null,
    phone ? `📞 Phone: ${escapeHtml(phone)}` : null,
    preferred_contact ? `💬 Preferred: ${preferred_contact}` : null,
  ].filter(Boolean).join('\n');

  const telegramMsg = [
    `🚨 <b>ENGINEER REQUEST — Client wants to talk to a human!</b>`,
    ``,
    contactInfo || '(No contact info provided yet)',
    ``,
    `─── Chat Transcript (${history.length} messages) ───`,
    ``,
    escapeHtml(transcript).slice(0, 3000),
    ``,
    `🔗 Session: <code>${session_id}</code>`,
    `🕐 ${new Date().toISOString()}`
  ].join('\n');

  // Send to Telegram
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: telegramMsg,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      if (!res.ok) console.error('Telegram escalation error:', await res.text());
    } catch (err) {
      console.error('Telegram escalation failed:', err);
    }
  }

  // Also store as a lead in KV
  const leadKey = `escalation:${new Date().toISOString()}:${session_id}`;
  try {
    await env.SUBMISSIONS.put(leadKey, JSON.stringify({
      session_id,
      company: company || '',
      email: email || '',
      address: address || '',
      phone: phone || '',
      preferred_contact: preferred_contact || 'email',
      message_count: history.length,
      transcript: transcript.slice(0, 5000),
      escalated_at: new Date().toISOString()
    }), { expirationTtl: 90 * 24 * 60 * 60 });
  } catch (err) {
    console.error('Failed to store escalation:', err);
  }

  return jsonResp({
    success: true,
    message: 'We\'ve notified our engineering team. Someone will reach out to you shortly!'
  }, 200, origin);
}

/**
 * Save chat history to KV
 */
async function saveHistory(env, key, messages, sessionId, meta = {}) {
  try {
    await env.SUBMISSIONS.put(key, JSON.stringify({
      session_id: sessionId,
      messages: messages.slice(-30), // Keep last 30 messages
      meta: {
        ...meta,
        updated_at: new Date().toISOString(),
        message_count: messages.length
      }
    }), {
      expirationTtl: 7 * 24 * 60 * 60  // 7-day TTL for chat sessions
    });
  } catch (err) {
    console.error('Failed to save chat history:', err);
  }
}

function jsonResp(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    }
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
