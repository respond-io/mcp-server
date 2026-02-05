cp package.json ./dist/package.json
cp README.md ./dist/README.md
cp LICENSE ./dist/LICENSE
[ -f CHANGELOG.md ] && cp CHANGELOG.md ./dist/CHANGELOG.md

jq '
  .main = "index.js" |
  .types = "index.d.ts" |
  .bin |= with_entries(.value = "index.js")
' ./dist/package.json > ./dist/package.tmp.json && \
mv ./dist/package.tmp.json ./dist/package.json
