/* Fato novo ativo. Para a demonstração: descreva o fato aqui, salve e recarregue o index.html.
   O app mostra o plano com o fato aplicado e o que mudou em relação ao plano sem ele.
   O mesmo arquivo roda no terminal:  node cli/plano.js --fato fatos/ativo.js --delta
   Deixe null quando não houver fato. Formato e exemplos: README, "Um fato novo, e rodar de novo". */
window.AQUA = window.AQUA || {};
AQUA.fatoAtivo = null;

/* Exemplo:
AQUA.fatoAtivo = {
  fato_novo: "O Étienne remarcou a reunião de sábado para as 14:00.",
  mudar: [ { em: "compromissos", id: "C-04", inicio: "14:00", fim: "15:00" } ]
};
*/
