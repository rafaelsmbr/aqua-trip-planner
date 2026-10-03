/* O material da Aqua, estruturado. Cada item carrega `ev` = evidencias que o sustentam. */
window.AQUA = window.AQUA || {};

AQUA.viagem = {
  titulo: "SIAL Paris 2026",
  viajante: "Sebastian Popik",
  cargo: "CEO, Aqua Capital",
  origem: "São Paulo (GRU)",
  destino: "Paris",
  tz_origem: "America/Sao_Paulo",
  tz_destino: "Europe/Paris",
  evento: {
    nome: "SIAL Paris 2026",
    local: "Paris Nord Villepinte",
    endereco: "82 Avenue des Nations, 93420 Villepinte",
    inicio: "2026-10-17", fim: "2026-10-21",
    horario_corpus: { abre:"09:30", fecha_semana:"18:00", fecha_fim_de_semana:"19:00", ev:["E-022"] },
    horario_web:    { abre:"10:00", fecha_sab_ter:"18:30", fecha_qua:"17:00", ultima_entrada:"14:00", ev:["E-031"] },
    ev: ["E-032"]
  }
};

AQUA.perfil = {
  idiomas: ["portugues","ingles","espanhol"],
  sem_frances: true,
  fidelidade: { programa:"Flying Blue", nivel:"Platinum", faz_questao:true, ev:["E-001"] },
  regras: [
    { id:"P-01", texto:"Depois de voo longo não marca reunião de decisão no primeiro meio período", peso:"dura", ev:["E-002"] },
    { id:"P-02", texto:"Hotel perto do compromisso principal vale mais que hotel bonito", peso:"preferencia", ev:["E-003"] },
    { id:"P-03", texto:"Academia no hotel é item que ele procura", peso:"preferencia", ev:["E-003"] },
    { id:"P-04", texto:"Não gosta de trocar de hotel no meio da viagem", peso:"preferencia", ev:["E-003"] },
    { id:"P-05", texto:"Gosta de peixe e frutos do mar; não come cordeiro", peso:"dura", ev:["E-004"] },
    { id:"P-06", texto:"Detesta jantar em restaurante barulhento: a reunião não rende", peso:"dura", ev:["E-004"] },
    { id:"P-07", texto:"Evita jantar de negócios e prefere a noite livre", peso:"preferencia", conflita_com:"P-08", ev:["E-005"] },
    { id:"P-08", texto:"Para esta viagem pediu dois jantares de trabalho: um com o time, um com contraparte", peso:"dura", conflita_com:"P-07", ev:["E-008"] },
    { id:"P-09", texto:"Não dirige em cidade desconhecida: táxi, aplicativo ou motorista", peso:"dura", ev:["E-006"] },
    { id:"P-10", texto:"Sempre despacha bagagem", peso:"dura", ev:["E-006"] },
    { id:"P-11", texto:"Prefere voo noturno na ida para a Europa; dorme mal em voo", peso:"preferencia", ev:["E-007"] },
    { id:"P-12", texto:"Conteúdo pesado de manhã; três conversas boas valem mais que vinte apertos de mão", peso:"preferencia", ev:["E-011"] },
    { id:"P-13", texto:"Quer estar na sessão de abertura de sábado: é a que interessa de verdade", peso:"dura", ev:["E-009"] },
    { id:"P-14", texto:"Foco da edição: sourcing de ingredientes e proteína, e relacionamento com fundos europeus", peso:"preferencia", ev:["E-011"] },
    { id:"P-15", texto:"Vinho tinto, prefere que alguém escolha por ele", peso:"preferencia", ev:["E-004"] }
  ]
};

AQUA.politica = {
  versao: "4.2",
  classe_long_haul: { regra:"acima de 8h: executiva para C-level", ev:["E-019"] },
  classe_trecho_curto: { regra:"até 3h: econômica", ev:["E-019"] },
  hotel_teto_eur: 320,
  hotel_teto_nota: "Acima do teto exige aprovação prévia do comitê, que não se reúne durante a viagem.",
  hotel_ev: ["E-017"],
  fidelidade_limiar_pct: 15,
  fidelidade_ev: ["E-018"],
  deslocamento_local: "Transporte público, táxi ou aplicativo. Aluguel de carro exige justificativa.",
  refeicoes: "Reembolso mediante nota e identificação dos participantes. Jantar com contraparte externa sem teto rígido, com bom senso.",
  antecedencia_emissao_dias: 7
};

