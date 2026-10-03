# O que entregar

Você entrega **uma solução que funciona**, **uma interface para acompanhá-la** e
**uma demonstração ao vivo** das duas rodando.

Não é um documento sobre como a viagem deveria ser. É uma coisa que, recebendo
o material desta pasta, produz o roteiro, e que a gente vai ver funcionar.

---

## 1. A solução, e ela roda na mão de qualquer um

Um repositório que **um agente qualquer abre e consegue rodar** seguindo o que
está escrito nele: Claude Code, Cursor, Codex, ou uma pessoa sem você por perto.

Na prática, isso quer dizer:

- **como instalar e como executar**, escrito, sem passo implícito;
- nada de chave, caminho ou conta sua **presos no código**. O que for
  necessário vem de configuração, e o repositório diz qual;
- se ele depende de algo externo, isso está declarado.

O teste que a gente vai fazer é literal: abrir o seu repositório num agente e
mandar rodar. Se travar num passo que só você sabia, travou.

Como você constrói é escolha sua. Agente, script, planilha com automação,
chamadas diretas a um modelo, ou nada de modelo nenhum. Vamos olhar o que você
construiu e com o quê, mas **não existe stack certa aqui** e essa leitura não
decide a avaliação. O que decide é funcionar.

## 2. A interface

Uma superfície visual onde dá para **acompanhar a viagem sem ler arquivo
nenhum**. Pode ser um webapp pequeno, uma página gerada, um artifact do Claude
O formato é seu.

Precisa mostrar, no mínimo:

- **o itinerário**, dia a dia, da sexta em São Paulo à quarta de volta;
- **os custos**, com o total e a abertura por categoria (voo, hospedagem,
  refeições, deslocamento);
- **o planejamento de cada dia**: o que ele faz, com quem, onde, e o
  deslocamento entre uma coisa e outra.

E o que mais você achar que quem vai viajar gostaria de ver.

O critério aqui é simples: **o CEO abre isso e entende a viagem dele.** Não
precisa ser bonito, precisa ser claro.

## 3. O plano que ela produz

O roteiro completo, **em formato que uma pessoa lê**. O que esperamos encontrar:

- **As decisões e o porquê de cada uma.** Principalmente as que envolveram
  escolher entre duas coisas defensáveis.
- **Deslocamento ocupa tempo, e esse tempo está no roteiro.** Ir de um lugar a
  outro não é instantâneo. Depois de um voo, a conta começa **no instante do
  pouso**. O que acontece entre a aeronave parar e ele chegar ao destino faz
  parte do trajeto.
- **De onde veio cada informação de fora.** O que você buscou na internet, onde
  e quando. Se o que você achar contradisser o material da Aqua, diga os dois e
  qual você usou.
- **O que você não sabia.** O que perguntaria ao CEO ou à secretaria, e o que
  assumiu para poder entregar mesmo assim.

Se a sua solução também emite alguma saída estruturada, ótimo, mas isso é
opção sua e não requisito. Existe um `entrega/schema-plano.json` nesta pasta
como ponto de partida para quem quiser um; ignorá-lo não tira ponto.

## 4. A demonstração

Uma conversa com a gente, ao vivo, onde você:

- **roda a solução na nossa frente** e mostra o plano saindo;
- **abre a interface** e nos leva pela viagem;
- defende as decisões e responde perguntas do tipo *"por que esse voo e não o
  mais barato?"*, *"como você sabe que ele chega a tempo da abertura?"*, *"o que
  muda se o orçamento cair 20%?"*.

**Na demonstração a gente vai te dar um fato novo sobre a viagem** e pedir para
você rodar de novo, ali. O que olhamos: o que o plano preservou, o que mudou, e
se alguma coisa quebrou sem ninguém perceber. O plano não precisa sair
idêntico, mas tem que continuar de pé, e a interface tem que refletir o que
mudou.

## 5. Um registro curto de decisões

No próprio repositório, uma página só:

- o que você **não** conseguiu decidir, e o que precisaria para decidir;
- o que você verificou, e como.

---

## Sobre o código

Sendo direto, porque isso costuma gerar ansiedade: **vamos abrir o repositório e
olhar.** Queremos ver o que você construiu e com que ferramentas.

Mas isso não é uma prova de engenharia. Não temos stack preferida, não existe
arquitetura esperada, e ninguém vai contar teste nem medir cobertura. É uma
leitura secundária, subjetiva, e ela não decide a avaliação.

O que decide é a solução funcionando, a interface, o roteiro que ela produz e a
sua defesa dele. Use a ferramenta que quiser e a IA que quiser. Esperamos que
use.

## Prazo

Quatro dias corridos até a entrega do repositório. A demonstração é agendada
depois. Esforço previsto: um a dois dias de trabalho.
