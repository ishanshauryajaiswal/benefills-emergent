---
name: GitHub Authentication Enforcement
description: Ensures that the agent uses the 'ishanshauryajaiswal' GitHub account when committing, pushing, or using the GitHub CLI in repositories owned by 'ishanshauryajaiswal'. Triggers on any git commit, git push, or GitHub CLI commands.
---

# GitHub Authentication Enforcement

Whenever you (the AI agent) are about to commit, push, or use the GitHub CLI (`gh`) in a repository, you **MUST** first check if the repository belongs to the `ishanshauryajaiswal` account. 

## Protocol

1. **Verify Repository Ownership:**
   Run `git remote -v` to check the repository URL. If the URL contains `ishanshauryajaiswal` (e.g., `https://github.com/ishanshauryajaiswal/...`), you must proceed with the strict authentication steps below.

2. **GitHub CLI Authentication:**
   If you are using the GitHub CLI (`gh`) to commit, push, or open Pull Requests, ensure the active account setup is strictly targeting `ishanshauryajaiswal`. Run the following command to switch context *before* executing the push or CLI operation:
   
   ```bash
   gh auth switch -u ishanshauryajaiswal
   ```
   
   *Note: If the CLI reports the account is not found or authenticated, immediately stop and alert the user to authenticate it first.*

3. **Git Identity Check:**
   Be extremely mindful not to mix up GitHub identities when manipulating git histories or pushing across repositories belonging to `ishanshauryajaiswal`.

4. **Safety Rule:**
   Never push work or open PRs using a placeholder, alternate, or generic git/GH account if the target is an `ishanshauryajaiswal` repository.
