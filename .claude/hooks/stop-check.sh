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
FAILURES=""

# Check if a package.json has a given script
has_script() {
  local pkg_dir="$PROJECT_ROOT/packages/$1"
  local script="$2"
  if [ -f "$pkg_dir/package.json" ]; then
    grep -q "\"$script\"" "$pkg_dir/package.json" 2>/dev/null
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

# Checks failed — report to stderr
echo -e "The following checks failed:\n$FAILURES" >&2
exit 2
