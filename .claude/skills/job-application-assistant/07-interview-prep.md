---
framework_version: 1.0.1
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- These are populated by /setup from your actual experience. Below are templates showing the format. -->

### 1. SpecKit AI Validation Gates (AI-assisted engineering / process improvement)
**S:** On Project Tycho (Baker Hughes' cloud-first production-optimization platform), the team was seeing regression bugs slip through when AI-assisted code generation moved straight from spec to implementation without a review checkpoint.
**T:** As Key Engineer, ensure architectural alignment was verified before code got generated, without slowing the team down.
**A:** Integrated SpecKit's commands as human-in-the-loop validation gates, enforcing phase-level review before any code generation so architectural misalignments were caught at the specification stage rather than after implementation.
**R:** Achieved a 45% reduction in regression bugs.
**Use for:** "Tell me about a process improvement you drove", "How do you use AI tools responsibly in engineering?"

### 2. Real-Time Multi-Well State Management (Frontend architecture / scale)
**S:** Baker Hughes' Project Tycho dashboard needed to track well-selection state, real-time sensor feeds, alert queues, and user preferences simultaneously across multi-well monitoring views.
**T:** Build a state layer that stayed consistent and predictable as data volume and view complexity grew.
**A:** Implemented global application state management using Redux Toolkit (RTK), and layered RTK Query on top for cache-aware server-state management of ESP sensor API calls, eliminating redundant network requests through automatic caching and invalidation.
**R:** Delivered a consistent, predictable UI experience across multi-well views while improving dashboard load performance and reducing backend load during high-frequency sensor polling.
**Use for:** "Describe a complex frontend architecture problem you solved", "How do you manage state in large React apps?"

### 3. CDN-Backed Performance Optimization (Performance / user experience)
**S:** Business microsite pages for Proactive Technology Systems' "LoopIT" project were slow to become interactive for mobile users.
**T:** Improve Time-to-Interactive (TTI) for health-conscious local consumers browsing on mobile.
**A:** Delivered static assets via a CDN-backed pipeline (S3 + CloudFront) and added React component lazy-loading to defer non-critical rendering work.
**R:** Delivered fast, mobile-optimized discovery pages with measurably improved TTI.
**Use for:** "Tell me about a performance optimization you led", "How do you approach frontend performance?"

### 4. Micro-Frontend Architecture at Scale (Technical leadership / modularity)
**S:** Project Tycho needed to support multiple independent feature teams shipping to the same dashboard without blocking each other.
**T:** Introduce an architecture that supported modular, independently deployable frontend pieces.
**A:** Implemented advanced Webpack configurations for bundle splitting and built a micro-frontend architecture using Webpack 5 Module Federation, alongside reusable ReactJS components backed by 85% test coverage (Jest, React Testing Library).
**R:** Improved load times and modularity, letting teams ship independently with confidence in code quality.
**Use for:** "How do you design for scale/modularity?", "Tell me about a time you improved a team's ability to ship independently"

<!-- Add more STAR examples as needed. Aim for 4-6 covering different competencies. -->

## Common Tough Questions

### "Why did you leave [previous company]?"
> [PREPARE YOUR ANSWER - be honest, forward-looking, no negativity about former employer]

### "You don't have [specific skill/experience]."
> [PREPARE YOUR ANSWER - acknowledge the gap, bridge to adjacent experience, show willingness to learn]

### "Where do you see yourself in 5 years?"
> [PREPARE YOUR ANSWER - show ambition aligned with the role's growth path]

### "What's your biggest weakness?"
> [PREPARE YOUR ANSWER - genuine weakness with concrete mitigation strategy]

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
