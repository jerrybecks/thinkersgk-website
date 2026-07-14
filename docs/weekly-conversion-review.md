# Thinkers GK Weekly Conversion Review

## Purpose
This is a lightweight weekly operator review for the Thinkers GK website.

It is designed to answer one practical question:

> Is the website creating more commercially useful intent this week, and through which path?

This is not a marketing vanity report. It is a small operating review for deciding what to improve next.

## Review cadence
- **Frequency**: once per week
- **Owner**: Thinkers GK operator / website owner
- **Recommended day**: same day each week
- **Recommended window**: last 7 days compared to previous 7 days

## Source
- Umami event reporting for the Thinkers GK site
- Use the event names defined in `docs/conversion-measurement-spec.md`
- Fill the reusable report shell in `docs/weekly-conversion-review-template.md`
- Use `docs/conversion-review-worksheet.md` to collect counts and turn them into one weekly decision

## Weekly scoreboard
Record only the signals that change decisions.

| Area | Event(s) | This week | Previous week | Direction | Notes |
|---|---|---:|---:|---|---|
| Homepage contact intent | `homepage_consultation_click` + `homepage_start_project_click` + `homepage_tell_us_click` + `homepage_footer_contact_click` |  |  |  |  |
| Homepage services evaluation | `homepage_explore_services_click` |  |  |  |  |
| Blog-to-services routing | `blog_lane_review_services_click` |  |  |  |  |
| Blog-to-contact routing | `blog_lane_contact_click` |  |  |  |  |
| Blog-to-ITAD routing | `blog_lane_itad_click` |  |  |  |  |
| Calendar intent | `contact_consultation_choice_click` + `contact_calendar_open_click` + `consultation_calendar_click` |  |  |  |  |
| LINE intent | `contact_line_secondary_click` + `contact_line_click` |  |  |  |  |
| Form-path choice | `contact_form_choice_click` |  |  |  |  |
| Form attempts | `contact_form_submit_attempt` |  |  |  |  |
| Form successes | `contact_form_submit_success` |  |  |  |  |

## Core review questions
Answer these every week.

### 1. Is homepage commercial intent rising?
Look at:
- `homepage_consultation_click`
- `homepage_start_project_click`
- `homepage_tell_us_click`
- `homepage_footer_contact_click`

If these are flat or falling, the homepage may still need stronger message-to-CTA continuity.

### 2. Is the blog helping revenue lanes?
Look at:
- `blog_lane_review_services_click`
- `blog_lane_contact_click`
- `blog_lane_itad_click`

If article traffic exists but these events are weak, the blog may need better lead-routing or stronger CTA placement.

### 3. Which contact channel do visitors prefer?
Compare:
- calendar intent
- LINE intent
- form successes

This helps decide whether the business should emphasize scheduled consults, chat-style contact, or written inquiry flow.

### 4. Is the contact form losing people?
Compare:
- `contact_form_submit_attempt`
- `contact_form_submit_success`

If attempts are significantly above successes, inspect for form friction, confusing fields, mobile UX issues, or delivery failures.

## Decision rules
Use the review to choose action, not just to observe numbers.

| Pattern | Likely meaning | Recommended action |
|---|---|---|
| Homepage contact intent up, form success up | Core buyer path is improving | Keep current messaging and review service-page depth next |
| Homepage services clicks up, contact intent flat | Visitors are interested but not ready to inquire | Strengthen services-page CTA and buyer guidance |
| Blog routing weak, article traffic present | Blog informs but does not hand off commercially | Improve blog lane CTAs and article-end handoffs |
| Calendar clicks dominate | Buyers prefer synchronous conversation | Emphasize consult-booking path more visibly |
| LINE clicks dominate | Buyers want lower-friction contact | Consider more visible chat-oriented prompts |
| Form attempts high, successes low | Conversion friction or submission issue | Audit contact UX and form delivery immediately |
| ITAD routing strongest | Lifecycle/disposal positioning is resonating | Expand ITAD-adjacent offers, case examples, or CTA prominence |

## Weekly operator note template
Fill this out in 3-6 lines.

### What got stronger?
- 

### What stayed weak?
- 

### Most preferred contact path this week
- 

### One change to make next
- 

### One thing to avoid overreacting to
- 

## Suggested operating sequence
1. Pull the last 7 days of Umami event counts.
2. Compare against the prior 7 days.
3. Fill the scoreboard.
4. Write the short operator note.
5. Choose only **one** website improvement priority for the next week.

## Recommended first priority order when numbers are weak
1. Fix contact friction
2. Strengthen homepage contact intent
3. Strengthen blog-to-commercial routing
4. Deepen winning service lanes

## Interpretation cautions
- Do not overreact to one weak week with low traffic.
- Do not optimize for clicks that do not lead to contact-path movement.
- Do not create more content until you know whether the current paths are routing visitors commercially.
- Do not judge success only by total sessions; intent movement matters more.
