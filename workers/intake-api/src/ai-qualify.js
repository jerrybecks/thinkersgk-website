/**
 * AI Lead Qualification Module
 *
 * Uses Cloudflare Workers AI to analyze incoming inquiries and generate:
 * - Lead score (1-10)
 * - Urgency level (low/medium/high/critical)
 * - Recommended service match
 * - Suggested response approach
 * - Agent routing (which OpenClaw agent should handle)
 */

const SYSTEM_PROMPT = `You are an AI lead qualification assistant for Thinkers GK, a premium IT services company based in Tokyo, Japan.

ABOUT THINKERS GK:
- Premium IT services for businesses in Japan (local and international)
- Services: IT Support & Helpdesk, Field Engineering, Cybersecurity, IT Asset Lifecycle, Cloud & Consulting, Managed Services, Onsite Dispatch, Office Relocation, IT Project Management, Networking, AV Solutions, VoIP
- Target clients: Companies with 10-500 employees, especially foreign companies with Japan branches
- Languages: Japanese and English (bilingual support)
- Based in Tokyo, serves all of Japan

YOUR TASK:
Analyze the incoming inquiry and return a JSON object with:
1. "score" (1-10): Lead quality score
   - 8-10: Hot lead (clear budget, urgent need, good fit)
   - 5-7: Warm lead (interested, needs nurturing)
   - 1-4: Cold lead (spam, irrelevant, or very early stage)
2. "urgency": "low" | "medium" | "high" | "critical"
3. "service_match": Best matching service from our catalog
4. "company_size": Estimated company size if mentioned ("unknown" if not)
5. "language": "en" | "ja" | "both" (detected language of inquiry)
6. "summary": 1-2 sentence summary of what they need (in English)
7. "suggested_response": Brief suggested response approach for the sales team
8. "agent": Which agent should handle this: "alex" (sales/new business), "kenji" (support/technical), "jeff" (management/strategic)
9. "tags": Array of relevant tags like ["urgent", "cybersecurity", "enterprise", "foreign-company", "smb"]

RESPOND WITH ONLY VALID JSON. No markdown, no explanation.`;

/**
 * Qualify a lead using Cloudflare Workers AI
 */
export async function qualifyLead(ai, submission) {
  const userMessage = formatSubmissionForAI(submission);

  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.3  // Low temp for consistent, structured output
    });

    const text = response.response || '';

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI response not valid JSON:', text);
      return fallbackQualification(submission);
    }

    const qualification = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the qualification
    return {
      score: clamp(qualification.score || 5, 1, 10),
      urgency: ['low', 'medium', 'high', 'critical'].includes(qualification.urgency)
        ? qualification.urgency : 'medium',
      service_match: qualification.service_match || submission.service || 'General Inquiry',
      company_size: qualification.company_size || 'unknown',
      language: ['en', 'ja', 'both'].includes(qualification.language)
        ? qualification.language : 'en',
      summary: (qualification.summary || '').slice(0, 500),
      suggested_response: (qualification.suggested_response || '').slice(0, 500),
      agent: ['alex', 'kenji', 'jeff'].includes(qualification.agent)
        ? qualification.agent : 'alex',
      tags: Array.isArray(qualification.tags)
        ? qualification.tags.slice(0, 10).map(t => String(t).slice(0, 30)) : [],
      ai_model: '@cf/meta/llama-3.1-8b-instruct',
      qualified_at: new Date().toISOString()
    };

  } catch (err) {
    console.error('AI qualification error:', err);
    return fallbackQualification(submission);
  }
}

/**
 * Format submission data for the AI prompt
 */
function formatSubmissionForAI(submission) {
  return [
    `NEW INQUIRY:`,
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    submission.company ? `Company: ${submission.company}` : null,
    submission.service ? `Service Interest: ${submission.service}` : null,
    `Country: ${submission.country || 'unknown'}`,
    ``,
    `Message:`,
    submission.message,
    ``,
    // Intake-specific fields (if present)
    submission.employees ? `Company Size: ${submission.employees} employees` : null,
    submission.budget ? `Budget Range: ${submission.budget}` : null,
    submission.timeline ? `Timeline: ${submission.timeline}` : null,
    submission.current_provider ? `Current IT Provider: ${submission.current_provider}` : null,
    submission.pain_points ? `Pain Points: ${submission.pain_points}` : null,
  ].filter(Boolean).join('\n');
}

/**
 * Fallback qualification when AI is unavailable
 */
function fallbackQualification(submission) {
  // Simple rule-based scoring
  let score = 5;
  const tags = [];

  // Has company name → more serious
  if (submission.company) { score += 1; tags.push('has-company'); }

  // Selected a specific service → higher intent
  if (submission.service && submission.service !== 'other') { score += 1; tags.push(submission.service); }

  // Longer message → more engaged
  if (submission.message && submission.message.length > 200) { score += 1; tags.push('detailed-inquiry'); }

  // Has intake fields → high intent
  if (submission.employees || submission.budget) { score += 1; tags.push('intake-form'); }

  // Keyword detection
  const msg = (submission.message || '').toLowerCase();
  if (msg.includes('urgent') || msg.includes('asap') || msg.includes('emergency') || msg.includes('緊急')) {
    tags.push('urgent');
  }
  if (msg.includes('budget') || msg.includes('予算')) { tags.push('has-budget'); score += 1; }

  return {
    score: clamp(score, 1, 10),
    urgency: tags.includes('urgent') ? 'high' : 'medium',
    service_match: submission.service || 'General Inquiry',
    company_size: 'unknown',
    language: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(submission.message) ? 'ja' : 'en',
    summary: `Inquiry from ${submission.name} about ${submission.service || 'IT services'}`,
    suggested_response: 'Review and respond within 24 hours',
    agent: 'alex',
    tags: tags,
    ai_model: 'fallback-rules',
    qualified_at: new Date().toISOString()
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
