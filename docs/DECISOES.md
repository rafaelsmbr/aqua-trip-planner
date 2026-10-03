# Registro de decisões

## O que não consegui decidir, e o que precisaria

| # | Em aberto | Precisaria de | O que assumi |
|---|---|---|---|
| 1 | Air France (programa dele, 20 min de folga na abertura) ou LATAM (fora da greve de 17-21/10, EUR 490 a menos)? | **Do CEO.** "Mantém a Air France com o risco da greve, ou emite LATAM e perde o Flying Blue nesta viagem?" | Air France. Trocável em um toque no Inbox. |
| 2 | Jantar de sábado: noite livre ou trabalho? A nota da Camila de 14/08 diz "Perguntar", e ninguém perguntou. | **Do CEO**, uma linha. | Noite livre: ele pousou de madrugada e os dois jantares de trabalho que pediu já estão no domingo e na terça. |
| 3 | Quantos investidores vão ao jantar de terça. Isso decide entre Le Duc e Le Baratin. | **Da secretaria.** | Cinco pessoas, Le Duc. |
| 4 | A visita a Lille vale 6h de porta a porta para 1h30 de planta? | Saber se a cooperativa é alvo de investimento ou cortesia. | Mantida: compromisso aceito, e planta não se vê por vídeo. |
| 5 | Endereço da planta da Coopérative du Nord. | **Da cooperativa**, até 14/10. | 30 min de carro de Lille Europe. É o único trecho inventado do plano e está marcado como estimado. |
| 6 | Reunião com o Étienne às 16:00 de sábado, dentro do meio período que ele pede para não usar. | **Do CEO**: a regra vale para relacionamento ou só para decisão? | Mantida: ele marcou, a pauta é sourcing. O Henrik, que é número, foi para segunda de manhã. |
| 7 | Custo de credencial do SIAL e de sala de reunião; destino dele na volta (casa ou escritório). | **Da Camila.** | Fora do orçamento por falta de fonte; quinta com 50 min de GRU a São Paulo, estimado. |

## O que verifiquei, e como

**A regra do desafio, à letra.** Preço, disponibilidade e condições vêm do corpus. Distância, rota e tempo vêm do mundo real, consultados em 02/10/2026. São 42 fontes (12 do corpus, 17 da web, 9 de mapa, 4 estimativas declaradas) e 59 trechos citados.

**Quatro achados de fora mudaram o plano:**
- **Greve de tripulação, 17 a 21/10.** Cobre a Air France nos dois dias de voo. Transformou o voo "óbvio" numa pergunta ao CEO.
- **Fila de fronteira em CDG depois do EES**: 60 a 120 min para não-UE. Reescreveu o sábado: não cabe passar no hotel antes das 13:00, então a mala vai com o motorista. A conta parte do pouso, com o cenário conservador de 100 min.
- **Obra noturna do RER B até 11/12.** Toda volta de jantar no centro é de carro.
- **Check-in às 14:00 e check-out ao meio-dia** no hotel. Pede late check-out na quarta, que colide com o encerramento.

**Onde a web contradiz o corpus e segui o corpus**, com reconfirmação e alternativa nomeada:
- quatro das cinco casas do centro fecham no domingo real;
- o SIAL abre às 10:00, e não às 09:30 — o plano não marca nada crítico antes das 10:00, então fica de pé nas duas leituras;
- o AF459 real sai às 19:35.

**Fusos.** A call de sexta está em horário de Brasília. O Étienne marcou em horário de Paris.

**O próprio plano:**
- **18 travas** rodam a cada recálculo: abertura alcançada, Henrik antes da Claire, teto do hotel, dois jantares de trabalho, nenhuma sobreposição, trajeto para todo compromisso.
- `cli/plano.js --validar` checa o schema da entrega, inclusive a soma exata dos componentes de cada trecho.
- `cli/conferir-citacoes.js` acha os **29 trechos do corpus** nos arquivos originais.
- As **64 combinações** das decisões abertas foram rodadas.
- A tela foi medida num celular emulado, de 360 a 430 px.

**Fatos novos testados** (`fatos/`), todos aplicados como dado, sem tocar no código:

| Fato | Resultado |
|---|---|
| Étienne às 14:00 | almoço remanejado, 18/18 |
| reunião nova na terça | entra no roteiro, 18/18 |
| Le Duc fechado no domingo | jantar do time vai para o Hyatt, 18/18 |
| Lille cancelada | tarde volta para a feira, 18/18 |
| Henrik na terça às 16:00 | acende G-04: ficaria depois da Claire no mesmo dia |
| voo 90 min atrasado | acende G-01: perde a abertura |
| diária a EUR 350 | acende G-03: estoura o teto da política |

**E se o orçamento cair 20%?** De EUR 5.880, o alvo seria EUR 4.704. Nenhuma das 64 combinações chega lá sem quebrar uma trava. O plano limpo mais barato custa EUR 5.500 (−6,5%): Lille vira call e o jantar dos investidores vai para o Le Baratin. Para chegar a EUR 4.710 é preciso aceitar perder o início da abertura (LATAM) e levar a Sofia, que é vegetariana, a um restaurante de hotel. Voo e hotel somam 58% do custo e são justamente o que não dá para cortar sem atingir a razão da viagem.
