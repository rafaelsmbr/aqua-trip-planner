/* Catalogo de decisoes.
   modo:"auto"   = o sistema decide; ha uma resposta claramente melhor. Fica registrada com o porque.
   modo:"aberta" = duas opcoes defensaveis. Quem decide e o CEO, no Inbox. A escolha muda o roteiro. */
window.AQUA = window.AQUA || {};

AQUA.decisoes = [

  /* ============================ ABERTAS: vao para o Inbox ============================ */

  { id:"D-001", modo:"aberta", chave:"voo", grupo:"Chegada e volta",
    titulo:"Qual voo emitir para Paris",
    pergunta:"Air France (seu programa, mais folga na chegada) ou LATAM (fora do aviso de greve, mais barata)?",
    porque_voce_decide:"Os dois caminhos se defendem e o que está em jogo é o que você disse que mais importa: estar na sessão de abertura. Não dá para decidir isso no seu lugar.",
    conflito:[
      { fonte:"F-001", ev:"E-001", rotulo:"Seu perfil, mantido pela secretaria" },
      { fonte:"F-033", ev:"E-030", rotulo:"Aviso de greve publicado em 22/09" }
    ],
    opcoes:[
      { valor:"VOO-D", rotulo:"Air France AF-0459", sub:"direto, pousa 10:30 - EUR 2.610", recomendada:true, ref:"VOO-D",
        a_favor:["Acumula Flying Blue, e você faz questão","Único com folga real (25 min) para a sessão das 13:00","Direto: sem risco de conexão perdida","Volta 18:55 é a que já está na sua agenda"],
        contra:["Air France está nominalmente no aviso de greve de 17 a 21/10","Se cancelar, você perde o sábado inteiro","EUR 490 mais caro que a LATAM"] },
      { valor:"VOO-B", rotulo:"LATAM LA-8022", sub:"direto, pousa 10:55 - EUR 2.120", ref:"VOO-B",
        a_favor:["Fora do aviso de greve (o aviso cobre só transportadoras francesas)","EUR 490 mais barato","Direto, e a volta 18:55 também bate com a agenda"],
        contra:["Não acumula Flying Blue","Pousando 10:55, a folga para a sessão das 13:00 vira zero no cenário conservador de fronteira","oneworld: sem fila prioritária na imigração"] }
    ],
    descartadas:[
      { opcao:"VOO-C KLM (EUR 2.450)", motivo:"E Flying Blue e está fora da greve, mas pousa 11:20: com a fila de fronteira atual você chega depois das 13:00 e perde a abertura. A volta às 17:10 também não bate com a agenda." },
      { opcao:"VOO-A TAP (EUR 1.980)", motivo:"A mais barata, mas pousa em Orly às 12:40 e Orly não tem ligação direta com Villepinte. Perde a abertura com folga." }
    ],
    politica:"Diferença de tarifa acima de 15% em qualquer combinação, então a política 4.2 devolve a escolha para o viajante, com justificativa. Nenhuma das duas viola a política.",
    restricoes:["R-001","R-002","R-010"], fontes:["F-009","F-001","F-004","F-033","F-020"] },

  { id:"D-002", modo:"aberta", chave:"jantar_sabado", grupo:"Sábado",
    titulo:"O jantar de sábado",
    pergunta:"Noite livre depois do voo, ou um jantar de trabalho?",
    porque_voce_decide:"Esta é a pergunta que a secretaria deixou escrita em aberto na nota de 14/08 e marcou como 'Perguntar'. Ninguém respondeu.",
    conflito:[
      { fonte:"F-007", ev:"E-010", rotulo:"Nota da Camila: pendência não resolvida" },
      { fonte:"F-001", ev:"E-002", rotulo:"Seu perfil: depois de voo longo você não presta" }
    ],
    opcoes:[
      { valor:"livre", rotulo:"Noite livre", sub:"jantar leve no hotel - EUR 55", recomendada:true, ref:"RES-06",
        a_favor:["Você pousou de madrugada e dorme mal em voo, mesmo em executiva","Os dois jantares de trabalho que você pediu já estão no domingo e na terça","Hotel a 8 min do pavilhão: não gasta noite em trânsito"],
        contra:["Queima uma das cinco noites em Paris"] },
      { valor:"trabalho", rotulo:"Jantar de trabalho", sub:"Clamato, frutos do mar - EUR ~160", ref:"RES-02",
        a_favor:["Aproveita a noite de sábado, que está vazia","Frutos do mar, que é o que você procura"],
        contra:["Clamato é ruidoso e não aceita reserva, contra o que você já disse duas vezes","Le Duc está indisponível exatamente no sábado 17 (evento privado)","Seria o terceiro jantar de trabalho, e você pediu dois"] }
    ],
    restricoes:["R-003","R-006"], fontes:["F-007","F-001","F-031"] },

  { id:"D-003", modo:"aberta", chave:"claire", grupo:"Terça",
    titulo:"Encontrar a Claire Dubois?",
    pergunta:"Café curto com a Claire, ou deixar para a próxima?",
    porque_voce_decide:"Relacionamento com fundos europeus e um dos seus dois focos da edição. Mas a Claire e concorrente direta no deal da Nordvest, e você vai ver o Henrik na segunda para falar de números. O risco é de informação, não de agenda.",
    conflito:[
      { fonte:"F-005", ev:"E-014", rotulo:"Contatos: Claire e concorrente direta no deal da Nordvest" },
      { fonte:"F-007", ev:"E-011", rotulo:"Nota da Camila: foco em relacionamento com fundos europeus" }
    ],
    opcoes:[
      { valor:"cafe_curto", rotulo:"Café de 30 min na terça", sub:"terça 15:30, depois do Henrik", recomendada:true,
        a_favor:["Atende seu foco declarado de relacionamento com fundos","Ela está no evento a semana toda; não aparecer também comunica algo","30 min, sem pauta: não é reunião de conteúdo"],
        contra:["Ela é contraparte concorrente num deal vivo","Exige disciplina: Nordvest fora da conversa"],
        guardas:["Nordvest e assunto proibido","Agendar depois do Henrik, em dia diferente","Local público e neutro, nunca perto do estande da Nordvest"] },
      { valor:"nao_encontrar", rotulo:"Não encontrar nesta edição", sub:"sem custo de agenda",
        a_favor:["Elimina qualquer risco de vazamento no deal da Nordvest","Libera 30 min na terça","Dá para retomar em contexto neutro depois do deal"],
        contra:["Perde contato com um fundo francês relevante","Pode ser lido como recuo"] }
    ],
    restricoes:["R-007"], fontes:["F-005","F-007"] },

  { id:"D-004", modo:"aberta", chave:"almoco_sofia", grupo:"Domingo",
    titulo:"Onde almoçar com a Sofia Marchetti",
    pergunta:"L'Arpège no centro de Paris, ou algo perto da feira?",
    porque_voce_decide:"A Sofia é vegetariana e isso já quase deu problema no jantar de Milão. O único lugar de cozinha vegetal da seleção está no 7e, e isso custa uma hora e meia de carro no seu domingo.",
    conflito:[
      { fonte:"F-005", ev:"E-015", rotulo:"Contatos: Sofia é vegetariana há anos" },
      { fonte:"F-031", ev:"E-028", rotulo:"Seleção: L'Arpège é a única cozinha vegetal" }
    ],
    opcoes:[
      { valor:"arpege", rotulo:"L'Arpège, 7e", sub:"cozinha vegetal - EUR ~420 para dois", recomendada:true, ref:"RES-04",
        a_favor:["Cozinha vegetal: a anfitriã come bem, sem adaptação","Ambiente silencioso, dá para conversar","Você já fica em Paris para o jantar do time a noite"],
        contra:["45 min de carro em cada sentido","EUR ~420 para dois pressiona o 'bom senso' da política","No mundo real a casa fecha no domingo (ver divergência V-003)"] },
      { valor:"perto_da_feira", rotulo:"Perto da feira", sub:"restaurante do hotel - EUR ~120 para dois", ref:"RES-06",
        a_favor:["Zero deslocamento: devolve 1h30 ao seu domingo","Muito mais barato","Você volta rápido para o pavilhão se quiser"],
        contra:["Cardápio curto de hotel, fraco para uma convidada vegetariana","Repete o erro de Milão","Lugar sem graça para uma sócia que confirmou almoço com você"] }
    ],
    restricoes:["R-004","R-011"], fontes:["F-005","F-031","F-004"] },

  { id:"D-005", modo:"aberta", chave:"lille", grupo:"Segunda",
    titulo:"A visita à planta em Lille",
    pergunta:"Manter a ida a Lille, ou converter em visita remota?",
    porque_voce_decide:"A visita dura 1h30 e custa cerca de 6h de porta a porta. E o único item da semana que tira você da feira por um dia inteiro. Se a planta é o ponto da viagem, vale; se e cortesia, não.",
    conflito:[
      { fonte:"F-002", ev:"F-002", rotulo:"Agenda: visita marcada 15:00-16:30 em Lille" },
      { fonte:"F-007", ev:"E-011", rotulo:"Nota da Camila: três conversas boas valem mais que vinte apertos de mão" }
    ],
    opcoes:[
      { valor:"manter", rotulo:"Manter a ida a Lille", sub:"TGV 2a classe - EUR ~120", recomendada:true,
        a_favor:["Ver a planta é algo que não se faz por vídeo","Está na agenda como compromisso firme","TGV é confortável: dá para trabalhar nos 62 min de cada trecho"],
        contra:["Consome das 11:50 às 19:10, para 1h30 de visita","Tira você da feira na segunda, que é o dia em que o Henrik também está","Endereço da planta não está no corpus: o último trecho é estimado"] },
      { valor:"remoto", rotulo:"Converter em call", sub:"1h de vídeo, sem deslocamento",
        a_favor:["Devolve 4h30 de feira na segunda","Abre espaço para mais conversas de sourcing, que é o foco da edição","Elimina a dependência de TGV e de um endereço que não temos"],
        contra:["Visita de planta por vídeo não mostra o que você iria ver","Pode soar como desinteresse com a cooperativa","Compromisso já aceito: remarcar custa capital de relacionamento"] }
    ],
    restricoes:["R-008"], fontes:["F-002","F-007","F-018"] },

  { id:"D-006", modo:"aberta", chave:"jantar_terca", grupo:"Terça",
    titulo:"Onde jantar com os investidores",
    pergunta:"Le Duc ou Le Baratin?",
    porque_voce_decide:"Os dois servem. A diferença e o tamanho da mesa, e ninguém registrou quantos investidores são.",
    conflito:[
      { fonte:"F-002", ev:"F-002", rotulo:"Agenda: jantar com investidores, a confirmar" },
      { fonte:"F-001", ev:"E-004", rotulo:"Seu perfil: peixe, e nada de lugar barulhento" }
    ],
    opcoes:[
      { valor:"le_duc", rotulo:"Le Duc, 14e", sub:"peixe, ambiente reservado - EUR ~440", recomendada:true, ref:"RES-01",
        a_favor:["Peixe e frutos do mar, que é o que você procura","Ambiente reservado: da para negociar e ouvir","Comporta mesa maior se forem mais de quatro"],
        contra:["Mesmo lugar do jantar de domingo com o time","55 min de carro desde o pavilhão"] },
      { valor:"le_baratin", rotulo:"Le Baratin, 20e", sub:"bistrô pequeno, cozinha de mercado - EUR ~260", ref:"RES-05",
        a_favor:["Não repete o restaurante do domingo","Bem mais barato","Casa pequena e silenciosa, boa para conversa"],
        contra:["Pequeno demais se a mesa passar de quatro","Não tem peixe como base do cardápio","Fecha domingo e segunda: sem margem para remarcar"] }
    ],
    restricoes:["R-006","R-012"], fontes:["F-002","F-001","F-031"] },

  /* ============================ AUTOMATICAS: o sistema decidiu ============================ */

  { id:"D-010", modo:"auto", chave:"hotel", grupo:"Hospedagem",
    titulo:"Hotel: Novotel Suites Paris CDG Airport Villepinte",
    escolha:"HOT-02", ref:"HOT-02", selecao:{catalogo:"hoteis", id:"HOT-02"},
    justificativa:"E a única opção que fecha as três condições ao mesmo tempo: cabe no teto de EUR 320 da política, tem academia, e fica a 8 min do pavilhão. A proximidade não é conforto: e o que viabiliza chegar na sessão de abertura no sábado e não gastar noite em trânsito.",
    descartadas:[
      { opcao:"HOT-05 Sofitel Le Scribe (EUR 415)", motivo:"Estoura o teto de EUR 320 e a aprovação exige o comitê, que não se reúne durante a viagem. Além disso, de Opera ao pavilhão são 45-60 min: no sábado você perderia a abertura." },
      { opcao:"HOT-03 Hyatt Place CDG (EUR 268)", motivo:"Cabe no teto e tem academia, mas fica em Roissy, entre o aeroporto e o pavilhão: mais longe e EUR 63 mais caro por noite que o Novotel, sem ganho." },
      { opcao:"HOT-01 Best Western Acadie (EUR 179)", motivo:"EUR 26 mais barato e também em Villepinte, mas não tem academia, que é item que você procura." },
      { opcao:"HOT-04 ibis Avenue d'Italie (EUR 152)", motivo:"O mais barato, mas fica no extremo sul de Paris, sem academia, e a uma hora do pavilhão. Inviabiliza a semana." }
    ],
    metodo:"regra", restricoes:["R-005","R-009"], fontes:["F-030","F-004","F-001","F-013"] },

  { id:"D-011", modo:"auto", chave:"noites", grupo:"Hospedagem",
    titulo:"Quatro noites, de sábado a quarta",
    escolha:"4 noites (17 a 21/10)",
    justificativa:"A cotação e de 5 diárias a partir de 16/10, mas você voa na noite de 16 e dorme no avião. Pagar a noite de 16 só se justificaria para garantir o quarto na manhã de sábado, e isso não resolve: o check-in do hotel é às 14:00, depois da sessão de abertura. Entao a mala vai com o motorista e fica na portaria. Economiza EUR 205.",
    metodo:"regra", restricoes:["R-005"], fontes:["F-030","F-036"] },

  { id:"D-012", modo:"auto", chave:"sabado_chegada", grupo:"Sábado",
    titulo:"Do pouso direto ao pavilhão, com a mala seguindo para o hotel",
    escolha:"VTC pré-agendado, sem passar no hotel",
    justificativa:"Fizemos a conta a partir do instante do pouso. Com o controle biométrico EES em operação, a fronteira não-UE em CDG está em 60-120 min. No cenário conservador você sai do terminal 1h40 depois de pousar. Não cabe passar no hotel antes das 13:00, e o quarto não estaria liberado de todo jeito. Entao o motorista deixa você no pavilhão e leva a mala ao hotel.",
    detalhes:[
      "Motorista pré-agendado com meet and greet, não fila de táxi",
      "Fast-track de imigração comprado com antecedência",
      "Credencial do SIAL emitida online antes de embarcar",
      "Mala entregue na portaria do Novotel pelo motorista"
    ],
    metodo:"misto", restricoes:["R-001","R-002"], fontes:["F-020","F-040","F-032","F-010"] },

  { id:"D-013", modo:"auto", chave:"henrik", grupo:"Segunda",
    titulo:"Henrik Sørensen: segunda, 10:00, em sala reservada",
    escolha:"Segunda 19/10, 10:00-10:40, sala de reunião privada no pavilhão",
    justificativa:"Ele pediu 40 min, de preferência cedo, e avisou que depois do almoço a feira vira um caos. Você disse que não quer decidir número com a cabeça ruim, e conteúdo pesado você prefere de manhã. Segunda de manhã é o primeiro horário da viagem em que você já dormiu duas noites em terra. Marcamos 10:00 e não 09:30 de propósito: pelo horário real a feira só abre às 10:00, e assim o compromisso fica de pé nas duas versões do horário.",
    detalhes:[
      "Sala fechada, não estande e não corredor: o assunto e número de transação",
      "A Claire Dubois, concorrente direta neste deal, está no evento a semana toda",
      "Responder ao Henrik até 12/10: ele pediu confirmação na semana anterior"
    ],
    metodo:"misto", restricoes:["R-003","R-007"], fontes:["F-006","F-001","F-005","F-024"] },

  { id:"D-014", modo:"auto", chave:"domingo_sessao", grupo:"Domingo",
    titulo:"Domingo 10:00: painel de proteínas, não o de rastreabilidade",
    escolha:"S-02 Proteínas alternativas (Hall 6)",
    justificativa:"As duas sessões se sobrepõem: proteínas 10:00-11:00 no Hall 6 e rastreabilidade 10:30-11:30 no Hall 7. O recorte da equipe colocou as duas na mesma manhã sem notar. Proteína é literalmente metade do seu foco declarado na edição, e a sessão de proteínas já estava na sua agenda. O painel de rastreabilidade fica com alguém do time de originação, que relata depois.",
    descartadas:[
      { opcao:"S-03 Rastreabilidade e dados na cadeia de frios", motivo:"Colide 30 min com o painel de proteínas e está a um hall de distância. Delegado ao time, que tem quatro pessoas em Paris na semana." }
    ],
    metodo:"regra", restricoes:["R-013"], fontes:["F-003","F-002","F-007","F-005"] },

  { id:"D-015", modo:"auto", chave:"jantar_domingo", grupo:"Domingo",
    titulo:"Jantar do time no Le Duc",
    escolha:"RES-01", ref:"RES-01", selecao:{catalogo:"restaurantes", id:"RES-01"},
    justificativa:"E o jantar com o time de originação que você pediu. Das opções livres no domingo, Le Duc é a única que atende peixe em ambiente reservado. Clamato é ruidoso e não reserva, e Paul Bert tem cordeiro na base do cardápio. Le Baratin fecha domingo.",
    descartadas:[
      { opcao:"RES-02 Clamato", motivo:"Ruidoso e sem reserva. Você já disse que em lugar barulhento não escuta ninguém e a reunião não rende, e são cinco pessoas na mesa." },
      { opcao:"RES-03 Le Bistrot Paul Bert", motivo:"Carnes e cordeiro na base do cardápio, e você não come cordeiro." },
      { opcao:"RES-05 Le Baratin", motivo:"Fecha domingo, pelo próprio corpus." }
    ],
    metodo:"regra", restricoes:["R-006","R-012"], fontes:["F-031","F-001","F-008"] },

  { id:"D-016", modo:"auto", chave:"quarta_saida", grupo:"Quarta",
    titulo:"Late check-out na quarta, e saída para CDG às 15:30",
    escolha:"Late check-out até 14:00 + VTC às 15:30",
    justificativa:"O check-out do hotel é meio-dia e a sessão de encerramento é 11:00-12:00: você não consegue estar nos dois. Pedimos late check-out; se o hotel negar, a mala fica na portaria. Para o voo das 18:55 em CDG, com EES também na saída, a recomendação e estar no balcão 2h55 antes: saída do hotel às 15:30, chegada 15:55.",
    metodo:"misto", restricoes:["R-002"], fontes:["F-036","F-021","F-010"] },

  { id:"D-017", modo:"auto", chave:"sexta_call", grupo:"Sexta",
    titulo:"A call das 14:00 de sexta é em horário de Brasília",
    escolha:"Manter 14:00-15:00 BRT e sair direto para GRU",
    justificativa:"A secretaria anotou que essa call foi marcada pelo escritório de São Paulo e está em horário de Brasília, não de Paris. Ela termina às 15:00 e o voo sai às 18:05. Com 60 min de escritório ao aeroporto, você chega às 16:00, com 2h05 de folga. Da, mas sem margem para trânsito: se o comitê da manhã atrasar ou a call passar das 15:00, faca o restante do caminho por telefone.",
    alerta:"Folga de só 1h no fim da call. A alternativa e puxar a call para 13:00.",
    metodo:"misto", restricoes:["R-014"], fontes:["F-002","F-022"] },

  { id:"D-018", modo:"auto", chave:"transporte", grupo:"Deslocamento",
    titulo:"Carro com motorista como padrão, RER B em uma exceção",
    escolha:"VTC pré-agendado em quase tudo; RER B apenas Villepinte - Gare du Nord",
    justificativa:"Seu perfil diz que você não dirige em cidade desconhecida e se desloca de táxi, aplicativo ou motorista, e a política permite. Abrimos uma exceção na segunda: a estação Parc des Expositions fica a 61 m da entrada dos halls e o RER B chega a Gare du Nord em 26 min, enquanto o carro no meio do dia é pior. Nas voltas de jantar usamos carro também por outro motivo: até 11/12 o RER B interrompe o trecho CDG a partir das 22h45.",
    metodo:"misto", restricoes:["R-009"], fontes:["F-001","F-004","F-012","F-035","F-017"] },

  { id:"D-019", modo:"auto", chave:"tgv_classe", grupo:"Segunda",
    titulo:"TGV para Lille em 2a classe",
    escolha:"2a classe",
    justificativa:"A política autoriza executiva acima de 8h e manda econômica em trecho de até 3h. Paris-Lille são 62 min, então 2a classe. Não é economia de centavo: e a regra escrita.",
    metodo:"regra", restricoes:["R-008"], fontes:["F-004","F-018"] },

  { id:"D-020", modo:"auto", chave:"terca_agenda", grupo:"Terça",
    titulo:"Terça: Rafael Ortega, Tomás Beltrán e a sessão de private label",
    escolha:"Ortega 10:00, Beltrán 11:00, sessão S-05 às 14:00",
    justificativa:"Terça é o único dia que a agenda deixou livre para circulação, e é o único dia em que o Rafael Ortega está no evento. Ele é fornecedor de duas investidas e fala espanhol, que você fala. O Tomás Beltrán não tem agenda fixa e vale um café. A sessão de private label às 14:00 e a que casa com sourcing, seu outro foco.",
    metodo:"misto", restricoes:["R-013"], fontes:["F-005","F-003","F-007"] }
];