AQUA.catalogo = {
  voos: [
    { id:"VOO-A", companhia:"TAP Air Portugal", rota:"GRU-LIS-ORY", direto:false, chega_em:"ORY",
      ida:"TP-0087 GRU 17:55 -> LIS 08:20(+1); TP-0432 LIS 10:15 -> ORY 12:40",
      partida_gru:"2026-10-16T17:55:00-03:00", chegada:"2026-10-17T12:40:00+02:00",
      volta:"ORY 13:05 -> LIS 15:00; LIS 17:40 -> GRU 23:55", partida_volta:"2026-10-21T13:05:00+02:00",
      preco_eur:1980, programa:"Star Alliance", flying_blue:false, ev:["F-009"] },
    { id:"VOO-B", companhia:"LATAM", rota:"GRU-CDG", direto:true, chega_em:"CDG",
      ida:"LA-8022 GRU 18:20 -> CDG 10:55(+1)",
      partida_gru:"2026-10-16T18:20:00-03:00", chegada:"2026-10-17T10:55:00+02:00",
      volta:"LA-8023 CDG 18:55 -> GRU 05:40(+1)", partida_volta:"2026-10-21T18:55:00+02:00",
      preco_eur:2120, programa:"oneworld", flying_blue:false, ev:["F-009"] },
    { id:"VOO-C", companhia:"KLM", rota:"GRU-AMS-CDG", direto:false, chega_em:"CDG",
      ida:"KL-0792 GRU 18:40 -> AMS 09:35(+1); KL-1233 AMS 10:20 -> CDG 11:20",
      partida_gru:"2026-10-16T18:40:00-03:00", chegada:"2026-10-17T11:20:00+02:00",
      volta:"CDG 17:10 -> AMS 18:25; KL-0791 AMS 20:55 -> GRU 05:10(+1)", partida_volta:"2026-10-21T17:10:00+02:00",
      preco_eur:2450, programa:"Flying Blue", flying_blue:true, ev:["F-009"] },
    { id:"VOO-D", companhia:"Air France", rota:"GRU-CDG", direto:true, chega_em:"CDG",
      ida:"AF-0459 GRU 18:05 -> CDG 10:30(+1)",
      partida_gru:"2026-10-16T18:05:00-03:00", chegada:"2026-10-17T10:30:00+02:00",
      volta:"AF-0454 CDG 18:55 -> GRU 05:25(+1)", partida_volta:"2026-10-21T18:55:00+02:00",
      preco_eur:2610, programa:"Flying Blue", flying_blue:true,
      nota:"Elegível para upgrade de fila e sala.", ev:["F-009"] }
  ],
  hoteis: [
    { id:"HOT-01", nome:"Best Western Hotel Acadie Paris Nord Villepinte", local:"Villepinte (93)", diaria_eur:179, academia:false, perto_do_pavilhao:true, ev:["F-030"] },
    { id:"HOT-02", nome:"Novotel Suites Paris CDG Airport Villepinte", local:"Villepinte (93)", diaria_eur:205, academia:true, perto_do_pavilhao:true,
      check_in:"14:00", check_out:"12:00", min_ao_pavilhao:8, ev:["F-030","E-040","E-041","E-039"] },
    { id:"HOT-03", nome:"Hyatt Place Paris Charles de Gaulle Airport", local:"Roissy-en-France (95)", diaria_eur:268, academia:true, perto_do_pavilhao:false, ev:["F-030"] },
    { id:"HOT-04", nome:"ibis Paris Avenue d'Italie 13eme", local:"Place d'Italie, Paris 13e", diaria_eur:152, academia:false, perto_do_pavilhao:false, ev:["F-030"] },
    { id:"HOT-05", nome:"Sofitel Le Scribe Paris Opera", local:"1 rue Scribe, 75009 Paris", diaria_eur:415, academia:true, perto_do_pavilhao:false, ev:["F-030"] }
  ],
  restaurantes: [
    { id:"RES-01", nome:"Le Duc", endereco:"243 boulevard Raspail, 75014 Paris", perfil:"peixe e frutos do mar, ambiente reservado",
      peixe:true, ruidoso:false, cordeiro_base:false, vegetariano_forte:false, aceita_reserva:true,
      indisponivel_corpus:["2026-10-17"], motivo_corpus:"casa reservada para evento privado",
      fechado_web:["domingo"], ev:["E-025","E-034"] },
    { id:"RES-02", nome:"Clamato", endereco:"80 rue de Charonne, 75011 Paris", perfil:"frutos do mar, sem reserva, ambiente ruidoso",
      peixe:true, ruidoso:true, cordeiro_base:false, vegetariano_forte:false, aceita_reserva:false,
      indisponivel_corpus:[], fechado_web:[], ev:["E-026","E-036"] },
    { id:"RES-03", nome:"Le Bistrot Paul Bert", endereco:"18 rue Paul Bert, 75011 Paris", perfil:"bistrô classico, carnes e cordeiro",
      peixe:false, ruidoso:false, cordeiro_base:true, vegetariano_forte:false, aceita_reserva:true,
      indisponivel_corpus:[], fechado_web:["domingo","segunda"], ev:["E-027","E-035"] },
    { id:"RES-04", nome:"L'Arpege", endereco:"84 rue de Varenne, 75007 Paris", perfil:"cozinha vegetal",
      peixe:true, ruidoso:false, cordeiro_base:false, vegetariano_forte:true, aceita_reserva:true, alto_custo:true,
      indisponivel_corpus:[], fechado_web:["sabado","domingo"], ev:["E-028","E-033"] },
    { id:"RES-05", nome:"Le Baratin", endereco:"3 rue Jouye-Rouve, 75020 Paris", perfil:"bistrô pequeno, cozinha de mercado",
      peixe:false, ruidoso:false, cordeiro_base:false, vegetariano_forte:false, aceita_reserva:true,
      indisponivel_corpus:["2026-10-18","2026-10-19"], motivo_corpus:"fecha domingos e segundas",
      fechado_web:["domingo","segunda"], ev:["F-031","E-028"] },
    { id:"RES-06", nome:"Restaurante do Novotel Suites Villepinte", endereco:"Villepinte (93)", perfil:"serviço de hotel, cardápio curto",
      peixe:false, ruidoso:false, cordeiro_base:false, vegetariano_forte:false, aceita_reserva:true, no_hotel:true,
      indisponivel_corpus:[], fechado_web:[], ev:["F-031"] },
    { id:"RES-07", nome:"Restaurante do Hyatt Place Paris CDG", endereco:"Roissy-en-France (95)", perfil:"cozinha internacional",
      peixe:false, ruidoso:false, cordeiro_base:false, vegetariano_forte:false, aceita_reserva:true,
      indisponivel_corpus:[], fechado_web:[], ev:["F-031"] }
  ]
};

