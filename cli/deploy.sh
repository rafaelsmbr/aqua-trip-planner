#!/bin/bash
# Publica o app num prefixo de um bucket S3. Nenhuma credencial mora aqui:
# tudo vem do ambiente, e o script falha se faltar alguma coisa.
#
#   export AWS_ACCESS_KEY_ID=...
#   export AWS_SECRET_ACCESS_KEY=...
#   export AQUA_BUCKET=meu-bucket
#   export AQUA_PREFIX=d/aqua-7f3c1b        # opcional, padrão: aqua
#   export AQUA_NOINDEX=1                   # opcional: pede aos buscadores para não indexar
#   ./cli/deploy.sh
#
# Sobe só o que o app precisa, cada arquivo com o Content-Type certo e charset utf-8
# (o conteúdo é em português, com acento). O sw.js vai sem cache, para o celular
# pegar a versão nova assim que ela existir.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${AWS_ACCESS_KEY_ID:?defina AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?defina AWS_SECRET_ACCESS_KEY}"
: "${AQUA_BUCKET:?defina AQUA_BUCKET}"
PREFIX="${AQUA_PREFIX:-aqua}"
REGION="${AWS_REGION:-us-east-1}"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cp index.html "$TMP/index.html"
if [ "${AQUA_NOINDEX:-0}" = "1" ] && ! grep -q 'name="robots"' "$TMP/index.html"; then
  python3 - "$TMP/index.html" <<'PY'
import re, sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
m = re.search(r'<meta charset="[^"]*">\s*\n', s)
s = s[:m.end()] + '<meta name="robots" content="noindex, nofollow, noarchive">\n' + s[m.end():]
open(p, "w", encoding="utf-8").write(s)
PY
fi

subir() { # origem destino content-type cache-control
  aws s3api put-object --region "$REGION" --bucket "$AQUA_BUCKET" \
    --key "$PREFIX/$2" --body "$1" --content-type "$3" --cache-control "$4" >/dev/null
  echo "  ok  $PREFIX/$2"
}
JS="application/javascript; charset=utf-8"
CURTO="public, max-age=60"
LONGO="public, max-age=86400"

echo "publicando em s3://$AQUA_BUCKET/$PREFIX/"
subir "$TMP/index.html" index.html "text/html; charset=utf-8" "$CURTO"
subir app.css app.css "text/css; charset=utf-8" "$CURTO"
for f in app.js engine.js dados/fontes.js dados/corpus.js dados/decisoes.js dados/deslocamentos.js; do
  subir "$f" "$f" "$JS" "$CURTO"
done
subir sw.js sw.js "$JS" "no-cache"
subir manifest.webmanifest manifest.webmanifest "application/manifest+json; charset=utf-8" "$CURTO"
for f in icons/*.png; do subir "$f" "$f" "image/png" "$LONGO"; done
echo "pronto."
echo "Se houver CloudFront na frente, invalide /$PREFIX/* ou espere o max-age de 60s."
