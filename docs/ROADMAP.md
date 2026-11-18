# Growvidence roadmap

**Status:** Proposed roadmap; not a delivery commitment. The MVP estimate is 4–6 weeks of focused implementation after product and technical foundations are approved. Actual duration depends on validation, scope, and available capacity.

## Product outcome

Help a learner organize practice and build a trustworthy record of what they can demonstrate independently. The product should make the distinction between activity, assisted output, and demonstrated capability explicit.

## MVP — focused 4–6 week build

### Scope

- Responsive web application with accessible navigation and core layouts
- Account creation and secure session handling
- Task manager with Kanban and list views
- Daily, weekly, and monthly planning / review
- Learning log with AI-use disclosure
- Evidence records with artifact URL or attachment metadata, reflection, and status
- Initial competency framework and evidence rubric
- Basic dashboard and data export
- Privacy basics: view, export, and delete user data

### Deliverables

- Working end-to-end learner workflow
- Documented data model and API contracts
- Automated unit and end-to-end tests for critical journeys
- CI quality gates and deployment runbook
- Security, accessibility, and privacy review before release

### MVP exit criteria

- A new learner can create a task, record practice, attach evidence, and see the evidence linked to a competency
- AI assistance is disclosed for each relevant record
- Task completion cannot automatically mark a competency as mastered
- Export and account/data deletion flows are verified
- Critical user journeys pass automated tests
- No unresolved critical/high security findings at release approval

## v1 — learning workflow maturity

- Better learning tracks and reusable task templates
- Spaced review and reminders, with user-controlled scheduling
- Evidence review workflow and reviewer feedback
- Competency history, rubric versions, and transparent status changes
- PDF / CSV progress reports
- Improved offline reading and resilient draft capture
- Internationalization foundations and additional locales

## v2 — collaboration and mobile

- PWA installation and offline-first task/log workflows with conflict-aware sync
- Optional mentor / cohort collaboration and permission model
- Expanded analytics and configurable learning paths
- Mobile app evaluation; React Native / Expo only after validating PWA limitations
- Integrations only where user value, security, and maintenance cost are demonstrated

## Commercial-ready milestone — conditional

Commercialization is an option, not a commitment. Before charging users, validate demand and willingness to pay, define support and data-retention commitments, review licensing and legal obligations, and establish a sustainable security/update process.

Potential areas to evaluate:
- Individual paid conveniences or advanced reporting
- Mentor / team workflows
- Self-hosting or managed deployment options
- Organization administration and policy controls

No price, market size, conversion rate, or revenue target is asserted in this roadmap. Those require primary research and explicit assumptions.

## Out of scope until validated

- AI-generated scores presented as objective proof of skill
- Automatic mastery based on streaks, time spent, or completed checkboxes
- Public leaderboards that expose private learning data by default
- Job placement, certification, or employability guarantees
- Native mobile apps before PWA usage demonstrates a need
- Paid plans or proprietary feature gating before licensing and market validation

## Success measures to validate

Instrument only after a privacy review and with data minimization. Prefer user-controlled product analytics or aggregate measures that do not expose learning artifacts. Candidate measures:
- Percentage of new users who complete a first evidence-backed practice record
- Time required to create a task and attach evidence
- Percentage of competency claims with a qualifying artifact and independent demonstration
- Export / deletion task completion and failure rates
- Accessibility and performance against the quality gates

Targets should be set after baseline usability testing, not invented in advance.

## Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Learners confuse task completion with mastery | Separate task status from competency status; require rubric-backed evidence |
| AI-assisted work is misrepresented as independent ability | Record assistance explicitly; define independent demonstration criteria |
| Evidence contains private or sensitive material | Minimize collection, provide visibility controls, support links instead of mandatory uploads |
| Offline edits conflict | Define ownership, timestamps, conflict UI, and recovery behavior before sync implementation |
| Scope expands too quickly | Ship narrow end-to-end slices; require evidence for new scope |
| Market demand is assumed rather than tested | Maintain research log and conduct interviews / willingness-to-pay tests |
| Security or privacy debt accumulates | Threat-model data flows and gate releases on security review |

## Change control

Update this roadmap through pull requests. Record material scope changes in an ADR or the research log. Update `brain.md` at the end of each approved phase.