/* Compromissos que o corpus ja traz marcados. `firmeza` diz se podemos mexer. */
AQUA.compromissos = [
  { id:"C-01", dia:"2026-10-16", inicio:"09:00", fim:"10:30", titulo:"Comitê de investimentos", local:"São Paulo, escritório", tz:"America/Sao_Paulo", firmeza:"fixo", ev:["F-002"] },
  { id:"C-02", dia:"2026-10-16", inicio:"14:00", fim:"15:00", titulo:"Call com fundo LP", local:"remoto", tz:"America/Sao_Paulo", firmeza:"movel",
    nota:"Agendada pelo escritório de SP, em horário de Brasília.", ev:["E-020"] },
  { id:"C-03", dia:"2026-10-17", inicio:"13:00", fim:"13:45", titulo:"SIAL: sessão de abertura - Food intelligence: redefining the value chain", local:"Hall 7, palco principal", tz:"Europe/Paris", firmeza:"fixo",
    nota:"Ele disse que é a que interessa de verdade.", ev:["F-002","E-009"] },
  { id:"C-04", dia:"2026-10-17", inicio:"16:00", fim:"17:00", titulo:"Reunião com Étienne Prévost (Groupe Vallonne)", local:"Estande do grupo, Hall 5A", tz:"Europe/Paris", firmeza:"fixo",
    nota:"Marcada por ele, convite em horário de Paris.", ev:["E-021","E-016"] },
  { id:"C-05", dia:"2026-10-17", inicio:"20:30", fim:null, titulo:"Jantar em aberto", local:null, tz:"Europe/Paris", firmeza:"aberto",
    nota:"A secretaria não fechou. Pendência explícita.", ev:["E-010"] },
  { id:"C-06", dia:"2026-10-18", inicio:"10:00", fim:"11:00", titulo:"SIAL: painel de proteínas alternativas", local:"Hall 6", tz:"Europe/Paris", firmeza:"fixo", ev:["F-002"] },
  { id:"C-07", dia:"2026-10-18", inicio:"13:00", fim:null, titulo:"Almoço com Sofia Marchetti", local:"a definir", tz:"Europe/Paris", firmeza:"local_aberto", ev:["F-002","E-015"] },
  { id:"C-08", dia:"2026-10-18", inicio:"19:30", fim:null, titulo:"Jantar com o time de originação da Aqua Europa", local:"a definir", tz:"Europe/Paris", firmeza:"local_aberto",
    nota:"Quatro pessoas.", ev:["F-002","E-008"] },
  { id:"C-09", dia:"2026-10-19", inicio:"09:30", fim:"12:00", titulo:"Rodada de reuniões no SIAL", local:"Paris Nord Villepinte", tz:"Europe/Paris", firmeza:"em_montagem", ev:["F-002"] },
  { id:"C-10", dia:"2026-10-19", inicio:"15:00", fim:"16:30", titulo:"Visita à planta da Coopérative du Nord", local:"Lille", tz:"Europe/Paris", firmeza:"fixo", ev:["F-002"] },
  { id:"C-11", dia:"2026-10-20", inicio:"10:00", fim:"17:00", titulo:"SIAL: dia livre para circulação", local:"Paris Nord Villepinte", tz:"Europe/Paris", firmeza:"em_montagem", ev:["F-002"] },
  { id:"C-12", dia:"2026-10-20", inicio:"19:00", fim:null, titulo:"Jantar com investidores", local:"a definir", tz:"Europe/Paris", firmeza:"a_confirmar", ev:["F-002","E-008"] },
  { id:"C-13", dia:"2026-10-21", inicio:"11:00", fim:"12:00", titulo:"SIAL: encerramento", local:"Paris Nord Villepinte", tz:"Europe/Paris", firmeza:"fixo", ev:["F-002"] },
  { id:"C-14", dia:"2026-10-21", inicio:"18:55", fim:null, titulo:"Voo de volta (CDG)", local:"CDG", tz:"Europe/Paris", firmeza:"fixo", ev:["F-002"] }
];