/* Compromissos que o plano marcou (não vieram prontos do corpus). Ficam aqui, como dado,
   para que um fato novo possa movê-los sem mexer no motor. `condicao` liga o item a uma
   decisão aberta: só entra no roteiro se a escolha bater. */
AQUA.agendados = [
  { id:"A-HENRIK", dia:"2026-10-19", inicio:"10:00", fim:"10:40", tipo:"reuniao",
    titulo:"Henrik Sørensen (Nordvest Foods) - números da transação",
    local:"Sala de reunião reservada, Paris Nord Villepinte", participantes:["Henrik Sørensen"],
    contato:"K-03", decisoes:["D-013"], fontes:["F-006","F-005"] },
  { id:"A-ORTEGA", dia:"2026-10-20", inicio:"10:00", fim:"10:45", tipo:"reuniao",
    titulo:"Rafael Ortega (Grupo Ibérica Fresh)", local:"Paris Nord Villepinte", participantes:["Rafael Ortega"],
    contato:"K-05", decisoes:["D-020"], fontes:["F-005"] },
  { id:"A-BELTRAN", dia:"2026-10-20", inicio:"11:00", fim:"11:40", tipo:"reuniao",
    titulo:"Café com Tomás Beltrán", local:"Paris Nord Villepinte", participantes:["Tomás Beltrán"],
    contato:"K-06", decisoes:["D-020"], fontes:["F-005"] },
  { id:"A-PRIVATE", dia:"2026-10-20", inicio:"14:00", fim:"15:00", tipo:"sessao",
    titulo:"SIAL: Private label - o que mudou no varejo europeu", local:"Hall 5A", caminhada_min:15,
    sessao:"S-05", decisoes:["D-020"], fontes:["F-003"] },
  { id:"A-CLAIRE", dia:"2026-10-20", inicio:"15:30", fim:"16:00", tipo:"reuniao",
    titulo:"Café com Claire Dubois (Fonds Meridien)", local:"Área de café neutra, Paris Nord Villepinte",
    participantes:["Claire Dubois"], contato:"K-04", condicao:{ claire:"cafe_curto" },
    decisoes:["D-003"], fontes:["F-005"] }
];

