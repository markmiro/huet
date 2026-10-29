#!/usr/bin/env bash
# Commit the packed library (what `npm publish` would ship) to the `dist`
# branch, so apps can install it from GitHub without building it:
#   "huet": "github:markmiro/huet#dist"
# Usage: scripts/push-dist.sh <remote-url>. Run after `pnpm run build:lib`.
set -euo pipefail
remote=$1
source_sha=$(git rev-parse HEAD)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

pnpm pack --pack-destination "$work" >/dev/null
tar -xzf "$work"/*.tgz -C "$work"
cd "$work/package"
# Git installs run lifecycle scripts, and none of them are needed to use dist.
npm pkg delete scripts devDependencies

git init -q -b dist
git remote add origin "$remote"
# Build on the previous dist commit, so older lockfile pins stay reachable.
if git fetch -q --depth=1 origin dist 2>/dev/null; then
  git reset -q --soft FETCH_HEAD
fi
git add -A
if git rev-parse -q --verify HEAD >/dev/null && git diff --cached --quiet HEAD; then
  echo "dist is already up to date"
  exit 0
fi
git -c user.name="github-actions[bot]" \
  -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
  commit -q -m "Build ${source_sha}"
git push -q origin HEAD:dist
echo "Pushed $(git rev-parse --short HEAD) to dist (from ${source_sha})"