/* Sessoes que a equipe recortou. Algumas colidem entre si e com a agenda. */
AQUA.sessoes = [
  { id:"S-01", dia:"2026-10-17", inicio:"13:00", fim:"13:45", titulo:"Food intelligence: redefining the value chain", local:"Hall 7, palco principal", tema:"dados", na_agenda:true },
  { id:"S-02", dia:"2026-10-18", inicio:"10:00", fim:"11:00", titulo:"Proteínas alternativas: o que sobrou da onda", local:"Hall 6", tema:"proteina", na_agenda:true },
  { id:"S-03", dia:"2026-10-18", inicio:"10:30", fim:"11:30", titulo:"Rastreabilidade e dados na cadeia de frios", local:"Hall 7", tema:"dados", na_agenda:false },
  { id:"S-04", dia:"2026-10-19", inicio:"09:30", fim:"10:30", titulo:"Investimento em agrifood na América Latina", local:"Hall 7", tema:"fundos", na_agenda:false },
  { id:"S-05", dia:"2026-10-20", inicio:"14:00", fim:"15:00", titulo:"Private label: o que mudou no varejo europeu", local:"Hall 5A", tema:"sourcing", na_agenda:false }
];

AQUA.contatos = [
  { id:"K-01", nome:"Étienne Prévost", org:"Groupe Vallonne", papel:"diretor de sourcing", idiomas:["ingles"],
    estado:"reunião marcada por ele", dias:["2026-10-17"], assunto:"sourcing / relacionamento",
    nota:"Relacionamento antigo, veio de uma co-investida. Sebastian gosta dele.", ev:["E-016"] },
  { id:"K-02", nome:"Sofia Marchetti", org:"Marchetti Ingredienti (Itália)", papel:"socia", idiomas:["ingles","espanhol"],
    estado:"almoço confirmado", dias:["2026-10-18"], vegetariana:true,
    nota:"Vegetariana há anos. Quase deu ruim no jantar de Milão em maio.", ev:["E-015"] },
  { id:"K-03", nome:"Henrik Sørensen", org:"Nordvest Foods", papel:"head de M&A", idiomas:["ingles"],
    estado:"pediu 40 min, não respondido", dias:["2026-10-19","2026-10-20"], duracao_min:40,
    prefere:"cedo", assunto:"números de uma possível transação", sensivel:true, contraparte_de:"K-04",
    nota:"Quer discutir números. Não dá para conversar no meio do corredor.", ev:["E-012","E-013"] },
  { id:"K-04", nome:"Claire Dubois", org:"Fonds Meridien", papel:"partner", idiomas:["ingles","frances"],
    estado:"sem contato marcado", dias:["2026-10-17","2026-10-18","2026-10-19","2026-10-20","2026-10-21"],
    concorrente:true, concorrente_de:"K-03", assunto:"relacionamento com fundos europeus",
    nota:"Concorrente direto no deal da Nordvest. Semana toda no evento.", ev:["E-014"] },
  { id:"K-05", nome:"Rafael Ortega", org:"Grupo Ibérica Fresh", papel:"CEO", idiomas:["espanhol"],
    estado:"sem contato marcado", dias:["2026-10-20"], assunto:"fornecedor de duas portfólio", ev:["F-005"] },
  { id:"K-06", nome:"Tomás Beltrán", org:"independente (ex-Nestlé)", papel:"consultor", idiomas:["espanhol","ingles"],
    estado:"sem agenda fixa", dias:[], assunto:"vale um café, conhece todo mundo", ev:["F-005"] },
  { id:"K-07", nome:"Time de originação Aqua Europa", org:"Aqua Capital", papel:"Camila Reis, Pierre Lambert, Ana Sousa, Diego Fontana",
    idiomas:["portugues","ingles"], estado:"jantar de domingo na agenda", dias:["2026-10-17","2026-10-18","2026-10-19","2026-10-20","2026-10-21"],
    pessoas:4, ev:["F-005"] }
];

