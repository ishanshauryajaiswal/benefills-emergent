# Emergent Sync Protocol (Agent-to-Agent)

## Overview
This rule ensures that all local development changes are synchronized with the **Emergent AI Builder** via the `emergent_dev_sync.md` file located at the project root. This file serves as the primary handover mechanism between the Local Development Agent (you/me) and the Emergent AI Builder.

## 🤖 Instructions for the Agent
1.  **Mandatory Updates**: You MUST update `emergent_dev_sync.md` after EVERY significant code change, implementation, or debugging session.
2.  **Handover Tone**: Write the document as a technical brief for another AI. Be precise about the "Current State", "Technical Nuances", and "Integration Requirements".
3.  **Core Sections**:
    *   **🔄 In Progress**: Active tasks and current technical roadblocks.
    *   **✅ Done**: Completed features with paths to the relevant files.
    *   **📋 To Do**: Planned steps for local development.
    *   **⚠️ Emergent Integration Notes**: CRITICAL instructions for the Emergent AI regarding specific code patterns (e.g., visual-edit plugins, auth mocks) that must be preserved or handled carefully during its integration phase.
4.  **Verification**: Before completing any task, read the `emergent_dev_sync.md` to ensure it reflects the latest project reality.

## 🤝 Bridge Format
Always use the following format for `emergent_dev_sync.md`:
```markdown
# 🌉 Emergent-Local Sync Bridge
**Last Local Sync:** [Timestamp]
**Local State Hash:** [Short Git Commit or Status Summary]

## 🎯 Current Protocol Objectives
[High-level summary of the current dev goal]

## 🔄 In Progress
- [Task] ([File Path]): [Brief Status]

## ✅ Done (Ready for Emergent Review)
- [Task]: [Detailed technical summary for the Emergent AI]

## ⚠️ Emergent Integration Safeguards
- [Specific code block/file that Emergent should NOT overwrite or should integrate with caution]

## 📋 Next Local Steps
- [Task]
```
