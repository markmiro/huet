#!/usr/bin/env bash
# Commit a packed package (what `pnpm publish` would ship) to a branch, so apps
# can install it from GitHub without building it:
#   "huet": "github:markmiro/huet#dist"
#   "huet-react": "github:markmiro/huet#dist-react"
# Usage: scripts/push-dist.sh <package-dir> <branch> <remote-url>.
# `pnpm pack` builds the package first through its prepack script.
set -euo pipefail
package=$1
branch=$2
remote=$3
source_sha=$(git rev-parse HEAD)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

(cd "$package" && pnpm pack --pack-destination "$work" >/dev/null)
tar -xzf "$work"/*.tgz -C "$work"
cd "$work/package"
# Git installs run lifecycle scripts, and none of them are needed to use dist.
npm pkg delete scripts devDependencies

git init -q -b "$branch"
git remote add origin "$remote"
# Build on the previous dist commit, so older lockfile pins stay reachable.
if git fetch -q --depth=1 origin "$branch" 2>/dev/null; then
  git reset -q --soft FETCH_HEAD
fi
git add -A
if git rev-parse -q --verify HEAD >/dev/null && git diff --cached --quiet HEAD; then
  echo "$branch is already up to date"
  exit 0
fi
git -c user.name="github-actions[bot]" \
  -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
  commit -q -m "Build ${source_sha}"
git push -q origin "HEAD:$branch"
echo "Pushed $(git rev-parse --short HEAD) to $branch (from ${source_sha})"
