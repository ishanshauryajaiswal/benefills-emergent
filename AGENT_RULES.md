# AGENT LEVEL RULES - READ FIRST

## CRITICAL INSTRUCTION FOR TASK EVALUATION

**Rule:** Whenever you (the agent) are working on ANY task for this project, your **FIRST** action must be to evaluate if the requested feature/fix can be handled **ENTIRELY** by frontend code changes.

### IF THE TASK CAN BE DONE VIA FRONTEND ONLY:
1. **Reply with "Yes"** immediately.
2. State clearly that the task is possible through frontend work alone.
3. **DO NOT PROCEED** with the implementation on the current platform (Emergent).
4. Provide a detailed and proper **prompt** that the user can copy-paste to their local agent to implement the feature locally.
   - The prompt should include necessary context, file paths, and specific instructions.
   - Goal: Save Emergent credits by offloading frontend-only tasks to the user's local machine.

### IF THE TASK REQUIRES BACKEND CHANGES:
1. Proceed with the implementation as normal on the Emergent platform.
2. Follow standard development protocols.

---
**Note:** This rule applies to ALL future agents working on this project. Always check this condition before writing code.
