---
name: Pre-Commit Emergent Validation
description: A mandatory review checklist to execute before committing any structural frontend or backend changes to ensure compatibility with the Emergent AI Builder environment.
---

# Pre-Commit Emergent Validation

Before initiating any `git commit`, you MUST run through this validation checklist to verify that your local changes do not break integrations on the main Emergent web app environment. 

## 1. Backend & Dynamic Data Integrity
- [ ] **API Call Preservation**: Verify using `git diff` that no `fetch()`, `axios`, or backend-driven state logic has been accidentally hardcoded or replaced with static mock data (unless explicitly instructed).
- [ ] **External Scripts**: Verify that no critical third-party injected `<script>` tags (e.g., SnapWidget, Analytics, Payment Gateways) have been removed from the DOM.
- [ ] **Environment Variables**: Ensure that any new `.env` variables required for your code are documented so the Emergent environment can mirror them.

## 2. Structural & Architectural Changes
- [ ] **Component Restructuring**: If you significantly altered the DOM tree (e.g., replacing a Library Component with vanilla HTML tags, or completely swapping out a UI paradigm like a Carousel for a Static block), you must verify that Emergent plugins relying on those component props will not break.
- [ ] **Emergent Sync Updates**: If the architecture of a major section (like the Hero, Checkout, or Header) was changed, you **MUST** document this in the root `emergent_dev_sync.md` file so the Emergent Agent can process the architectural shift during integration.

## 3. Local Verification
- [ ] **Build Validation**: The project must successfully build. If working in `frontend/`, verify there are no compilation errors in the live `yarn start` or `npm run start` console output.

Only proceed with the commit if all relevant checks above pass and any necessary updates to `emergent_dev_sync.md` have been documented.
