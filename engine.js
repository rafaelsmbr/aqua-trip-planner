/* Motor de planejamento. Funcao pura: escolhas -> plano.
   Roda igual no navegador e no Node. Sem dependencia. */
(function (root) {
  "use strict";
  var A = root.AQUA = root.AQUA || {};

  // ---------- tempo ----------
  function m(hhmm) { var p = String(hhmm).split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hm(min) {
    var d = 0; while (min >= 1440) { min -= 1440; d++; }
    var h = Math.floor(min / 60), x = min % 60;
    return (h < 10 ? "0" : "") + h + ":" + (x < 10 ? "0" : "") + x + (d ? " (+" + d + ")" : "");
  }
  function dur(a, b) { return m(b) - m(a); }
  function fmtDur(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), x = min % 60;
    return h + "h" + (x ? (x < 10 ? "0" : "") + x : "");
  }
  A.util = { m: m, hm: hm, dur: dur, fmtDur: fmtDur };

  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  A.voo = function (id) { return byId(A.catalogo.voos, id); };
  A.hotel = function (id) { return byId(A.catalogo.hoteis, id); };
  A.rest = function (id) { return byId(A.catalogo.restaurantes, id); };
  A.decisao = function (id) { return byId(A.decisoes, id); };
  A.fonte = function (id) { return byId(A.fontes, id); };
  A.evidencia = function (id) { return byId(A.evidencias, id); };

  A.padroes = { voo:"VOO-D", jantar_sabado:"livre", claire:"cafe_curto", almoco_sofia:"arpege", lille:"manter", jantar_terca:"le_duc" };

  var DIAS = [
    { data:"2026-10-16", rotulo:"Sexta",  cidade:"São Paulo", tz:"America/Sao_Paulo", tzLabel:"horário de Brasília" },
    { data:"2026-10-17", rotulo:"Sábado", cidade:"Paris",     tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-18", rotulo:"Domingo",cidade:"Paris",     tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-19", rotulo:"Segunda",cidade:"Paris / Lille", tz:"Europe/Paris",  tzLabel:"horário de Paris" },
    { data:"2026-10-20", rotulo:"Terça",  cidade:"Paris",     tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-21", rotulo:"Quarta", cidade:"Paris",     tz:"Europe/Paris",      tzLabel:"horário de Paris" }
  ];
  A.dias = DIAS;

  // ---------- construtor de itens ----------
  function Plano() { this.itens = []; this.n = 0; this.custos = []; this.alertas = []; }
  Plano.prototype.add = function (o) {
    this.n++;
    o.id = "I-" + ("00" + this.n).slice(-3);
    if (o.componentes) {
      var soma = o.componentes.reduce(function (s, c) { return s + c.minutos; }, 0);
      o._soma_ok = (o.fim && soma === dur(o.inicio, o.fim));
      o._soma = soma;
    }
    this.itens.push(o);
    return o;
  };
  Plano.prototype.gasto = function (cat, rotulo, eur, nota, estimado) {
    this.custos.push({ categoria: cat, rotulo: rotulo, eur: eur, nota: nota || null, estimado: !!estimado });
  };
  Plano.prototype.alerta = function (nivel, titulo, texto, fontes) {
    this.alertas.push({ nivel: nivel, titulo: titulo, texto: texto, fontes: fontes || [] });
  };

  // ============================================================
  //                        PLANEJAR
  // ============================================================
  A.planejar = function (escolhas) {
    var e = {};
    for (var k in A.padroes) e[k] = (escolhas && escolhas[k]) || A.padroes[k];

    var P = new Plano();
    var voo = A.voo(e.voo);
    var hotel = A.hotel("HOT-02");
    var desemb = A.deslocamentos.desembarque_cdg_t2e.cenarios.conservador;

    // ---------------- SEXTA 16/10, Sao Paulo ----------------
    var dSex = "2026-10-16";
    P.add({ dia:dSex, inicio:"09:00", fim:"10:30", titulo:"Comitê de investimentos", tipo:"reuniao",
      local:"Escritório, São Paulo", decisoes:[], fontes:["F-002"], ref_compromisso:"C-01" });
    P.add({ dia:dSex, inicio:"14:00", fim:"15:00", titulo:"Call com fundo LP", tipo:"reuniao", local:"Remoto",
      nota:"Horário de Brasília, não de Paris. A secretaria registrou isso em separado porque o resto do dia vira Paris.",
      decisoes:["D-017"], fontes:["F-002"], ref_compromisso:"C-02" });

    var horaVoo = voo.partida_gru.slice(11, 16);
    var saidaEscritorio = "15:00";
    var chegaGru = "16:00";
    P.add({ dia:dSex, inicio:saidaEscritorio, fim:chegaGru, titulo:"Escritório -> GRU", tipo:"deslocamento",
      local:"São Paulo", de_item:"anterior", para_item:"voo", decisoes:["D-017"], fontes:["F-022"],
      componentes:[{rotulo:"carro, escritório ao aeroporto em sexta a tarde", minutos:60}] });
    var folgaGru = dur(chegaGru, horaVoo);
    P.add({ dia:dSex, inicio:chegaGru, fim:horaVoo, titulo:"GRU: despacho de bagagem, sala e embarque", tipo:"livre",
      local:"GRU Terminal 3", nota:"Ele sempre despacha. " + fmtDur(folgaGru) + " de folga antes da partida.",
      decisoes:["D-017"], fontes:["F-001","F-022"] });
    P.add({ dia:dSex, inicio:horaVoo, fim:"23:59", titulo:voo.companhia + " " + voo.ida.split(" ")[0] + " GRU -> " + voo.chega_em,
      tipo:"voo", local:"GRU -> " + voo.chega_em, ref:voo.id, decisoes:["D-001"], fontes:["F-009"],
      nota:"Voo noturno, como ele prefere na ida para a Europa. Executiva, autorizada pela política acima de 8h. Pousa " +
           voo.chegada.slice(11,16) + " de sábado." });

    // ---------------- SABADO 17/10, Paris ----------------
    var dSab = "2026-10-17";
    var pouso = voo.chegada.slice(11, 16);
    var legSab = [
      { rotulo:"taxiamento, desembarque e caminhada ao controle", minutos:20 },
      { rotulo:"controle de fronteira (EES, fila não-UE)", minutos:50 },
      { rotulo:"esteira de bagagem (parte em paralelo ao controle)", minutos:20 },
      { rotulo:"saída e alfândega", minutos:10 },
      { rotulo:"VTC pré-agendado, CDG -> 82 Avenue des Nations", minutos:20 },
      { rotulo:"credenciamento e caminhada até o Hall 7", minutos:10 }
    ];
    var totSab = legSab.reduce(function (s, c) { return s + c.minutos; }, 0);
    var prontoSab = hm(m(pouso) + totSab);
    var abertura = "13:00";
    var folgaAbertura = dur(prontoSab, abertura);

    P.add({ dia:dSab, inicio:pouso, fim:prontoSab, titulo:"Pouso em CDG -> Hall 7, pronto para a abertura", tipo:"deslocamento",
      local:"CDG Terminal 2E -> Paris Nord Villepinte", de_item:"voo", para_item:"abertura",
      componentes:legSab, decisoes:["D-012","D-001"], fontes:["F-020","F-010","F-032"],
      nota:"A conta começa no instante do pouso, não na porta do aeroporto. A mala segue com o motorista para o hotel: o check-in do Novotel é às 14:00 e não haveria quarto liberado agora." });

    if (folgaAbertura < 0) {
      P.alerta("critico", "Você chega depois do início da abertura",
        "Com " + voo.companhia + " pousando " + pouso + " e o cenário conservador de fronteira, você fica pronto " + prontoSab +
        ", ou seja " + fmtDur(-folgaAbertura) + " depois do início. A sessão e a que você disse que interessa de verdade.", ["F-020","F-033"]);
    } else if (folgaAbertura <= 20) {
      P.alerta("atencao", "Folga de só " + fmtDur(folgaAbertura) + " para a sessão de abertura",
        voo.companhia + " pousa " + pouso + " e, no cenário conservador de fronteira, você fica pronto " + prontoSab +
        ". Qualquer atraso come a margem inteira. Fast-track de imigração e motorista pré-agendado estão no plano justamente por isso.", ["F-020"]);
    }
    if (voo.id === "VOO-D") {
      P.alerta("atencao", "Air France está no aviso de greve de 17 a 21/10",
        "O aviso cobre toda transportadora francesa e vale exatamente nos seus dois dias de voo. Não é garantia de parada, mas se cancelar no dia 17 você perde o sábado inteiro. A LATAM LA-8022 está fora do aviso e é trocável no Inbox.", ["F-033","F-034"]);
    }
    if (!voo.flying_blue) {
      P.alerta("info", "Esta emissão não acumula Flying Blue",
        voo.companhia + " e " + voo.programa + ". Seu perfil registra que você faz questão do programa e já reclamou de emissão fora dele. A política permite, porque a diferença de tarifa passa de 15% e a escolha volta para o viajante.", ["F-001","F-004"]);
    }

    P.add({ dia:dSab, inicio:abertura, fim:"13:45", titulo:"SIAL: sessão de abertura - Food intelligence: redefining the value chain",
      tipo:"sessao", local:"Hall 7, palco principal", decisoes:["D-001","D-012"], fontes:["F-002","F-003"], ref_compromisso:"C-03",
      nota:"A sessão que ele disse que interessa de verdade. Todo o sábado foi montado para trás a partir deste horário." });
    P.add({ dia:dSab, inicio:"13:45", fim:"15:00", titulo:"Almoço na praça de alimentação e primeira volta pelos halls", tipo:"refeicao",
      local:"Paris Nord Villepinte", fontes:["F-003"],
      nota:"Não há restaurante de serviço completo dentro dos halls, só praça de alimentação e café de feira." });
    P.add({ dia:dSab, inicio:"15:00", fim:"15:50", titulo:"Estandes de sourcing de proteína", tipo:"livre",
      local:"Halls 5 e 6", decisoes:["D-020"], fontes:["F-007"], nota:"Foco declarado da edição: sourcing de ingredientes e proteína." });
    P.add({ dia:dSab, inicio:"15:50", fim:"16:00", titulo:"Hall 7 -> Hall 5A", tipo:"deslocamento", local:"Paris Nord Villepinte",
      de_item:"anterior", para_item:"etienne", componentes:[{rotulo:"caminhada entre halls", minutos:10}], fontes:["F-011"] });
    P.add({ dia:dSab, inicio:"16:00", fim:"17:00", titulo:"Étienne Prévost (Groupe Vallonne)", tipo:"reuniao",
      local:"Estande do grupo, Hall 5A", participantes:["Étienne Prévost"], decisoes:[], fontes:["F-002","F-005"], ref_compromisso:"C-04",
      nota:"Ele marcou pelo calendário do Groupe Vallonne e o convite chegou em horário de Paris, então 16:00 aqui é 16:00 local mesmo. Conversa de relacionamento e sourcing, não de decisão: é o primeiro meio período depois do voo." });
    P.alerta("atencao", "A reunião das 16:00 cai no período que ele pediu para não usar",
      "Seu perfil registra duas vezes: nada de decisão no primeiro meio período depois de voo intercontinental. Mantivemos o compromisso porque foi o Étienne quem marcou, o relacionamento é antigo e a pauta é sourcing, não número. O que NÃO entra nesse dia e o Henrik, que quer discutir números - ele ficou na segunda de manhã.", ["F-001","F-006"]);

    P.add({ dia:dSab, inicio:"17:00", fim:"17:40", titulo:"Volta pelos halls de ingredientes", tipo:"livre", local:"Paris Nord Villepinte", fontes:["F-003"] });
    P.add({ dia:dSab, inicio:"17:40", fim:"17:50", titulo:"Pavilhão -> hotel", tipo:"deslocamento", local:"Villepinte",
      de_item:"anterior", para_item:"hotel", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dSab, inicio:"17:50", fim:"18:30", titulo:"Check-in no " + hotel.nome, tipo:"hospedagem", local:hotel.local, ref:hotel.id,
      decisoes:["D-010","D-011"], fontes:["F-030","F-036"], nota:"A mala já está na portaria desde o meio-dia." });

    if (e.jantar_sabado === "livre") {
      P.add({ dia:dSab, inicio:"20:00", fim:"21:00", titulo:"Jantar leve no hotel", tipo:"refeicao", local:hotel.nome, ref:"RES-06",
        decisoes:["D-002"], fontes:["F-031"], nota:"Noite livre depois do voo. Ele dorme mal em voo e pousou hoje." });
      P.gasto("Refeições", "Sábado: jantar no hotel", 55, "1 pessoa");
    } else {
      P.add({ dia:dSab, inicio:"19:15", fim:"19:50", titulo:"Hotel -> Clamato (11e)", tipo:"deslocamento", local:"Villepinte -> Paris 11e",
        de_item:"hotel", para_item:"jantar", componentes:[{rotulo:"carro, 19,7 km, fora de pico", minutos:35}], fontes:["F-016"] });
      P.add({ dia:dSab, inicio:"20:30", fim:"22:15", titulo:"Jantar de trabalho no Clamato", tipo:"refeicao", local:"80 rue de Charonne, 75011",
        ref:"RES-02", participantes:["Contraparte a definir"], decisoes:["D-002"], fontes:["F-031"],
        nota:"Le Duc está indisponível exatamente no sábado 17. Clamato não aceita reserva e é ruidoso: e o que sobrou." });
      P.add({ dia:dSab, inicio:"22:15", fim:"22:55", titulo:"Clamato -> hotel", tipo:"deslocamento", local:"Paris 11e -> Villepinte",
        de_item:"jantar", para_item:"hotel", componentes:[{rotulo:"carro: o RER B interrompe o trecho CDG a partir das 22h45", minutos:40}], fontes:["F-016","F-035"] });
      P.gasto("Refeições", "Sábado: jantar de trabalho no Clamato", 160, "estimado, 2 pessoas", true);
      P.gasto("Deslocamento", "Sábado: ida e volta ao 11e", 145, "VTC", true);
      P.alerta("atencao", "O jantar de sábado contraria duas coisas que ele já disse",
        "Clamato e ruidoso e não aceita reserva, e ele registrou que em lugar barulhento não escuta ninguém e a reunião não rende. Além disso este seria o terceiro jantar de trabalho da semana, e a nota da Camila pediu dois.", ["F-001","F-007","F-031"]);
    }

    // ---------------- DOMINGO 18/10 ----------------
    var dDom = "2026-10-18";
    P.add({ dia:dDom, inicio:"07:30", fim:"08:15", titulo:"Academia do hotel", tipo:"livre", local:hotel.nome,
      decisoes:["D-010"], fontes:["F-037"], nota:"Fitness In Balance, acesso 24h. Academia foi um dos critérios de escolha do hotel." });
    P.add({ dia:dDom, inicio:"09:30", fim:"09:40", titulo:"Hotel -> pavilhão", tipo:"deslocamento", local:"Villepinte",
      de_item:"hotel", para_item:"painel", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dDom, inicio:"10:00", fim:"11:00", titulo:"SIAL: painel de proteínas alternativas", tipo:"sessao", local:"Hall 6",
      decisoes:["D-014"], fontes:["F-003","F-002"], ref_compromisso:"C-06",
      nota:"Escolhido sobre o painel de rastreabilidade das 10:30, que colide com este. O de rastreabilidade ficou com alguém do time de originação." });
    P.add({ dia:dDom, inicio:"11:00", fim:"11:50", titulo:"Estandes de proteína e ingredientes", tipo:"livre", local:"Halls 5 e 6", fontes:["F-003"] });

    var sofiaRest = (e.almoco_sofia === "arpege") ? A.rest("RES-04") : A.rest("RES-06");
    if (e.almoco_sofia === "arpege") {
      P.add({ dia:dDom, inicio:"11:50", fim:"12:35", titulo:"Pavilhão -> L'Arpège (7e)", tipo:"deslocamento", local:"Villepinte -> Paris 7e",
        de_item:"anterior", para_item:"almoco", componentes:[{rotulo:"carro, 26,7 km", minutos:45}], fontes:["F-015"],
        nota:"Transporte público levaria 59 min com duas trocas. Carro e o modal do perfil dele." });
      P.add({ dia:dDom, inicio:"13:00", fim:"15:00", titulo:"Almoço com Sofia Marchetti", tipo:"refeicao", local:"L'Arpège, 84 rue de Varenne, 75007",
        ref:"RES-04", participantes:["Sofia Marchetti"], decisoes:["D-004"], fontes:["F-005","F-031"],
        nota:"Cozinha vegetal. Ela é vegetariana há anos e isso quase deu problema no jantar de Milão em maio. Ambiente silencioso: dá para conversar." });
      P.gasto("Refeições", "Domingo: almoço com a Sofia no L'Arpège", 420, "estimado, 2 pessoas, contraparte externa", true);
      P.add({ dia:dDom, inicio:"15:00", fim:"19:00", titulo:"Tempo livre em Paris", tipo:"livre", local:"Paris 7e",
        nota:"Ele já está no centro e o jantar do time e às 19:30 no 14e. Primeira janela livre da viagem." });
      P.add({ dia:dDom, inicio:"19:00", fim:"19:20", titulo:"7e -> Le Duc (14e)", tipo:"deslocamento", local:"Paris 7e -> Paris 14e",
        de_item:"almoco", para_item:"jantar", componentes:[{rotulo:"carro, travessia interna de Paris", minutos:20}], fontes:["F-014"] });
    } else {
      P.add({ dia:dDom, inicio:"11:50", fim:"12:00", titulo:"Pavilhão -> hotel", tipo:"deslocamento", local:"Villepinte",
        de_item:"anterior", para_item:"almoco", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
      P.add({ dia:dDom, inicio:"13:00", fim:"14:30", titulo:"Almoço com Sofia Marchetti", tipo:"refeicao", local:hotel.nome,
        ref:"RES-06", participantes:["Sofia Marchetti"], decisoes:["D-004"], fontes:["F-005","F-031"],
        nota:"Perto da feira para não gastar 1h30 de carro. Cardápio curto de hotel: confirmar opção vegetariana na véspera." });
      P.gasto("Refeições", "Domingo: almoço com a Sofia no hotel", 120, "estimado, 2 pessoas", true);
      P.alerta("atencao", "Almoço de hotel para uma convidada vegetariana",
        "O restaurante do Novotel tem cardápio curto e não é cozinha vegetal. A Sofia e vegetariana há anos e a Camila registrou que no jantar de Milão quase deu problema. Se ficar aqui, confirmar o prato dela com o hotel antes.", ["F-005","F-031"]);
      P.add({ dia:dDom, inicio:"14:30", fim:"18:45", titulo:"Circulação no pavilhão", tipo:"livre", local:"Paris Nord Villepinte", fontes:["F-003"] });
      P.add({ dia:dDom, inicio:"18:45", fim:"19:30", titulo:"Pavilhão -> Le Duc (14e)", tipo:"deslocamento", local:"Villepinte -> Paris 14e",
        de_item:"almoco", para_item:"jantar", componentes:[{rotulo:"carro, 28,9 km, pico do fim de tarde", minutos:45}], fontes:["F-014"] });
    }

    P.add({ dia:dDom, inicio:"19:30", fim:"22:00", titulo:"Jantar com o time de originação da Aqua Europa", tipo:"refeicao",
      local:"Le Duc, 243 boulevard Raspail, 75014", ref:"RES-01",
      participantes:["Camila Reis","Pierre Lambert","Ana Sousa","Diego Fontana"], decisoes:["D-015"], fontes:["F-002","F-031"], ref_compromisso:"C-08",
      nota:"Primeiro dos dois jantares de trabalho que ele pediu. Peixe e ambiente reservado: cinco pessoas na mesa e ele precisa ouvir." });
    P.add({ dia:dDom, inicio:"22:00", fim:"22:45", titulo:"Le Duc -> hotel", tipo:"deslocamento", local:"Paris 14e -> Villepinte",
      de_item:"jantar", para_item:"hotel", componentes:[{rotulo:"carro: a partir das 22h45 o RER B interrompe o trecho CDG", minutos:45}], fontes:["F-014","F-035"] });
    P.gasto("Refeições", "Domingo: jantar do time no Le Duc", 550, "estimado, 5 pessoas", true);

    // ---------------- SEGUNDA 19/10 ----------------
    var dSeg = "2026-10-19";
    P.add({ dia:dSeg, inicio:"07:30", fim:"08:15", titulo:"Academia do hotel", tipo:"livre", local:hotel.nome, fontes:["F-037"] });
    P.add({ dia:dSeg, inicio:"09:30", fim:"09:40", titulo:"Hotel -> pavilhão", tipo:"deslocamento", local:"Villepinte",
      de_item:"hotel", para_item:"henrik", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dSeg, inicio:"10:00", fim:"10:40", titulo:"Henrik Sørensen (Nordvest Foods) - números da transação", tipo:"reuniao",
      local:"Sala de reunião reservada, Paris Nord Villepinte", participantes:["Henrik Sørensen"], decisoes:["D-013"], fontes:["F-006","F-005"],
      nota:"Os 40 min que ele pediu, de manhã, como ele preferia. Sala fechada e não estande: a Claire Dubois, concorrente direta neste deal, está no evento a semana toda. Marcado 10:00 e não 09:30 porque pelo horário real a feira abre às 10:00." });

    if (e.lille === "manter") {
      P.add({ dia:dSeg, inicio:"10:40", fim:"11:50", titulo:"Rodada de reuniões no pavilhão", tipo:"reuniao", local:"Paris Nord Villepinte",
        fontes:["F-002"], ref_compromisso:"C-09", nota:"Janela encurtada pela ida a Lille. A agenda ainda estava em montagem." });
      P.add({ dia:dSeg, inicio:"11:50", fim:"12:27", titulo:"Pavilhão -> Gare du Nord", tipo:"deslocamento", local:"Villepinte -> Paris 10e",
        de_item:"anterior", para_item:"tgv", decisoes:["D-018"], fontes:["F-017","F-012"],
        componentes:[
          {rotulo:"caminhada halls -> estação Parc des Expositions (61 m)", minutos:6},
          {rotulo:"espera de plataforma (RER B a cada 15 min)", minutos:5},
          {rotulo:"RER B, 9 paradas", minutos:26}
        ],
        nota:"Única exceção ao carro em toda a viagem: a estação fica a 61 m da entrada e o carro no meio do dia é pior." });
      P.add({ dia:dSeg, inicio:"12:27", fim:"13:04", titulo:"Gare du Nord: almoço rápido e embarque", tipo:"refeicao", local:"Paris Gare du Nord",
        fontes:["F-018"], nota:"37 min de folga antes do TGV." });
      P.add({ dia:dSeg, inicio:"13:04", fim:"14:06", titulo:"TGV Paris Gare du Nord -> Lille Europe", tipo:"deslocamento",
        local:"Paris -> Lille", de_item:"tgv", para_item:"planta", decisoes:["D-019"], fontes:["F-018"],
        componentes:[{rotulo:"TGV, 202 km, 2a classe conforme política para trecho até 3h", minutos:62}] });
      P.add({ dia:dSeg, inicio:"14:06", fim:"14:36", titulo:"Lille Europe -> planta da Coopérative du Nord", tipo:"deslocamento",
        local:"Lille", de_item:"planta", para_item:"visita", fontes:["F-019"],
        componentes:[{rotulo:"carro (ESTIMADO: o corpus não traz o endereço da planta)", minutos:30}],
        nota:"Trecho estimado. Ver incerteza U-004: com o endereço real, este tempo muda." });
      P.add({ dia:dSeg, inicio:"15:00", fim:"16:30", titulo:"Visita à planta da Coopérative du Nord", tipo:"reuniao", local:"Lille",
        decisoes:["D-005"], fontes:["F-002"], ref_compromisso:"C-10" });
      P.add({ dia:dSeg, inicio:"16:30", fim:"17:00", titulo:"Planta -> Lille Europe", tipo:"deslocamento", local:"Lille",
        de_item:"visita", para_item:"tgv_volta", fontes:["F-019"], componentes:[{rotulo:"carro (estimado)", minutos:30}] });
      P.add({ dia:dSeg, inicio:"17:22", fim:"18:24", titulo:"TGV Lille Europe -> Paris Gare du Nord", tipo:"deslocamento",
        local:"Lille -> Paris", de_item:"tgv_volta", para_item:"hotel", decisoes:["D-019"], fontes:["F-018"],
        componentes:[{rotulo:"TGV, 2a classe", minutos:62}] });
      P.add({ dia:dSeg, inicio:"18:24", fim:"19:09", titulo:"Gare du Nord -> hotel", tipo:"deslocamento", local:"Paris 10e -> Villepinte",
        de_item:"hotel", para_item:"hotel", decisoes:["D-018"], fontes:["F-017"],
        componentes:[{rotulo:"carro, pico do fim de tarde", minutos:45}] });
      P.add({ dia:dSeg, inicio:"20:00", fim:"21:00", titulo:"Jantar leve no hotel", tipo:"refeicao", local:hotel.nome, ref:"RES-06",
        fontes:["F-031"], nota:"A agenda marcava 20:00 livre. Dia de 11h de porta a porta: noite sem compromisso." });
      P.gasto("Deslocamento", "Segunda: TGV Paris-Lille ida e volta", 120, "2a classe, estimado", true);
      P.gasto("Deslocamento", "Segunda: táxi em Lille, ida e volta a planta", 90, "estimado", true);
      P.gasto("Refeições", "Segunda: almoço na estação e jantar no hotel", 80, "1 pessoa", true);
      P.alerta("info", "A segunda tem 11h de porta a porta para 1h30 de visita",
        "Sair às 09:30 do hotel é voltar às 19:09, sendo 3h54 só de deslocamento ida e volta a Lille. Se a visita for cortesia e não o ponto da viagem, converter em call devolve 4h30 de feira no dia em que o Henrik também está.", ["F-018","F-002"]);
    } else {
      P.add({ dia:dSeg, inicio:"10:40", fim:"12:30", titulo:"Rodada de reuniões no pavilhão", tipo:"reuniao", local:"Paris Nord Villepinte",
        fontes:["F-002"], ref_compromisso:"C-09", nota:"Janela completa: a ida a Lille virou call." });
      P.add({ dia:dSeg, inicio:"12:30", fim:"13:30", titulo:"Almoço na praça de alimentação", tipo:"refeicao", local:"Paris Nord Villepinte", fontes:["F-003"] });
      P.add({ dia:dSeg, inicio:"14:00", fim:"15:00", titulo:"SIAL: Investimento em agrifood na América Latina", tipo:"sessao", local:"Hall 7",
        fontes:["F-003"], nota:"Sessão que estava no recorte da equipe e não caberia com a ida a Lille." });
      P.add({ dia:dSeg, inicio:"15:00", fim:"16:00", titulo:"Call com a Coopérative du Nord", tipo:"reuniao", local:"Sala reservada no pavilhão",
        decisoes:["D-005"], fontes:["F-002"], ref_compromisso:"C-10", nota:"A visita à planta convertida em vídeo, no horário que já estava reservado." });
      P.add({ dia:dSeg, inicio:"16:00", fim:"18:00", titulo:"Estandes de sourcing e conversas abertas", tipo:"livre", local:"Paris Nord Villepinte",
        fontes:["F-007"], nota:"As 4h30 que a ida a Lille consumiria, devolvidas ao foco da edição." });
      P.add({ dia:dSeg, inicio:"18:00", fim:"18:10", titulo:"Pavilhão -> hotel", tipo:"deslocamento", local:"Villepinte",
        de_item:"anterior", para_item:"hotel", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
      P.add({ dia:dSeg, inicio:"20:00", fim:"21:00", titulo:"Jantar leve no hotel", tipo:"refeicao", local:hotel.nome, ref:"RES-06", fontes:["F-031"] });
      P.gasto("Refeições", "Segunda: almoço na feira e jantar no hotel", 90, "1 pessoa", true);
      P.alerta("info", "Visita à planta convertida em call",
        "Você ganhou 4h30 de feira na segunda, mas a cooperativa foi vista por vídeo. Avisar a contraparte com antecedência: o compromisso presencial já estava aceito.", ["F-002"]);
    }

    // ---------------- TERCA 20/10 ----------------
    var dTer = "2026-10-20";
    P.add({ dia:dTer, inicio:"07:30", fim:"08:15", titulo:"Academia do hotel", tipo:"livre", local:hotel.nome, fontes:["F-037"] });
    P.add({ dia:dTer, inicio:"09:40", fim:"09:50", titulo:"Hotel -> pavilhão", tipo:"deslocamento", local:"Villepinte",
      de_item:"hotel", para_item:"ortega", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dTer, inicio:"10:00", fim:"10:45", titulo:"Rafael Ortega (Grupo Ibérica Fresh)", tipo:"reuniao", local:"Paris Nord Villepinte",
      participantes:["Rafael Ortega"], decisoes:["D-020"], fontes:["F-005"],
      nota:"Terça é o único dia dele no evento. Fornecedor de duas investidas, e fala espanhol, que o Sebastian fala." });
    P.add({ dia:dTer, inicio:"11:00", fim:"11:40", titulo:"Café com Tomás Beltrán", tipo:"reuniao", local:"Paris Nord Villepinte",
      participantes:["Tomás Beltrán"], decisoes:["D-020"], fontes:["F-005"], nota:"Sem agenda fixa, conhece todo mundo. Vale o café." });
    P.add({ dia:dTer, inicio:"12:00", fim:"13:00", titulo:"Almoço na praça de alimentação", tipo:"refeicao", local:"Paris Nord Villepinte", fontes:["F-003"] });
    P.add({ dia:dTer, inicio:"13:45", fim:"14:00", titulo:"-> Hall 5A", tipo:"deslocamento", local:"Paris Nord Villepinte",
      de_item:"anterior", para_item:"sessao", componentes:[{rotulo:"caminhada entre halls", minutos:15}], fontes:["F-011"] });
    P.add({ dia:dTer, inicio:"14:00", fim:"15:00", titulo:"SIAL: Private label - o que mudou no varejo europeu", tipo:"sessao", local:"Hall 5A",
      decisoes:["D-020"], fontes:["F-003"], nota:"Casa com sourcing, o outro foco declarado da edição." });

    if (e.claire === "cafe_curto") {
      P.add({ dia:dTer, inicio:"15:30", fim:"16:00", titulo:"Café com Claire Dubois (Fonds Meridien)", tipo:"reuniao",
        local:"Área de café neutra, Paris Nord Villepinte", participantes:["Claire Dubois"], decisoes:["D-003"], fontes:["F-005"],
        nota:"Relacionamento com fundos europeus, sem pauta. Nordvest fora da conversa: ela é concorrente direta nesse deal e você falou com o Henrik ontem. Local público e neutro, longe do estande da Nordvest." });
      P.alerta("atencao", "Claire e Henrik estão nos dois lados do mesmo deal",
        "Você vê o Henrik (Nordvest) segunda 10:00 e a Claire (concorrente direta no deal da Nordvest) terça 15:30. Dias diferentes e Henrik primeiro, de propósito. A disciplina na conversa com ela é a única proteção que o plano não consegue dar sozinho.", ["F-005","F-006"]);
    } else {
      P.add({ dia:dTer, inicio:"15:30", fim:"16:00", titulo:"Circulação livre", tipo:"livre", local:"Paris Nord Villepinte",
        decisoes:["D-003"], nota:"Janela que seria o café com a Claire, liberada." });
    }
    P.add({ dia:dTer, inicio:"16:00", fim:"17:30", titulo:"Estandes e conversas abertas", tipo:"livre", local:"Paris Nord Villepinte", fontes:["F-003"] });

    var jT = (e.jantar_terca === "le_duc") ? A.rest("RES-01") : A.rest("RES-05");
    var jTmin = (e.jantar_terca === "le_duc") ? 55 : 50;
    var jTkm  = (e.jantar_terca === "le_duc") ? "28,9 km ao 14e" : "ao 20e";
    P.add({ dia:dTer, inicio:"17:50", fim:hm(m("17:50") + jTmin), titulo:"Pavilhão -> " + jT.nome, tipo:"deslocamento",
      local:"Villepinte -> " + jT.endereco, de_item:"anterior", para_item:"jantar", fontes:["F-014"],
      componentes:[{rotulo:"carro, " + jTkm + ", pico do fim de tarde", minutos:jTmin}] });
    P.add({ dia:dTer, inicio:"19:00", fim:"21:30", titulo:"Jantar com investidores", tipo:"refeicao", local:jT.nome + ", " + jT.endereco,
      ref:jT.id, participantes:["Investidores (contraparte externa)"], decisoes:["D-006"], fontes:["F-002","F-031"], ref_compromisso:"C-12",
      nota:"Segundo dos dois jantares de trabalho que ele pediu, com contraparte externa. " +
           (e.jantar_terca === "le_duc" ? "Peixe e ambiente reservado, e comporta mesa maior se forem mais de quatro." : "Casa pequena e silenciosa. Se a mesa passar de quatro, não cabe.") });
    P.add({ dia:dTer, inicio:"21:30", fim:hm(m("21:30") + jTmin - 5), titulo:jT.nome + " -> hotel", tipo:"deslocamento",
      local:jT.endereco + " -> Villepinte", de_item:"jantar", para_item:"hotel", fontes:["F-014","F-035"],
      componentes:[{rotulo:"carro: o RER B interrompe o trecho CDG a partir das 22h45", minutos:jTmin - 5}] });
    P.gasto("Refeições", "Terça: almoço na feira", 35, "1 pessoa", true);
    P.gasto("Refeições", "Terça: jantar com investidores no " + jT.nome, (e.jantar_terca === "le_duc" ? 440 : 260), "estimado, 5 pessoas, contraparte externa", true);
    if (e.jantar_terca === "le_baratin") {
      P.alerta("info", "Le Baratin e casa pequena e ninguém registrou quantos investidores são",
        "A agenda diz apenas 'jantar com investidores, a confirmar'. Se a mesa passar de quatro, Le Baratin não acomoda e não tem peixe como base. Le Duc comporta e atende a preferência dele.", ["F-002","F-031"]);
    }

    // ---------------- QUARTA 21/10 ----------------
    var dQua = "2026-10-21";
    P.add({ dia:dQua, inicio:"07:30", fim:"08:15", titulo:"Academia do hotel", tipo:"livre", local:hotel.nome, fontes:["F-037"] });
    P.add({ dia:dQua, inicio:"09:30", fim:"10:00", titulo:"Late check-out solicitado e mala na portaria", tipo:"hospedagem", local:hotel.nome,
      decisoes:["D-016"], fontes:["F-036"],
      nota:"O check-out padrão e meio-dia e a sessão de encerramento é 11:00-12:00: não dá para estar nos dois. Late check-out pedido na reserva; se negarem, a mala fica na portaria." });
    P.add({ dia:dQua, inicio:"10:30", fim:"10:40", titulo:"Hotel -> pavilhão", tipo:"deslocamento", local:"Villepinte",
      de_item:"hotel", para_item:"encerramento", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dQua, inicio:"11:00", fim:"12:00", titulo:"SIAL: encerramento", tipo:"sessao", local:"Paris Nord Villepinte",
      fontes:["F-002","F-003"], ref_compromisso:"C-13" });
    P.add({ dia:dQua, inicio:"12:00", fim:"13:00", titulo:"Almoço e últimas conversas", tipo:"refeicao", local:"Paris Nord Villepinte", fontes:["F-003"] });
    P.add({ dia:dQua, inicio:"13:00", fim:"13:10", titulo:"Pavilhão -> hotel", tipo:"deslocamento", local:"Villepinte",
      de_item:"anterior", para_item:"hotel", componentes:[{rotulo:"carro, 1,6 km", minutos:10}], fontes:["F-013"] });
    P.add({ dia:dQua, inicio:"13:10", fim:"15:30", titulo:"Hotel: trabalho e reorganizar a mala", tipo:"livre", local:hotel.nome,
      decisoes:["D-016"], nota:"Janela de folga deliberada antes do aeroporto." });

    var voltaH = voo.partida_volta.slice(11, 16);
    var noBalcao = hm(m(voltaH) - 175);
    var saiHotel = hm(m(noBalcao) - 25);
    P.add({ dia:dQua, inicio:saiHotel, fim:noBalcao, titulo:"Hotel -> CDG Terminal 2E", tipo:"deslocamento",
      local:"Villepinte -> CDG", de_item:"hotel", para_item:"voo_volta", decisoes:["D-016"], fontes:["F-010"],
      componentes:[{rotulo:"carro, 12,3 km", minutos:25}] });
    P.add({ dia:dQua, inicio:noBalcao, fim:voltaH, titulo:"CDG: check-in, bagagem, fronteira de saída e sala", tipo:"livre",
      local:"CDG Terminal 2E", decisoes:["D-016"], fontes:["F-021"],
      nota:"2h55 de antecedência. O EES também roda na saída, e não só na entrada." });
    P.add({ dia:dQua, inicio:voltaH, fim:"23:59", titulo:voo.companhia + " " + voo.chega_em + " -> GRU", tipo:"voo",
      local:voo.chega_em + " -> GRU", ref:voo.id, decisoes:["D-001"], fontes:["F-009"], ref_compromisso:"C-14", nota:voo.volta });

    if (voo.id === "VOO-D") {
      P.alerta("atencao", "A volta de quarta também cai no aviso de greve",
        "O aviso de 17 a 21/10 cobre o dia 21, que é o dia da sua volta. Vale ter o LA-8023 das 18:55 mapeado como alternativa: mesmo horário, mesmo aeroporto.", ["F-033"]);
    }

    // ---------------- custos fixos ----------------
    P.gasto("Voo", voo.companhia + " GRU-" + voo.chega_em + "-GRU, executiva", voo.preco_eur,
      voo.flying_blue ? "Acumula Flying Blue" : "Não acumula Flying Blue");
    P.gasto("Hospedagem", hotel.nome + ", 4 noites x EUR 205", 4 * hotel.diaria_eur, "Teto da política: EUR 320/noite");
    P.gasto("Deslocamento", "Sábado: VTC CDG -> pavilhão + mala ao hotel", 60, "pré-agendado, com meet and greet", true);
    P.gasto("Deslocamento", "Fast-track de imigração em CDG", 45, "mitigação da fila EES", true);
    P.gasto("Deslocamento", "Hotel <-> pavilhão, a semana", 90, "8 trechos de carro, 1,6 km", true);
    P.gasto("Deslocamento", "Domingo: pavilhão -> Paris -> hotel", 160, "VTC", true);
    P.gasto("Deslocamento", "Terça: pavilhão -> Paris -> hotel", 150, "VTC", true);
    P.gasto("Deslocamento", "Quarta: hotel -> CDG", 50, "VTC", true);
    P.gasto("Refeições", "Sábado: almoço na praça de alimentação", 35, "1 pessoa", true);

    // ============================================================
    //                        GUARDAS
    // ============================================================
    var G = [];
    function guarda(id, titulo, ok, detalhe, fontes) { G.push({ id:id, titulo:titulo, ok:ok, detalhe:detalhe, fontes:fontes||[] }); }

    guarda("G-01", "Chega ao Hall 7 antes das 13:00 de sábado", folgaAbertura >= 0,
      folgaAbertura >= 0 ? "Pronto " + prontoSab + ", com " + fmtDur(folgaAbertura) + " de folga."
                         : "Pronto " + prontoSab + ", ou seja " + fmtDur(-folgaAbertura) + " depois do início.", ["F-020"]);

    var decisaoNoPrimeiroMeioPeriodo = P.itens.filter(function (i) {
      return i.dia === dSab && i.tipo === "reuniao" && /Henrik|numeros|transacao/i.test(i.titulo);
    });
    guarda("G-02", "Nenhuma reunião de números no primeiro meio período depois do pouso", decisaoNoPrimeiroMeioPeriodo.length === 0,
      decisaoNoPrimeiroMeioPeriodo.length === 0
        ? "O Henrik, que é a conversa de números, está na segunda de manhã. Sábado tem só o Étienne, que é relacionamento."
        : "Há reunião de números no sábado: " + decisaoNoPrimeiroMeioPeriodo.map(function(i){return i.titulo;}).join(", "), ["F-001"]);

    guarda("G-03", "Diária do hotel dentro do teto da política", hotel.diaria_eur <= A.politica.hotel_teto_eur,
      "EUR " + hotel.diaria_eur + " contra teto de EUR " + A.politica.hotel_teto_eur + ".", ["F-004"]);

    var iH = P.itens.filter(function (i) { return /Henrik/.test(i.titulo); })[0];
    var iC = P.itens.filter(function (i) { return /Claire/.test(i.titulo); })[0];
    var sep = !iC || (iH && iH.dia < iC.dia);
    guarda("G-04", "Henrik e Claire em dias diferentes, Henrik primeiro", sep,
      !iC ? "A Claire não está no plano nesta rodada." :
      sep ? "Henrik na segunda, Claire na terça. Nenhum cruzamento de agenda." : "Os dois caem no mesmo dia ou a Claire vem primeiro.", ["F-005"]);

    var okVeg = (e.almoco_sofia === "arpege");
    guarda("G-05", "Almoço com a Sofia em casa que serve bem uma vegetariana", okVeg,
      okVeg ? "L'Arpège e cozinha vegetal." : "Restaurante de hotel, cardápio curto: exige confirmar o prato dela antes.", ["F-005"]);

    var cordeiro = P.itens.filter(function (i) { return i.ref && (A.rest(i.ref) || {}).cordeiro_base; });
    guarda("G-06", "Nenhuma refeição dele em casa com cordeiro na base do cardápio", cordeiro.length === 0,
      cordeiro.length === 0 ? "Paul Bert ficou fora por isso." : "Há refeição em casa de cordeiro.", ["F-001"]);

    var ruid = P.itens.filter(function (i) { return i.ref && (A.rest(i.ref) || {}).ruidoso && i.tipo === "refeicao" && (i.participantes || []).length; });
    guarda("G-07", "Nenhum jantar de trabalho em lugar barulhento", ruid.length === 0,
      ruid.length === 0 ? "Todos os jantares de trabalho em ambiente reservado." : "Jantar de trabalho em lugar ruidoso: " + ruid.map(function(i){return i.titulo;}).join(", "), ["F-001"]);

    var jantaresTrabalho = P.itens.filter(function (i) { return i.tipo === "refeicao" && (i.participantes || []).length && m(i.inicio) >= m("18:00"); });
    guarda("G-08", "Exatamente dois jantares de trabalho na semana", jantaresTrabalho.length === 2,
      jantaresTrabalho.length + " jantar(es) de trabalho: " + jantaresTrabalho.map(function(i){return i.dia.slice(8)+"/10";}).join(", ") +
      ". A nota da Camila pediu dois: um com o time e um com contraparte externa.", ["F-007"]);

    var indisp = P.itens.filter(function (i) {
      var r = i.ref && A.rest(i.ref); return r && (r.indisponivel_corpus || []).indexOf(i.dia) >= 0;
    });
    guarda("G-09", "Nenhum restaurante usado em data que o corpus marca indisponível", indisp.length === 0,
      indisp.length === 0 ? "Checado contra indisponível_corpus de cada casa." : "Conflito: " + indisp.map(function(i){return i.titulo;}).join(", "), ["F-008"]);

    var over = [];
    DIAS.forEach(function (d) {
      var lista = P.itens.filter(function (i) { return i.dia === d.data && i.fim && i.tipo !== "voo"; })
                         .sort(function (a, b) { return m(a.inicio) - m(b.inicio); });
      for (var i = 1; i < lista.length; i++) {
        if (m(lista[i].inicio) >= m(lista[i-1].fim)) continue;
        // G-01 ja mede a chegada do voo com precisao; nao repetir o mesmo alarme aqui
        if (/^Pouso em CDG/.test(lista[i-1].titulo)) continue;
        over.push(d.rotulo + ": " + lista[i-1].titulo + " x " + lista[i].titulo);
      }
    });
    guarda("G-10", "Nenhum item do roteiro se sobrepõe a outro", over.length === 0,
      over.length === 0 ? "Checado dia a dia." : over.join(" | "));

    var fixos = A.compromissos.filter(function (c) { return c.firmeza === "fixo"; });
    var faltando = fixos.filter(function (c) { return !P.itens.some(function (i) { return i.ref_compromisso === c.id; }); });
    guarda("G-11", "Todo compromisso firme da agenda está no plano", faltando.length === 0,
      faltando.length === 0 ? fixos.length + " compromissos firmes, todos presentes." :
      "Fora do plano: " + faltando.map(function(c){return c.titulo;}).join("; "), ["F-002"]);

    var noiteRer = P.itens.filter(function (i) {
      return i.tipo === "deslocamento" && m(i.inicio) >= m("22:00") && (i.componentes||[]).some(function(c){ return /RER/i.test(c.rotulo) && !/interrompe/i.test(c.rotulo); });
    });
    guarda("G-12", "Nenhuma volta noturna depende do RER B depois das 22h45", noiteRer.length === 0,
      noiteRer.length === 0 ? "Todas as voltas de jantar são de carro, por causa da obra que vai até 11/12." : "Há volta noturna por RER B.", ["F-035"]);

    var ant = dur(noBalcao, voltaH);
    guarda("G-13", "Chega a CDG com antecedência suficiente na quarta", ant >= 170,
      "No balcão as " + noBalcao + " para voo " + voltaH + ": " + fmtDur(ant) + " de antecedência.", ["F-021"]);

    var tgv = P.itens.filter(function (i) { return /TGV/.test(i.titulo); });
    guarda("G-14", "TGV em 2a classe, como manda a política para trecho até 3h", tgv.every(function (i) {
      return (i.componentes || []).some(function (c) { return /2a classe/.test(c.rotulo); });
    }) , tgv.length ? tgv.length + " trecho(s) de TGV, 62 min cada, todos em 2a classe." : "Sem TGV nesta rodada.", ["F-004"]);

    var cedo = P.itens.filter(function (i) {
      return i.dia >= dSab && /SIAL|pavilhao|Hall/i.test(i.local || "") && (i.tipo === "sessao" || i.tipo === "reuniao") && m(i.inicio) < m("10:00");
    });
    guarda("G-15", "Nada crítico no pavilhão antes das 10:00", cedo.length === 0,
      cedo.length === 0 ? "O corpus diz que a feira abre 09:30 e o site oficial diz 10:00. O plano fica de pé nos dois."
                        : "Antes das 10:00: " + cedo.map(function(i){return i.titulo;}).join("; "), ["F-003","F-024"]);

    var somaRuim = P.itens.filter(function (i) { return i.componentes && i._soma_ok === false; });
    guarda("G-16", "Todo trecho declara componentes que somam a janela exata", somaRuim.length === 0,
      somaRuim.length === 0 ? "Checado em todos os deslocamentos." :
      somaRuim.map(function(i){return i.titulo+" (soma "+i._soma+", janela "+dur(i.inicio,i.fim)+")";}).join(" | "));

    // ---------------- agregacao ----------------
    var cats = {};
    P.custos.forEach(function (c) { (cats[c.categoria] = cats[c.categoria] || []).push(c); });
    var categorias = Object.keys(cats).map(function (nome) {
      return { nome: nome, total: cats[nome].reduce(function (s, c) { return s + c.eur; }, 0), itens: cats[nome] };
    }).sort(function (a, b) { return b.total - a.total; });
    var total = categorias.reduce(function (s, c) { return s + c.total; }, 0);

    var dias = DIAS.map(function (d) {
      var itens = P.itens.filter(function (i) { return i.dia === d.data; }).sort(function (a, b) { return m(a.inicio) - m(b.inicio); });
      var desl = itens.filter(function (i) { return i.tipo === "deslocamento"; })
                      .reduce(function (s, i) { return s + (i.fim ? dur(i.inicio, i.fim) : 0); }, 0);
      return Object.assign({}, d, {
        itens: itens,
        min_deslocamento: desl,
        n_compromissos: itens.filter(function (i) { return i.tipo === "reuniao" || i.tipo === "sessao"; }).length
      });
    });

    var pendentes = A.decisoes.filter(function (d) {
      return d.modo === "aberta" && !(escolhas && escolhas[d.chave]);
    });

    return {
      escolhas: e,
      respondidas: A.decisoes.filter(function (d) { return d.modo === "aberta" && escolhas && escolhas[d.chave]; }).map(function (d) { return d.id; }),
      pendentes: pendentes,
      itens: P.itens,
      dias: dias,
      custos: { total: total, categorias: categorias, linhas: P.custos },
      alertas: P.alertas,
      guardas: G,
      guardas_ok: G.filter(function (g) { return g.ok; }).length,
      voo: voo, hotel: hotel,
      folga_abertura_min: folgaAbertura,
      pronto_sabado: prontoSab
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
