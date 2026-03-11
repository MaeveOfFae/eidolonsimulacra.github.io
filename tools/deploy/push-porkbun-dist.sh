#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./tools/deploy/push-porkbun-dist.sh [options]

Push the current web dist output to a deploy-only branch.

Options:
  --build            Run pnpm build:web before pushing
  --branch NAME      Target branch (default: porkbun-deploy)
  --remote NAME      Remote name (default: origin)
  --source PATH      Dist directory to publish (default: packages/web/dist)
  --message TEXT     Commit message (default: Publish web dist build)
  --help             Show this help text

Examples:
  ./tools/deploy/push-porkbun-dist.sh --build
  ./tools/deploy/push-porkbun-dist.sh --remote origin --branch porkbun-deploy
EOF
}

branch="porkbun-deploy"
remote="origin"
source_dir="packages/web/dist"
commit_message="Publish web dist build"
run_build=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build)
      run_build=true
      shift
      ;;
    --branch)
      branch="$2"
      shift 2
      ;;
    --remote)
      remote="$2"
      shift 2
      ;;
    --source)
      source_dir="$2"
      shift 2
      ;;
    --message)
      commit_message="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

repo_root=$(git rev-parse --show-toplevel)
source_path="$repo_root/$source_dir"

if [[ "$run_build" == true ]]; then
  echo "Building web app..."
  (cd "$repo_root" && pnpm build:web)
fi

if [[ ! -d "$source_path" ]]; then
  echo "Dist directory not found: $source_path" >&2
  echo "Run pnpm build:web first or use --build." >&2
  exit 1
fi

temp_dir=$(mktemp -d)
cleanup() {
  git -C "$repo_root" worktree remove --force "$temp_dir" >/dev/null 2>&1 || true
  rm -rf "$temp_dir"
}
trap cleanup EXIT

echo "Preparing deploy worktree..."
git -C "$repo_root" fetch "$remote" "$branch" >/dev/null 2>&1 || true

base_ref="HEAD"
if git -C "$repo_root" show-ref --verify --quiet "refs/remotes/$remote/$branch"; then
  base_ref="$remote/$branch"
fi

git -C "$repo_root" worktree add --detach "$temp_dir" "$base_ref" >/dev/null

git -C "$temp_dir" rm -r --ignore-unmatch . >/dev/null 2>&1 || true
find "$temp_dir" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$source_path"/. "$temp_dir"/

git -C "$temp_dir" add -A

if git -C "$temp_dir" diff --cached --quiet; then
  echo "No deploy changes detected. $branch already matches $source_dir."
  exit 0
fi

git -C "$temp_dir" commit -m "$commit_message" >/dev/null

echo "Pushing $source_dir to $remote/$branch..."
git -C "$temp_dir" push --force-with-lease "$remote" "HEAD:refs/heads/$branch"

echo "Done. Published $source_dir to $remote/$branch."