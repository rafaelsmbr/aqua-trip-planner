# Roteirizador de viagem: Sebastian Popik no SIAL Paris 2026

Recebe o material da Aqua sobre o CEO, a agenda, a política, os contatos e o evento,
e produz o roteiro da viagem: o que ele faz, com quem, onde, quanto custa e quanto
tempo gasta indo de uma coisa à outra.

Tem duas superfícies sobre o mesmo motor:

- **o app** (`index.html`) — feito para o celular, é onde o CEO acompanha a viagem e
  **decide** o que o sistema não deve decidir por ele;
- **o CLI** (`cli/plano.js`) — gera `saida/plano.json` e `saida/PLANO.md` fora do navegador.

---

## Como rodar

**Requisito: nenhum.** Sem instalação, sem dependência, sem build, sem chave de API,
sem conta em serviço nenhum. Nada de caminho absoluto no código.

### O app

```
abra index.html no navegador
```

Duplo clique resolve. Funciona de `file://` porque não há módulo ES nem `fetch()`:
os dados entram por `<script src>`. Se preferir servir por HTTP:

```
python3 -m http.server 8000
# depois: http://localhost:8000
```

Para ver como o CEO veria, abra as ferramentas do desenvolvedor e ligue a
emulação de dispositivo em 375px de largura. Foi essa a medida de referência, e ela
está verificada: `node cli/verificar-mobile.js` emula um iPhone de 375x812 pelo
DevTools Protocol, percorre as quatro abas e confirma que `scrollWidth` é igual a
`clientWidth` em todas — ou seja, nada estoura a tela. Também grava um print de cada
aba. É o único script do repositório que depende de algo de fora (o Chrome), e o app
não depende dele.

### O CLI

Precisa de **Node 18 ou mais novo** (`node --version`). Só o CLI precisa; o app não.

```
node cli/plano.js                                  # gera o plano recomendado
node cli/plano.js --set voo=VOO-B                  # troca uma decisão
node cli/plano.js --set lille=remoto --set claire=nao_encontrar
node cli/plano.js --validar                        # valida saida/plano.json contra o schema da entrega
node cli/conferir-citacoes.js                      # confere as citações contra os arquivos originais
node cli/verificar-mobile.js                       # emula um celular 375x812 e mede se algo estoura
```

O `conferir-citacoes.js` existe porque citação inventada é o risco mais sério de um
trabalho assim. Ele normaliza acento e pontuação e procura cada trecho citado dentro do
arquivo original em `corpus/aqua/`. São **29 citações do corpus, todas conferem**. As 28
restantes vêm de web, mapa e estimativa, e essas não são conferíveis localmente — para
elas o que existe é URL mais horário de consulta.

Saída em `saida/plano.json` (no formato de `corpus/aqua/entrega/schema-plano.json`) e
`saida/PLANO.md` (o roteiro para ler).

### No celular, como app

Publicado em HTTPS, ele é instalável e funciona sem internet:

- **iPhone (Safari):** Compartilhar → *Adicionar à Tela de Início*.
- **Android (Chrome):** menu → *Instalar app*.

Depois da primeira abertura, o roteiro abre mesmo em modo avião — o `sw.js` guarda a
última versão que funcionou. Online, ele sempre busca a versão nova primeiro. Em
`file://` nada disso é ativado e o app abre normalmente.

### Simular um momento da viagem

A tela inicial responde "o que vem agora": antes da viagem mostra a contagem regressiva;
durante, mostra o que está acontecendo, o próximo compromisso e a hora de sair. Para ver
isso hoje, passe o horário local da viagem na URL:

```
index.html?agora=2026-10-17T15:40     # sábado: próximo é o Étienne, "saia às 15:50"
index.html?agora=2026-10-17T11:00     # sábado: em trânsito do pouso para o Hall 7
index.html?agora=2026-10-19T13:30     # segunda: no TGV para Lille
```

Um selo "simulado" aparece no topo enquanto o horário vem da URL.

### Publicar na internet

```
export AWS_ACCESS_KEY_ID=...        # vem do ambiente, nunca do codigo
export AWS_SECRET_ACCESS_KEY=...
export AQUA_BUCKET=seu-bucket
export AQUA_PREFIX=aqua             # opcional
./cli/deploy.sh
```

Sobe os 8 arquivos que o app precisa, com `Content-Type` e `charset=utf-8` corretos.
Precisa do AWS CLI. Nenhuma credencial fica no repositório.

**Está no ar em:** https://www.geosafra.online/d/aqua-7f3c1b/index.html

### Um fato novo, e rodar de novo

É o exercício da demonstração. Um fato novo entra por arquivo e o plano é recalculado,
dizendo o que preservou, o que mudou e o que quebrou:

```
node cli/plano.js                                               # rodada 1, guarda o estado
node cli/plano.js --fato fatos/voo-af-cancelado.json --delta    # rodada 2, compara com a anterior
```

Há três exemplos prontos em `fatos/`: voo cancelado, orçamento 20% menor, contraparte
que desmarcou. O formato é um JSON de duas linhas — dá para escrever um na hora:

```json
{ "fato_novo": "descreva o fato", "escolhas": { "voo": "VOO-B" } }
```

No app o mesmo exercício está no painel **Fato novo**, no topo.

---

## As seis decisões que são do CEO

O sistema decide o que tem uma resposta claramente melhor e **não** decide o que
depende de preferência ou de apetite a risco. Essas seis ficam no Inbox do app, cada
uma mostrando os dois documentos do corpus que entram em conflito, com o trecho citado:

