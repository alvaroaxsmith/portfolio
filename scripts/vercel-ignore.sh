#!/bin/sh
# Vercel's Ignored Build Step (the "ignoreCommand" of vercel.json): exit 0 skips the deployment, exit 1 deploys.
# Keeps the daily deployment quota of the plan for deployments that show something new. Production always deploys.
[ "$VERCEL_ENV" = production ] && exit 1

case "$VERCEL_GIT_COMMIT_REF" in
  # release-please only changes the version and the changelog; production deploys them once merged.
  release-please--*) exit 0 ;;
esac

# Any other preview deploys when something the visitor gets changed since the branch's last deployment
# (VERCEL_GIT_PREVIOUS_SHA). With nothing to compare with, or a commit missing from the clone, it deploys.
[ -n "$VERCEL_GIT_PREVIOUS_SHA" ] || exit 1
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- . \
  ':(exclude)e2e' ':(exclude).github' ':(exclude).githooks' ':(exclude).vscode' ':(exclude)*.md' \
  ':(exclude)*.spec.ts' ':(exclude)src/app/testing' ':(exclude)tsconfig.spec.json' \
  ':(exclude)karma.conf.js' ':(exclude)playwright.config.ts' ':(exclude)eslint.config.js' 2>/dev/null && exit 0
exit 1
