# corpus/

## `aqua/` — o material original, como recebido

Cópia literal do material da Aqua, com a estrutura de pastas preservada. Está aqui para
que as citações de procedência resolvam: quando o app ou o `PLANO.md` dizem que um fato
veio de `dados/perfil-ceo.md`, o arquivo é `corpus/aqua/dados/perfil-ceo.md`.

Nada no código lê estes arquivos em tempo de execução — eles são a referência auditável.
O que o motor consome é a versão estruturada em `dados/corpus.js`, onde cada fato carrega
o id da evidência que o sustenta, e cada evidência traz o trecho literal copiado daqui.

Inclui também `aqua/entrega/schema-plano.json`, que é contra o que `cli/plano.js --validar`
valida a saída.

## `deslocamentos.json` — os tempos medidos no mundo real

Fonte de verdade dos tempos de deslocamento. `dados/deslocamentos.js` é gerado a partir
deste arquivo (é o mesmo conteúdo atribuído a `AQUA.deslocamentos`, para carregar de
`file://` sem `fetch`). Se mexer nos tempos, mexa aqui e regenere:

```
python3 -c "
import json
d=json.load(open('corpus/deslocamentos.json'))
open('dados/deslocamentos.js','w').write(
  '/* Gerado de corpus/deslocamentos.json. */\nwindow.AQUA = window.AQUA || {};\nAQUA.deslocamentos = '
  + json.dumps(d, ensure_ascii=False, indent=2) + ';\n')
"
```

Cada rota traz modal, duração, distância, a fonte e o horário da consulta. A regra do
desafio é que preço e disponibilidade vêm do corpus, mas **distância, rota e tempo vêm do
mundo real** — então nada neste arquivo foi inventado, com uma exceção declarada:
`T-LILLE-COOP` está marcada `"estimado": true` porque o corpus não traz o endereço da
planta da Coopérative du Nord.