| Chave | Pergunta | Padrão |
|---|---|---|
| `voo` | Air France (seu programa, mais folga) ou LATAM (fora da greve, mais barata)? | `VOO-D` |
| `jantar_sabado` | Noite livre depois do voo, ou jantar de trabalho? | `livre` |
| `claire` | Encontrar a Claire Dubois, concorrente no deal da Nordvest? | `cafe_curto` |
| `almoco_sofia` | L'Arpège no centro, ou algo perto da feira? | `arpege` |
| `lille` | Manter a ida a Lille, ou converter em call? | `manter` |
| `jantar_terca` | Le Duc ou Le Baratin para os investidores? | `le_duc` |

As outras **onze** o sistema resolveu sozinho e deixou registrado com a justificativa e
as alternativas descartadas — hotel, número de noites, como ele sai do aeroporto no
sábado, quando o Henrik entra, qual painel de domingo, e assim por diante. Estão no app
em "O sistema decidiu por você" e em `saida/PLANO.md`.

---

## As 16 travas

A cada recálculo o motor roda 16 verificações. Elas existem para o caso que eles
descreveram: um fato novo entra, o plano continua de pé **na aparência**, e alguma coisa
quebrou sem ninguém perceber. Entre elas:

- chega ao Hall 7 antes das 13:00 de sábado (a sessão que ele disse que interessa);
- nenhuma reunião de números no primeiro meio período depois de pousar;
- Henrik e Claire nunca no mesmo dia, e Henrik primeiro;
- a diária do hotel dentro do teto de EUR 320;
- exatamente dois jantares de trabalho na semana, como a Camila pediu;
- nenhuma refeição dele em casa com cordeiro na base do cardápio;
- todo trecho de deslocamento declara componentes que somam a janela exata.

Troque `voo` para `VOO-B` e a trava G-01 acende: com a LATAM pousando 10:55, a fila de
fronteira de CDG o coloca pronto às 13:05, cinco minutos depois do início da abertura.
O plano não esconde isso.

---

## Cores

A paleta sai da marca da Aqua (`aqua.capital`): petróleo `#0d4051`, laranja `#db521d`,
sobre superfícies claras. Tudo mora em variáveis CSS no `:root` de `app.css`, então
trocar o tema é mexer num bloco só.

As quatro cores das barras de custo não foram escolhidas no olho. Elas passaram pelo
validador de paleta (faixa de luminosidade, piso de croma, separação para daltonismo,
piso de visão normal e contraste contra a superfície): pior par adjacente ΔE 9.1 para
daltonismo (alvo ≥ 8) e 16.6 para visão normal (piso 15), todas com contraste ≥ 3:1.
O petróleo da marca reprova como cor de gráfico — escuro demais e cinzento — então ele
fica no texto, no cabeçalho e nos estados de seleção, e as barras usam passos próprios.

Cada barra é colorida **pela categoria**, não pela posição: se os valores mudarem e a
ordem virar, Voo continua azul. Cor segue a entidade, nunca o ranking.

## Como está organizado

```
index.html  app.css  app.js     o app
manifest.webmanifest  sw.js     instalável e offline (PWA)
icons/                          ícones do app, gerados a partir da marca
engine.js                       o motor: escolhas -> roteiro, custos, alertas, travas
dados/fontes.js                 40 fontes e 57 trechos citados
dados/corpus.js                 o material da Aqua, estruturado, cada fato com sua evidência
dados/decisoes.js               as 17 decisões, as 16 restrições, as 9 incertezas
dados/deslocamentos.js          tempos de deslocamento medidos no mundo real
corpus/deslocamentos.json       a fonte de verdade dos tempos; o .js é gerado dela
corpus/aqua/                    cópia literal do material da Aqua (enunciado, dados, web, entrega)
cli/plano.js                    gera e valida o plano estruturado
cli/conferir-citacoes.js        confere cada citação contra o arquivo original
cli/verificar-mobile.js         emula celular de verdade e mede overflow (precisa do Chrome)
cli/deploy.sh                   publica num bucket S3; credenciais vêm do ambiente
fatos/                          exemplos de fato novo para a demonstração
saida/                          plano.json e PLANO.md gerados
docs/DECISOES.md                o que verifiquei, como, e o que não consegui decidir
```

`engine.js` é função pura: `AQUA.planejar(escolhas)` devolve o roteiro, os custos, os
alertas e as travas. O app e o CLI chamam a mesma função — não existe lógica de
planejamento em dois lugares.

## De onde vem cada número

A regra do desafio foi seguida à letra: **preço, disponibilidade e condições vêm do
corpus**; **distância, rota e tempo de deslocamento vêm do mundo real**, com fonte,
horário de consulta, modal e hora de partida registrados em `corpus/deslocamentos.json`.

Onde a web contradiz o corpus, as duas versões estão no app, na aba Fontes, com a
indicação de qual foi usada e por quê. São **oito divergências**, e duas mexem no plano:
o aviso de greve de tripulação de 17 a 21/10 e a obra noturna do RER B. Detalhe em
`docs/DECISOES.md`.

## O que este repositório não faz

- Não compra, não reserva e não emite nada. É recomendação com justificativa.
- Não consulta preço ao vivo. Os valores de voo, hotel e restaurante são os do corpus,
  porque o enunciado determina que o corpus manda nesses campos. A consulta ao vivo
  seria o próximo passo natural e está anotada em `docs/DECISOES.md`.
- Não chama modelo de linguagem em tempo de execução. O motor é determinístico, de
  propósito: roda sem chave, o resultado é reprodutível, e o delta de uma rodada para a
  outra é comparável. O julgamento foi feito antes, na curadoria do corpus e no catálogo
  de decisões — e cada decisão diz, no campo `metodo`, se saiu de regra ou de julgamento.