/* Restricoes percebidas, inclusive as que o pedido nao menciona. */
AQUA.restricoes = [
  { id:"R-001", descricao:"Ele quer estar na sessão de abertura de sábado às 13:00; disse que é a que interessa de verdade", origem:"dados/notas/2026-08-14-camila-preparacao-sial.md", tipo:"dura", ev:["E-009"] },
  { id:"R-002", descricao:"Depois de um voo internacional, a conta começa no pouso: desembarque, fronteira e bagagem são tempo de trajeto", origem:"web/transporte/acessos-villepinte.md + EES", tipo:"dura", ev:["E-029","E-037"] },
  { id:"R-003", descricao:"Nada de reunião de decisão no primeiro meio período depois de pousar de voo intercontinental", origem:"dados/perfil-ceo.md", tipo:"dura", ev:["E-002"] },
  { id:"R-004", descricao:"Sofia Marchetti e vegetariana; o lugar do almoço tem de servi-la bem", origem:"dados/contatos.md", tipo:"dura", ev:["E-015"] },
  { id:"R-005", descricao:"Teto de EUR 320 por diária, e acima disso exige um comitê que não se reúne durante a viagem", origem:"dados/politica-viagem.md", tipo:"politica", ev:["E-017"] },
  { id:"R-006", descricao:"Não come cordeiro e detesta restaurante barulhento para reunião", origem:"dados/perfil-ceo.md", tipo:"dura", ev:["E-004"] },
  { id:"R-007", descricao:"Claire Dubois e concorrente direta no deal da Nordvest, e o Henrik e o M&A da Nordvest: os dois contatos não podem se cruzar", origem:"dados/contatos.md", tipo:"dura", ev:["E-014","E-012"] },
  { id:"R-008", descricao:"Trecho de até 3h vai em econômica; Paris-Lille são 62 min", origem:"dados/politica-viagem.md", tipo:"politica", ev:["E-019"] },
  { id:"R-009", descricao:"Não dirige em cidade que não conhece: táxi, aplicativo ou motorista", origem:"dados/perfil-ceo.md", tipo:"dura", ev:["E-006"] },
  { id:"R-010", descricao:"Flying Blue Platinum, e ele faz questão do programa", origem:"dados/perfil-ceo.md", tipo:"preferencia", ev:["E-001"] },
  { id:"R-011", descricao:"Refeição de trabalho reembolsa com nota e participantes; contraparte externa sem teto rígido, com bom senso", origem:"dados/politica-viagem.md", tipo:"politica", ev:["F-004"] },
  { id:"R-012", descricao:"Dois jantares de trabalho nesta viagem: um com o time, um com contraparte externa", origem:"dados/notas/2026-08-14-camila-preparacao-sial.md", tipo:"dura", ev:["E-008"] },
  { id:"R-013", descricao:"Três conversas boas valem mais que vinte apertos de mão; foco em proteína, sourcing e fundos europeus", origem:"dados/notas/2026-08-14-camila-preparacao-sial.md", tipo:"preferencia", ev:["E-011"] },
  { id:"R-014", descricao:"A call de sexta às 14:00 está em horário de Brasília; a reunião de sábado com o Étienne, em horário de Paris", origem:"dados/agenda-ceo.md", tipo:"dura", ev:["E-020","E-021"] },
  { id:"R-015", descricao:"Não há restaurante de serviço completo dentro dos halls, só praça de alimentação e café de feira", origem:"dados/evento.md", tipo:"dura", ev:["E-023"] },
  { id:"R-016", descricao:"Sempre despacha bagagem, o que impede ir do aeroporto direto ao pavilhão sem resolver a mala", origem:"dados/perfil-ceo.md", tipo:"dura", ev:["E-006"] }
];

