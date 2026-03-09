#!/bin/bash
set -euo pipefail

# Resolve project root: use STOP_CHECK_PROJECT_ROOT if set (for testing),
# otherwise use the git working tree root
PROJECT_ROOT="${STOP_CHECK_PROJECT_ROOT:-$(git rev-parse --show-toplevel)}"

# Get changed files compared to last commit
CHANGED_FILES=$(git diff --name-only HEAD -- "$PROJECT_ROOT" 2>/dev/null || true)

# Filter to .ts/.tsx files only
TS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(tsx?)$' || true)

# No TypeScript files changed — nothing to check
if [ -z "$TS_FILES" ]; then
  exit 0
fi
