#!/bin/sh
# Prepare a public distribution checkout. Only the production Web build goes into docs/.
set -eu
cd "$(dirname "$0")/.."
dest=${1:?请提供空目录或现有的发布仓库目录}
mkdir -p "$dest"
dest=$(cd "$dest" && pwd -P)
if [ ! -f "$dest/.lingyi-web-release" ] && [ -n "$(ls -A "$dest" | sed '/^\.git$/d')" ]; then
  echo '请选择空目录，或此前用本脚本准备的发布目录。' >&2
  exit 1
fi
# Vite empties dist before building. A cached output could still contain a previous household preview.
pnpm --filter @lingyi-classroom/web run build --mode production
rsync -a deploy/web/ "$dest/"
mkdir -p "$dest/docs" "$dest/.github/workflows"
cp .github/workflows/nas.yml "$dest/.github/workflows/nas.yml"
rsync -a --delete apps/web/dist/ "$dest/docs/"
touch "$dest/docs/.nojekyll" "$dest/.lingyi-web-release"