/* O que nao foi possivel decidir. */
AQUA.incertezas = [
  { id:"U-001", descricao:"Não sabemos se ele aceita trocar o acumulo Flying Blue por sair da exposição a greve.", tipo:"stakeholder",
    pergunta:"Você prefere manter a Air France e assumir o risco da greve de 17 a 21, ou emitir LATAM e perder o acumulo Flying Blue nesta viagem?",
    suposicao_adotada:"Default no plano: Air France (VOO-D), por ser a única com folga real para a sessão de abertura e por ser o seu programa. Trocável em um toque no Inbox.",
    fonte_horizonte:"F-033", horizonte_da_fonte:"2026-10-21",
    proxima_verificacao:"72h antes do embarque e na manhã de 16/10. Se a Air France confirmar cancelamento no dia 17, trocar para LATAM LA-8022 imediatamente; se o aviso for retirado, nada muda." },
  { id:"U-002", descricao:"Quantos investidores vão ao jantar de terça. Isso decide entre Le Duc e Le Baratin.", tipo:"stakeholder",
    pergunta:"Quantas pessoas no jantar de investidores da terça, e quem são?",
    suposicao_adotada:"Assumimos quatro pessoas mais você e reservamos o Le Duc, que comporta mesa maior.",
    fontes:["F-002"] },
  { id:"U-003", descricao:"O jantar de sábado nunca foi respondido pela secretaria.", tipo:"stakeholder",
    pergunta:"Sábado a noite você quer a noite livre depois do voo, ou um jantar de trabalho?",
    suposicao_adotada:"Default no plano: noite livre, com jantar leve no hotel. Trocável no Inbox.",
    fontes:["F-007"] },
  { id:"U-004", descricao:"O endereço da planta da Coopérative du Nord não está no corpus, só a cidade.", tipo:"pesquisavel",
    pergunta:"Qual o endereço exato da planta da Coopérative du Nord em Lille?",
    suposicao_adotada:"Estimamos 30 min de carro de Lille Europe até a planta, proxy de centro para periferia agrícola a 20-30 km. Com o endereço, o trecho é refeito.",
    fonte_horizonte:"F-019", horizonte_da_fonte:"2026-10-19",
    proxima_verificacao:"Pedir o endereço a cooperativa até 14/10. Se a planta estiver a mais de 45 min de Lille Europe, o TGV de volta das 17:22 não fecha e o trecho precisa ser remarcado." },
  { id:"U-005", descricao:"A fila de fronteira em CDG pós-EES varia de 20 a 120 min e não dá para prever o dia 17.", tipo:"pesquisavel",
    pergunta:null,
    suposicao_adotada:"Usamos o cenário conservador de 100 min em todo o plano, e não o otimista de 55. Fast-track comprado como mitigação.",
    fonte_horizonte:"F-020", horizonte_da_fonte:"2026-10-17",
    proxima_verificacao:"Na manhã de 16/10, antes de embarcar. Se o tempo publicado passar de 120 min, avisar o Étienne de que a reunião das 16:00 pode escorregar e combinar que a abertura pode ser perdida." },
  { id:"U-006", descricao:"O calendário exato das noites de obra do RER B em outubro não foi publicado.", tipo:"pesquisavel",
    pergunta:null,
    suposicao_adotada:"Tratamos como se toda noite depois das 22h45 estivesse interrompida e usamos carro em todas as voltas de jantar.",
    fonte_horizonte:"F-035", horizonte_da_fonte:"2026-12-11",
    proxima_verificacao:"Uma semana antes da viagem, no maligneb.fr. Se as noites de 18 e 20/10 estiverem livres, o RER B volta a ser opção de volta e economiza cerca de EUR 140." },
  { id:"U-007", descricao:"Custo de credenciamento do SIAL e de aluguel de sala de reunião no pavilhão não estão em nenhuma fonte.", tipo:"pesquisavel",
    pergunta:"A Aqua já tem credencial de expositor ou visitante para o SIAL, e da para reservar sala no pavilhão?",
    suposicao_adotada:"Fora do orçamento por falta de fonte. A sala privada para o Henrik está no plano como requisito, não como linha de custo.",
    fonte_horizonte:"F-023", horizonte_da_fonte:"2026-10-17",
    proxima_verificacao:"Confirmar com a Camila até 09/10, junto com a reserva da sala." },
  { id:"U-008", descricao:"O horário de funcionamento do SIAL difere entre o corpus e o site oficial.", tipo:"pesquisavel",
    pergunta:null,
    suposicao_adotada:"Seguimos o corpus, conforme a regra do desafio, mas montamos o plano para ficar de pé nas duas leituras: nada crítico antes das 10:00 e nada depois das 17:00 na quarta.",
    fonte_horizonte:"F-024", horizonte_da_fonte:"2026-10-21",
    proxima_verificacao:"Reconfirmar no site do SIAL uma semana antes. Se valer 10:00, o plano não muda; se valer 09:30, sobra meia hora extra na segunda." },
  { id:"U-009", descricao:"Quatro dos cinco restaurantes do corpus estão fechados no domingo no mundo real.", tipo:"pesquisavel",
    pergunta:null,
    suposicao_adotada:"Seguimos a disponibilidade do corpus, que manda nesse campo. Mas marcamos cada reserva de domingo como reconfirmação obrigatória, com alternativa nomeada.",
    fonte_horizonte:"F-025", horizonte_da_fonte:"2026-10-18",
    proxima_verificacao:"Ligar para L'Arpège e Le Duc ao reservar, até 09/10. Se de fato fecharem no domingo, o almoço da Sofia vai para o Clamato (que abre domingo) e o jantar do time para o restaurante do hotel." }
];
