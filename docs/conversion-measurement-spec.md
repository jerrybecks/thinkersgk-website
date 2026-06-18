# Thinkers GK Conversion Measurement Spec

## Purpose
This document defines the lightweight conversion events currently instrumented on the Thinkers GK website and explains what each event means from a business perspective.

The goal is not broad analytics vanity reporting. The goal is to answer a small set of operator questions:

1. Are visitors showing clear buying intent from the homepage?
2. Is the blog routing visitors into commercial next steps?
3. Which contact path is preferred: form, calendar, or LINE?
4. Are inquiries successfully completing after contact intent is shown?

## Current analytics approach
- **Vendor**: Umami
- **Implementation style**: lightweight custom events through shared site JS
- **Scope**: only the highest-value buyer-path CTAs and contact-path actions
- **Non-goal**: no broad event sprawl, no noisy tracking of every click

## Event taxonomy

### Homepage intent events
| Event name | Trigger | Business meaning | Priority |
|---|---|---|---|
| `homepage_consultation_click` | Visitor clicks the main hero consultation CTA | Strong top-of-funnel contact intent from homepage | High |
| `homepage_explore_services_click` | Visitor clicks hero services CTA | Visitor wants qualification before contacting | High |
| `homepage_start_project_click` | Visitor clicks mid-page start-project CTA | Commercial intent after reading operating-fit content | High |
| `homepage_tell_us_click` | Visitor clicks the self-selection/problem CTA | Visitor is ready to describe a need | High |
| `homepage_footer_contact_click` | Visitor clicks the closing homepage contact CTA | Late-page contact intent after fuller evaluation | Medium |

### Blog routing events
| Event name | Trigger | Business meaning | Priority |
|---|---|---|---|
| `blog_lane_review_services_click` | Visitor clicks the blog lane CTA to services | Blog reader is moving from education to service evaluation | High |
| `blog_lane_contact_click` | Visitor clicks the blog lane CTA to contact | Blog reader is ready to initiate a conversation | High |
| `blog_lane_about_click` | Visitor clicks the blog lane CTA to about/how-we-work | Blog reader needs trust/process validation before contacting | Medium |
| `blog_lane_itad_click` | Visitor clicks the blog lane CTA to ITAD Japan | Blog reader is expressing lifecycle/ITAD-specific interest | High |
| `blog_lane_ai_article_click` | Visitor clicks the modernization-planning AI article CTA where present | Visitor is following the AI modernization reading lane | Medium |

### Contact-path events
| Event name | Trigger | Business meaning | Priority |
|---|---|---|---|
| `contact_calendar_open_click` | Visitor clicks the calendar CTA | Preference for scheduled conversation over written inquiry | High |
| `contact_line_inline_click` | Visitor clicks LINE from the contact page | Preference for fast chat-style contact | High |
| `contact_email_click` | Visitor clicks a `mailto:` contact path | Preference for direct email contact | Medium |
| `contact_form_submit_attempt` | Contact form is submitted | User crossed the strongest on-page intent threshold | High |
| `contact_form_submit_success` | Contact form submission succeeds | Completed written conversion | Critical |

### Shared route-intent events from delegated tracking
| Event name | Trigger | Business meaning | Priority |
|---|---|---|---|
| `contact_page_click` | Visitor clicks a tracked route into contact | General contact intent from a non-explicit CTA | Medium |
| `services_page_click` | Visitor clicks a tracked route into services | General commercial evaluation intent | Medium |
| `how_we_work_click` | Visitor clicks into process/working-style detail | Trust/process validation intent | Low-Medium |
| `itad_japan_click` | Visitor clicks into the ITAD lane | Strong lifecycle/disposal interest | High |
| `blog_article_click` | Visitor clicks a tracked blog article link | Content consumption / problem exploration | Low-Medium |
| `blog_index_click` | Visitor clicks into the blog index | Early-stage research intent | Low-Medium |
| `consultation_calendar_click` | Visitor clicks a Cal.com route outside the explicit contact-page CTA | Scheduling intent from shared routing | High |
| `contact_line_click` | Visitor clicks a LINE route outside the explicit contact-page CTA | Chat-led contact intent from shared routing | High |

## Event payload shape
Current shared payloads can include:
- `path` — page path where the click or submit occurred
- `href` — clicked URL when relevant
- `text` — CTA text when relevant
- `lang` — page language (`en` / `ja`)
- `form_id` — form identifier for submit attempt events
- `action` — form action URL for submit attempt events
- `service` — selected inquiry category for successful form submits

## Business interpretation rules

### 1. Homepage effectiveness
Treat these as the main homepage buying-intent signals:
- `homepage_consultation_click`
- `homepage_start_project_click`
- `homepage_tell_us_click`
- `homepage_footer_contact_click`

If those rise while traffic quality remains similar, homepage messaging is likely improving.

### 2. Blog commercial usefulness
Treat these as the main blog commercial routing signals:
- `blog_lane_review_services_click`
- `blog_lane_contact_click`
- `blog_lane_itad_click`

If blog article views rise but these do not, the blog is acting more like passive content than a lead-routing asset.

### 3. Contact-path preference
Compare:
- `contact_form_submit_success`
- `contact_calendar_open_click`
- `contact_line_inline_click`
- `consultation_calendar_click`
- `contact_line_click`

This helps decide which communication mode visitors actually prefer.

### 4. Contact friction
Compare:
- `contact_form_submit_attempt`
- `contact_form_submit_success`

If attempts are materially higher than successes, the form path may contain friction or delivery problems.

## Current recommended KPI set
Keep the KPI set intentionally small.

| KPI | Primary event(s) | Why it matters |
|---|---|---|
| Homepage contact intent | `homepage_consultation_click`, `homepage_start_project_click`, `homepage_tell_us_click`, `homepage_footer_contact_click` | Measures whether the homepage creates commercial action |
| Blog-to-commercial routing | `blog_lane_review_services_click`, `blog_lane_contact_click`, `blog_lane_itad_click` | Measures whether blog traffic moves toward revenue lanes |
| Contact completion | `contact_form_submit_success` | Strongest on-site written conversion signal |
| Contact preference mix | calendar / LINE / form success events | Helps prioritize contact UX and staffing response channels |
| Contact friction | attempts vs successes | Helps detect form-path breakdowns |

## Guardrails
- Do **not** add dozens of low-value events just because tracking is easy.
- Do **not** treat raw traffic growth as success without intent movement.
- Do **not** compare Japanese and English traffic only by volume; compare by intent quality too.
- Do **not** turn this into a public-facing dashboard. This is operator instrumentation.

## Suggested next instrumentation only if needed later
Only extend after 2-4 weeks of signal collection.

Potential later additions:
- service-page primary CTA clicks by top service lane
- Japanese-page vs English-page contact intent split
- article-level lead-routing winners by post slug
- thank-you-state view if a dedicated confirmation state/page is added