/* Onde a web contradiz o corpus. Regra do desafio: o corpus manda em preco,
   disponibilidade e condicoes. Registramos o conflito e seguimos o corpus,
   mas cada item vira uma acao de reconfirmacao. */
AQUA.divergencias = [
  { id:"V-001", tema:"Greve de tripulação 17-21/10",
    corpus_diz:"A cotação não menciona risco operacional em nenhuma companhia.",
    web_diz:"Aviso de greve nacional de tripulação de 17 a 21/10/2026 cobrindo toda transportadora francesa, Air France nominalmente incluida. LATAM, KLM e TAP fora do aviso.",
    usada:"web", evidencia:"E-030", fontes:["F-033","F-034"],
    justificativa:"Não é contradição de preço nem de disponibilidade cotada, e um fato operacional novo que o corpus não tinha como ter. O enunciado manda pesquisar na internet e registrar. O risco incide exatamente nos dias de pouso e de volta.",
    impacto:"alto" },
  { id:"V-002", tema:"Horário de funcionamento do SIAL",
    corpus_diz:"Abre às 09:30 e fecha às 18:00 nos dias de semana; sábado e domingo fecha às 19:00.",
    web_diz:"Sábado a terça 10:00-18:30; quarta 10:00-17:00; última entrada às 14:00.",
    usada:"corpus", evidencia:"E-031", fontes:["F-023","F-024"],
    justificativa:"O corpus manda nas condições. Mas o próprio arquivo avisa que 'nem tudo foi conferido' (E-024), e pelo horário real a rodada de segunda às 09:30 começa antes de a feira abrir. O plano foi montado para ficar de pé nas duas leituras: nada crítico antes das 10:00.",
    impacto:"medio" },
  { id:"V-003", tema:"L'Arpège no domingo",
    corpus_diz:"Disponível; reserva com antecedência.",
    web_diz:"The restaurant is open Monday to Friday for lunch and dinner. Fechado sabado e domingo.",
    usada:"corpus", evidencia:"E-033", fontes:["F-025"],
    justificativa:"O corpus manda na disponibilidade e o almoço com a Sofia e domingo. Mantido, com reconfirmação obrigatória e alternativa nomeada.",
    impacto:"alto" },
  { id:"V-004", tema:"Le Duc no domingo",
    corpus_diz:"Sábado 17/10 indisponível. Demais noites, disponível.",
    web_diz:"Le Duc: domingo fechado. Terça a sábado 12:00-14:00 e 19:00-22:30.",
    usada:"corpus", evidencia:"E-034", fontes:["F-027"],
    justificativa:"Idem. No mundo real o jantar de domingo do time cairia; no cenário do desafio ele existe. Mantido com reconfirmação.",
    impacto:"alto" },
  { id:"V-005", tema:"Le Bistrot Paul Bert no domingo e segunda",
    corpus_diz:"Disponível todas as noites.",
    web_diz:"Aberto terça a sábado.",
    usada:"corpus", evidencia:"E-035", fontes:["F-026"],
    justificativa:"Sem efeito prático: o restaurante foi descartado por outro motivo (cordeiro na base do cardápio contra P-05).",
    impacto:"baixo" },
  { id:"V-006", tema:"Horário real do AF459",
    corpus_diz:"AF-0459 GRU 18:05 -> CDG 10:30(+1).",
    web_diz:"AF459 parte de GRU 19:35 e chega a CDG 11:55, Terminal 2E.",
    usada:"corpus", evidencia:"E-042", fontes:["F-038"],
    justificativa:"O corpus manda no horário cotado. Vale notar que, com o horário real, a Air France chegaria 11:55 e não sobraria margem nenhuma para a sessão das 13:00 depois da fronteira.",
    impacto:"medio" },
  { id:"V-007", tema:"RER B a noite",
    corpus_diz:"O pavilhão e servido pela estação Parc des Expositions na linha RER B, que também atende CDG.",
    web_diz:"Até 11/12/2026, de segunda a sexta e em certos fins de semana, o tráfego é interrompido entre Chatelet-Les Halles e CDG2-TGV/Mitry-Claye a partir das 22h45.",
    usada:"web", evidencia:"E-038", fontes:["F-035"],
    justificativa:"Não é contradição de disponibilidade cotada, e uma condição de operação. Consequência direta: volta de jantar no centro depois das 22h45 não pode depender de RER B. O plano usa carro nessas noites.",
    impacto:"medio" },
  { id:"V-008", tema:"Check-in e check-out do hotel",
    corpus_diz:"A cotação não informa horário de check-in nem de check-out.",
    web_diz:"Novotel Suites CDG Villepinte: check-in a partir das 14:00, check-out até às 12:00.",
    usada:"web", evidencia:"E-039", fontes:["F-036"],
    justificativa:"Informação ausente do corpus, não contraditória. Tem dois efeitos: o quarto não está garantido na manhã de sábado, e o check-out de quarta colide com a sessão de encerramento das 11:00-12:00.",
    impacto:"medio" }
];
