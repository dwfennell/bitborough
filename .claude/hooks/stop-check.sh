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

# Extract unique package names from paths like packages/<name>/...
PACKAGES=$(echo "$TS_FILES" | grep -oE '^packages/[^/]+' | sed 's|^packages/||' | sort -u || true)

# No packages affected — nothing to check
if [ -z "$PACKAGES" ]; then
  exit 0
fi

MAX_RETRIES=2

# Check if a package.json has a given script in its "scripts" block
has_script() {
  local pkg_dir="$PROJECT_ROOT/packages/$1"
  local script="$2"
  if [ -f "$pkg_dir/package.json" ]; then
    # Use sed to extract the scripts block, then grep for the script name
    sed -n '/"scripts"/,/}/p' "$pkg_dir/package.json" | grep -q "\"$script\"" 2>/dev/null
  else
    return 1
  fi
}

# Run checks for all affected packages, collect failures
run_checks() {
  local failures=""

  for pkg in $PACKAGES; do
    if has_script "$pkg" "typecheck"; then
      local output
      if ! output=$(pnpm --filter "@bitborough/$pkg" typecheck 2>&1); then
        failures="${failures}\n--- @bitborough/${pkg} typecheck FAILED ---\n${output}\n"
      fi
    fi

    if has_script "$pkg" "test"; then
      local output
      if ! output=$(pnpm --filter "@bitborough/$pkg" test 2>&1); then
        failures="${failures}\n--- @bitborough/${pkg} test FAILED ---\n${output}\n"
      fi
    fi
  done

  echo "$failures"
}

FAILURES=$(run_checks)

# All checks passed
if [ -z "$FAILURES" ]; then
  exit 0
fi

# Retry loop: invoke claude -p to fix, then re-check
for attempt in $(seq 1 $MAX_RETRIES); do
  claude -p "$(printf 'The following typecheck/test failures were found in this project. Fix them and verify your fix by re-running the failing commands.\n\n%s' "$FAILURES")" 2>/dev/null

  FAILURES=$(run_checks)

  if [ -z "$FAILURES" ]; then
    exit 0
  fi
done

# Still failing after retries — report to main Claude via stderr
echo -e "Checks still failing after $MAX_RETRIES fix attempts:\n$FAILURES" >&2
exit 2
