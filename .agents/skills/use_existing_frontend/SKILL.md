---
name: Use Existing Frontend Stack
description: Instructs the agent to always use existing tech stack and code for frontend work.
---

# Use Existing Frontend Stack

When performing any frontend development work for this project, you MUST strictly adhere to the following rules:

1. **Use Existing Tech Stack:** Only use the libraries and frameworks that are already present in the `frontend/package.json` (e.g., React, Tailwind CSS, Radix UI, shadcn/ui components). Do not introduce new libraries unless absolutely necessary and explicitly approved by the user.
2. **Reuse Existing Code:** Look for existing components, hooks, and utility functions in the `frontend/src/components`, `frontend/src/hooks`, and `frontend/src/utils` directories before building new ones. For styling, rely heavily on existing CSS variables, Tailwind configurations, and utility classes defined in `frontend/src/theme.js` or `frontend/src/index.css`.
3. **Stay Consistent:** Match the design language, color themes, file structure, and coding style used throughout the existing application. Avoid switching to new paradigms (like light/dark mode toggles) if the current implementation doesn't support them.
