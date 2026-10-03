/* Motor de planejamento. Função pura: (escolhas, fato) -> plano.
   A agenda vem dos dados (compromissos do corpus + agendados pelo plano). O motor sabe
   montar o que liga um compromisso ao outro: trajetos, almoço, tempo livre. Um fato novo
   é um remendo nos dados, aplicado numa cópia. Roda igual no navegador e no Node. */
(function (root) {
  "use strict";
  var A = root.AQUA = root.AQUA || {};

  // ---------- tempo ----------
  function m(hhmm) { var p = String(hhmm).split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hm(min) {
    if (min < 0) min = 0;
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

  function byId(arr, id) { for (var i = 0; i < (arr || []).length; i++) if (arr[i].id === id) return arr[i]; return null; }
  A.voo = function (id) { return byId(A.catalogo.voos, id); };
  A.hotel = function (id) { return byId(A.catalogo.hoteis, id); };
  A.rest = function (id) { return byId(A.catalogo.restaurantes, id); };
  A.decisao = function (id) { return byId(A.decisoes, id); };
  A.fonte = function (id) { return byId(A.fontes, id); };
  A.evidencia = function (id) { return byId(A.evidencias, id); };
  A.compromisso = function (id) { return byId(A.compromissos, id); };
  A.agendado = function (id) { return byId(A.agendados, id); };

  A.padroes = { voo:"VOO-D", jantar_sabado:"livre", claire:"cafe_curto", almoco_sofia:"arpege", lille:"manter", jantar_terca:"le_duc" };

  var DIAS = [
    { data:"2026-10-16", rotulo:"Sexta",   cidade:"São Paulo",     tz:"America/Sao_Paulo", tzLabel:"horário de Brasília" },
    { data:"2026-10-17", rotulo:"Sábado",  cidade:"Paris",         tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-18", rotulo:"Domingo", cidade:"Paris",         tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-19", rotulo:"Segunda", cidade:"Paris / Lille", tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-20", rotulo:"Terça",   cidade:"Paris",         tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-21", rotulo:"Quarta",  cidade:"Paris",         tz:"Europe/Paris",      tzLabel:"horário de Paris" },
    { data:"2026-10-22", rotulo:"Quinta",  cidade:"São Paulo",     tz:"America/Sao_Paulo", tzLabel:"horário de Brasília" }
  ];
  A.dias = DIAS;

  // ---------- lugares ----------
  var Q = {
    pav: "Paris Nord Villepinte, 82 Avenue des Nations, 93420 Villepinte",
    cdg: "Aéroport Paris-Charles de Gaulle, Terminal 2E",
    gru: "Aeroporto Internacional de Guarulhos, Terminal 3",
    gdn: "Gare du Nord, Paris",
    lille: "Gare Lille Europe"
  };
  A.lugares = Q;

  // Onde um compromisso acontece, inferido do texto do local. Só pavilhão e remoto o motor
  // sabe ligar sozinho; o resto vira alerta e trava, em vez de um trajeto inventado.
  function zonaDe(local) {
    var s = String(local || "");
    if (/novotel|hotel/i.test(s)) return "hotel";
    if (/hall|sial|pavilh|parc des expositions|paris nord villepinte/i.test(s)) return "pavilhao";
    if (/remoto|online|v[ií]deo|\bcall\b/i.test(s)) return "remoto";
    return "fora";
  }
  A.zonaDe = zonaDe;

  // Tempos de carro entre os lugares do plano (fontes em corpus/deslocamentos.json).
  // Chave: "pav", "hotel" ou id de restaurante.
  var CARRO = {
    "pav|hotel": [10, "carro, 1,6 km", "F-013"],
    "pav|RES-01": [55, "carro, 28,9 km ao 14e, pico do fim de tarde", "F-014"],
    "pav|RES-02": [35, "carro, 19,7 km ao 11e", "F-016"],
    "pav|RES-04": [45, "carro, 26,7 km ao 7e", "F-015"],
    "pav|RES-05": [50, "carro, ao 20e, pico do fim de tarde", "F-014"],
    "pav|RES-07": [20, "carro, Villepinte a Roissy", "F-010"],
    "hotel|RES-01": [55, "carro, ao 14e", "F-014"],
    "hotel|RES-02": [35, "carro, 19,7 km ao 11e, fora de pico", "F-016"],
    "hotel|RES-04": [45, "carro, ao 7e", "F-015"],
    "hotel|RES-05": [50, "carro, ao 20e", "F-014"],
    "hotel|RES-07": [15, "carro, Villepinte a Roissy", "F-010"],
    "RES-04|RES-01": [20, "carro, travessia interna de Paris", "F-014"],
    "RES-04|RES-02": [20, "carro, travessia interna de Paris", "F-016"],
    "RES-04|RES-05": [30, "carro, travessia interna de Paris", "F-014"]
  };
  function carro(de, para) {
    if (de === para) return [0, "mesmo lugar", "F-013"];
    if (de === "RES-06") de = "hotel";
    if (para === "RES-06") para = "hotel";
    if (de === para) return [0, "mesmo lugar", "F-013"];
    var t = CARRO[de + "|" + para] || CARRO[para + "|" + de];
    if (t) {
      // volta de Paris para Villepinte à noite: a partir das 22h45 não há RER B
      if (/^RES-0[1245]$/.test(de) && para === "hotel") return [t[0] - 5 < 40 ? 40 : t[0] - 5, "carro: o RER B interrompe o trecho CDG a partir das 22h45", t[2]];
      return t;
    }
    return [45, "carro (ESTIMADO: trecho sem medição)", "F-019"];
  }
  function lugarRest(r) { return r.id === "RES-06" ? "hotel" : r.id; }
  function zonaRest(r) { return r.id === "RES-06" ? "hotel" : (r.id === "RES-07" ? "roissy" : "paris"); }
  function nomeCurto(r) { return r.id === "RES-06" ? "hotel" : r.nome; }

  // ---------- links (consulta ao vivo, sem chave de API) ----------
  function enc(s) { return encodeURIComponent(s); }
  A.linkMapa = function (q) { return q ? "https://www.google.com/maps/search/?api=1&query=" + enc(q) : null; };
  A.linkRota = function (q, modo) {
    return q ? "https://www.google.com/maps/dir/?api=1&destination=" + enc(q) + "&travelmode=" + (modo || "driving") : null;
  };
  A.linkPreco = function (ref) {
    if (!ref) return null;
    var v = A.voo(ref);
    if (v) {
      var ida = v.partida_gru.slice(0, 10), volta = v.partida_volta.slice(0, 10);
      return { url: "https://www.google.com/travel/flights?q=" + enc("Flights from GRU to " + v.chega_em + " on " + ida + " returning " + volta + " business class " + v.companhia),
               rotulo: "Tarifa agora no Google Flights", valor_corpus: v.preco_eur, unidade: "ida e volta" };
    }
    var h = A.hotel(ref);
    if (h) return { url: "https://www.booking.com/searchresults.html?ss=" + enc(h.nome) + "&checkin=2026-10-17&checkout=2026-10-21&group_adults=1&no_rooms=1&group_children=0",
                    rotulo: "Diária agora no Booking", valor_corpus: h.diaria_eur, unidade: "por noite" };
    var r = A.rest(ref);
    if (r) return { url: A.linkMapa(r.id === "RES-06" ? "Novotel Suites Paris CDG Airport Villepinte" : r.nome + ", " + r.endereco),
                    rotulo: "Horários e reserva agora", valor_corpus: null, unidade: null };
    if (ref === "TGV") return { url: "https://www.thetrainline.com/en/train-times/paris-gare-du-nord-to-lille-europe",
                                rotulo: "Horários e tarifas do TGV agora", valor_corpus: 120, unidade: "ida e volta, estimado" };
    return null;
  };

  // ---------- fato novo: remendo nos dados ----------
  var COLECOES = ["compromissos", "agendados", "voos", "hoteis", "restaurantes", "contatos", "sessoes", "politica"];
  function colecao(dados, em) {
    switch (em) {
      case "compromissos": return dados.compromissos;
      case "agendados": return dados.agendados;
      case "voos": return dados.catalogo.voos;
      case "hoteis": return dados.catalogo.hoteis;
      case "restaurantes": return dados.catalogo.restaurantes;
      case "contatos": return dados.contatos;
      case "sessoes": return dados.sessoes;
      case "politica": return dados.politica;
    }
    throw new Error('fato novo: coleção "' + em + '" não existe. Use uma destas: ' + COLECOES.join(", ") + ".");
  }
  function conferirCampos(o, onde) {
    ["inicio", "fim"].forEach(function (k) {
      if (o[k] != null && !/^\d{2}:\d{2}$/.test(o[k])) throw new Error("fato novo, " + onde + ': "' + k + '" precisa ser HH:MM, veio "' + o[k] + '".');
    });
    if (o.dia != null && !DIAS.some(function (d) { return d.data === o.dia; }))
      throw new Error("fato novo, " + onde + ': dia "' + o.dia + '" fora da viagem (' + DIAS[0].data + " a " + DIAS[DIAS.length - 1].data + ").");
  }
  function semMeta(o) { var r = {}; for (var k in o) if (k !== "em" && k !== "id") r[k] = o[k]; return r; }
  function aplicarFato(dados, fato) {
    (fato.remover || []).forEach(function (x) {
      var lista = colecao(dados, x.em), i = -1;
      lista.forEach(function (y, j) { if (y.id === x.id) i = j; });
      if (i < 0) throw new Error('fato novo, remover: não achei "' + x.id + '" em ' + x.em + ".");
      lista.splice(i, 1);
    });
    (fato.mudar || []).forEach(function (x) {
      var alvo = colecao(dados, x.em);
      if (x.em === "politica") { Object.assign(alvo, semMeta(x)); return; }
      var reg = byId(alvo, x.id);
      if (!reg) throw new Error('fato novo, mudar: não achei "' + x.id + '" em ' + x.em + ".");
      conferirCampos(x, "mudar " + x.id);
      Object.assign(reg, semMeta(x));
    });
    (fato.incluir || []).forEach(function (x) {
      var lista = colecao(dados, x.em);
      if (!x.id) throw new Error("fato novo, incluir: todo registro novo precisa de id.");
      if (byId(lista, x.id)) throw new Error('fato novo, incluir: "' + x.id + '" já existe em ' + x.em + ".");
      conferirCampos(x, "incluir " + x.id);
      var novo = semMeta(x); novo.id = x.id; lista.push(novo);
    });
  }

  // Atraso de voo como fato: muda a chegada no catálogo e o sábado inteiro se refaz.
  A.fatoAtraso = function (min, escolhas) {
    var id = (escolhas && escolhas.voo) || A.padroes.voo, v = A.voo(id);
    var t = v.chegada, nova = hm(m(t.slice(11, 16)) + min).slice(0, 5);
    return { fato_novo: v.companhia + " " + v.ida.split(" ")[0] + " vai pousar " + min + " min atrasado (" + nova + " em vez de " + t.slice(11, 16) + ").",
             mudar: [{ em: "voos", id: id, chegada: t.slice(0, 11) + nova + t.slice(16) }] };
  };

  A.planejar = function (escolhas, fato) {
    if (!fato) return planejarBase(escolhas || {}, escolhas || {});
    var salvo = { compromissos: A.compromissos, agendados: A.agendados, catalogo: A.catalogo, contatos: A.contatos, sessoes: A.sessoes, politica: A.politica };
    var copia = JSON.parse(JSON.stringify(salvo));
    aplicarFato(copia, fato);
    Object.assign(A, copia);
    try {
      var efetivas = Object.assign({}, escolhas || {}, fato.escolhas || {});
      var p = planejarBase(efetivas, escolhas || {});
      p.fato = fato;
      return p;
    } finally { Object.assign(A, salvo); }
  };

  // ---------- diferença entre dois planos, item a item ----------
  A.diffRoteiro = function (antes, depois) {
    var ma = {}, mb = {};
    antes.itens.forEach(function (i) { ma[i.chave] = i; });
    depois.itens.forEach(function (i) { mb[i.chave] = i; });
    var entrou = depois.itens.filter(function (i) { return !ma[i.chave]; });
    var saiu = antes.itens.filter(function (i) { return !mb[i.chave]; });
    var mudou = [], iguais = 0;
    depois.itens.forEach(function (i) {
      var a = ma[i.chave]; if (!a) return;
      var campos = ["dia", "inicio", "fim", "local", "titulo"].filter(function (k) { return (a[k] || "") !== (i[k] || ""); });
      if (campos.length) mudou.push({ antes: a, depois: i, campos: campos }); else iguais++;
    });
    function relevante(i) { return ["voo", "reuniao", "sessao", "refeicao", "hospedagem"].indexOf(i.tipo) >= 0 && !i.flex; }
    return {
      entrou: entrou, saiu: saiu, mudou: mudou, iguais: iguais,
      compromissos: {
        entrou: entrou.filter(relevante), saiu: saiu.filter(relevante),
        mudou: mudou.filter(function (x) { return relevante(x.depois); })
      }
    };
  };

  // ============================================================
  //                        PLANEJAR
  // ============================================================
  function Plano() { this.itens = []; this.custos = []; this.alertas = []; }
  Plano.prototype.add = function (o) {
    if (o.zona && !o.zi) { o.zi = o.zona; o.zf = o.zona; }
    this.itens.push(o);
    return o;
  };
  // trecho que começa em `ini`: o fim sai da soma dos componentes, então a janela fecha sempre
  Plano.prototype.legDe = function (dia, ini, titulo, zi, zf, comps, extra) {
    var tot = comps.reduce(function (s, c) { return s + c.minutos; }, 0);
    return this.add(Object.assign({ dia: dia, inicio: ini, fim: hm(m(ini) + tot), titulo: titulo, tipo: "deslocamento", zi: zi, zf: zf, componentes: comps }, extra || {}));
  };
  // trecho que termina em `fim`
  Plano.prototype.legAte = function (dia, fim, titulo, zi, zf, comps, extra) {
    var tot = comps.reduce(function (s, c) { return s + c.minutos; }, 0);
    return this.legDe(dia, hm(m(fim) - tot), titulo, zi, zf, comps, extra);
  };
  Plano.prototype.gasto = function (cat, rotulo, eur, nota, estimado) {
    this.custos.push({ categoria: cat, rotulo: rotulo, eur: eur, nota: nota || null, estimado: !!estimado });
  };
  Plano.prototype.alerta = function (nivel, titulo, texto, fontes) {
    this.alertas.push({ nivel: nivel, titulo: titulo, texto: texto, fontes: fontes || [] });
  };

  function modoDe(comps) {
    var t = comps.map(function (x) { return x.rotulo; }).join(" ");
    if (/VTC|carro|t[aá]xi/i.test(t)) return "driving";
    if (/RER|TGV|trem/i.test(t)) return "transit";
    return "walking";
  }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  // Compromissos que o roteiro monta com lógica própria. Qualquer outro, inclusive um que o
  // fato novo incluir, entra pelo caminho genérico.
  var DO_ROTEIRO = ["C-01","C-02","C-03","C-04","C-05","C-06","C-07","C-08","C-09","C-10","C-11","C-12","C-13","C-14"];
  // janelas da agenda que não são um compromisso de horário cheio
  var JANELAS = ["C-09", "C-11"];

  function planejarBase(escolhas, escUsuario) {
    var e = {};
    for (var k in A.padroes) e[k] = (escolhas && escolhas[k]) || A.padroes[k];

    var P = new Plano();
    var pedidosAlmoco = [];
    function c(id) { return byId(A.compromissos, id); }
    function ativo(a) {
      if (!a.condicao) return true;
      for (var k in a.condicao) if (e[k] !== a.condicao[k]) return false;
      return true;
    }
    function anc(x, extra) {
      var o = { dia: x.dia, inicio: x.inicio, fim: x.fim, titulo: x.titulo, tipo: x.tipo || "reuniao", local: x.local,
                zona: zonaDe(x.local), participantes: x.participantes, decisoes: x.decisoes || [], fontes: x.fontes || ["F-002"] };
      if (/^C-/.test(x.id)) o.ref_compromisso = x.id; else o.ref_agendado = x.id;
      return P.add(Object.assign(o, extra || {}));
    }
    // Âncoras de um dia no pavilhão, lidas dos dados (inclusive as que um fato novo incluiu).
    function ancorasPav(dia) {
      var l = [];
      A.compromissos.forEach(function (x) {
        if (x.dia === dia && x.inicio && x.fim && JANELAS.indexOf(x.id) < 0 && zonaDe(x.local) === "pavilhao") l.push(x);
      });
      (A.agendados || []).forEach(function (x) { if (x.dia === dia && ativo(x) && zonaDe(x.local) === "pavilhao") l.push(x); });
      return l;
    }
    function primeiroPav(dia, extras) {
      var v = ancorasPav(dia).map(function (x) { return m(x.inicio); }).concat(extras || []);
      return v.length ? Math.min.apply(null, v) : null;
    }
    function ultimoPav(dia) {
      var v = ancorasPav(dia).map(function (x) { return m(x.fim); });
      return v.length ? Math.max.apply(null, v) : 0;
    }
    function manhaPav(dia, hotel, extras) {
      var p = primeiroPav(dia, extras);
      if (p == null) return null;
      return P.legAte(dia, hm(p - 20), "Hotel -> pavilhão", "hotel", "pavilhao", [{ rotulo: "carro, 1,6 km", minutos: 10 }],
        { local: "Villepinte", fontes: ["F-013"], mapa: Q.pav, chave: dia + "|manha-pav" });
    }
    function academia(dia, hotel) {
      P.add({ dia: dia, inicio: "07:30", fim: "08:15", titulo: "Academia do hotel", tipo: "livre", zona: "hotel", flex: true, local: hotel.nome,
              decisoes: ["D-010"], fontes: ["F-037"], nota: "Fitness In Balance, acesso 24h. Academia foi um dos critérios de escolha do hotel." });
    }
    // Restaurante que atende o perfil numa data: não indisponível no corpus, não ruidoso, sem cordeiro na base.
    function restOk(r, dia) { return r && (r.indisponivel_corpus || []).indexOf(dia) < 0 && !r.ruidoso && !r.cordeiro_base; }

    // ---------- voo e hotel (com reserva se o fato novo tirar a opção do catálogo) ----------
    var voo = A.voo(e.voo);
    if (!voo) {
      voo = ["VOO-D", "VOO-B", "VOO-C", "VOO-A"].map(A.voo).filter(Boolean)[0];
      P.alerta("critico", "O voo escolhido não existe mais",
        "A opção " + e.voo + " saiu do catálogo. O plano passou para " + voo.companhia + " " + voo.id + " até você escolher de novo no Inbox.", ["F-009"]);
      e.voo = voo.id;
    }
    var hotel = A.hotel("HOT-02");
    if (!hotel) {
      hotel = A.catalogo.hoteis.filter(function (h) { return h.academia && h.diaria_eur <= A.politica.hotel_teto_eur; })[0] || A.catalogo.hoteis[0];
      P.alerta("critico", "O hotel escolhido saiu do catálogo", "O plano passou para " + hotel.nome + ".", ["F-030"]);
    }

    // ================= SEXTA 16/10, São Paulo =================
    var dSex = "2026-10-16";
    var c1 = c("C-01"), c2 = c("C-02");
    if (c1) anc(c1, { zona: "sp", local: "Escritório, São Paulo", decisoes: [] });
    if (c2) anc(c2, { zona: "remoto", decisoes: ["D-017"],
      nota: "Horário de Brasília, não de Paris. A secretaria registrou isso em separado porque o resto da viagem vira Paris." });
    var horaVoo = voo.partida_gru.slice(11, 16);
    var saiEsc = c2 ? c2.fim : hm(Math.max(c1 ? m(c1.fim) : 0, m(horaVoo) - 185));
    var lSP = P.legDe(dSex, saiEsc, "Escritório -> GRU", "sp", "aeroporto", [{ rotulo: "carro, escritório ao aeroporto em sexta à tarde", minutos: 60 }],
      { local: "São Paulo", decisoes: ["D-017"], fontes: ["F-022"], mapa: Q.gru });
    var folgaGru = dur(lSP.fim, horaVoo);
    if (folgaGru > 0) P.add({ dia: dSex, inicio: lSP.fim, fim: horaVoo, titulo: "GRU: despacho de bagagem, sala e embarque", tipo: "livre", zona: "aeroporto",
      local: "GRU Terminal 3", mapa: Q.gru, nota: "Ele sempre despacha. " + fmtDur(folgaGru) + " de folga antes da partida.", decisoes: ["D-017"], fontes: ["F-001", "F-022"] });
    if (folgaGru < 90) P.alerta("critico", "Não sobra tempo em GRU",
      "Saindo do escritório às " + saiEsc + ", você chega a GRU às " + lSP.fim + " para um voo às " + horaVoo + ": " + fmtDur(Math.max(0, folgaGru)) +
      ". Para voo internacional com bagagem despachada, o mínimo seguro é 1h30. Antecipe a saída ou mova a call.", ["F-022"]);
    P.add({ dia: dSex, inicio: horaVoo, fim: "23:59", titulo: voo.companhia + " " + voo.ida.split(" ")[0] + " GRU -> " + voo.chega_em, tipo: "voo", zona: "voo",
      local: "GRU -> " + voo.chega_em, ref: voo.id, decisoes: ["D-001"], fontes: ["F-009"], chave: "voo-ida",
      nota: "Voo noturno, como ele prefere na ida para a Europa. Executiva, autorizada pela política acima de 8h. Pousa " + voo.chegada.slice(11, 16) + " de sábado." });
    P.gasto("Deslocamento", "Sexta: escritório -> GRU", 35, "carro; câmbio assumido de R$ 6,20 por euro", true);

    // ================= SÁBADO 17/10 =================
    var dSab = "2026-10-17";
    var c3 = c("C-03"), c4 = c("C-04"), c5 = c("C-05");
    var pouso = voo.chegada.slice(11, 16);
    var lPouso = P.legDe(dSab, pouso, c3 ? "Pouso em CDG -> Hall 7, pronto para a abertura" : "Pouso em CDG -> pavilhão", "aeroporto", "pavilhao", [
      { rotulo: "taxiamento, desembarque e caminhada ao controle", minutos: 20 },
      { rotulo: "controle de fronteira (EES, fila não-UE)", minutos: 50 },
      { rotulo: "esteira de bagagem (parte em paralelo ao controle)", minutos: 20 },
      { rotulo: "saída e alfândega", minutos: 10 },
      { rotulo: "VTC pré-agendado, CDG -> 82 Avenue des Nations", minutos: 20 },
      { rotulo: "credenciamento e caminhada até o Hall 7", minutos: 10 }
    ], { local: "CDG Terminal 2E -> Paris Nord Villepinte", decisoes: ["D-012", "D-001"], fontes: ["F-020", "F-010", "F-032"], mapa: Q.pav, chave: "pouso-cdg",
      nota: "A conta começa no instante do pouso, não na porta do aeroporto. A mala segue com o motorista para o hotel: o check-in do Novotel é às 14:00 e não haveria quarto liberado agora." });
    var prontoSab = lPouso.fim;
    var folgaAbertura = c3 ? dur(prontoSab, c3.inicio) : null;

    if (c3 && folgaAbertura < 0) {
      P.alerta("critico", "Você chega depois do início da abertura",
        "Com " + voo.companhia + " pousando " + pouso + " e o cenário conservador de fronteira, você fica pronto " + prontoSab +
        ", ou seja " + fmtDur(-folgaAbertura) + " depois do início. A sessão é a que você disse que interessa de verdade.", ["F-020", "F-033"]);
    } else if (c3 && folgaAbertura <= 20) {
      P.alerta("atencao", "Folga de só " + fmtDur(folgaAbertura) + " para a sessão de abertura",
        voo.companhia + " pousa " + pouso + " e, no cenário conservador de fronteira, você fica pronto " + prontoSab +
        ". Qualquer atraso come a margem inteira. Fast-track de imigração e motorista pré-agendado estão no plano justamente por isso.", ["F-020"]);
    }
    if (voo.id === "VOO-D") P.alerta("atencao", "Air France está no aviso de greve de 17 a 21/10",
      "O aviso cobre toda transportadora francesa e vale exatamente nos seus dois dias de voo. Não é garantia de parada, mas se cancelar no dia 17 você perde o sábado inteiro. A LATAM LA-8022 está fora do aviso e é trocável no Inbox.", ["F-033", "F-034"]);
    if (!voo.flying_blue) P.alerta("info", "Esta emissão não acumula Flying Blue",
      voo.companhia + " é " + voo.programa + ". Seu perfil registra que você faz questão do programa e já reclamou de emissão fora dele. A política permite, porque a diferença de tarifa passa de 15% e a escolha volta para o viajante.", ["F-001", "F-004"]);

    if (c3) anc(c3, { tipo: "sessao", decisoes: ["D-001", "D-012"], fontes: ["F-002", "F-003"],
      nota: "A sessão que ele disse que interessa de verdade. Todo o sábado foi montado para trás a partir deste horário." });
    if (c4) {
      P.legAte(c4.dia, c4.inicio, "Hall 7 -> Hall 5A", "pavilhao", "pavilhao", [{ rotulo: "caminhada entre halls", minutos: 10 }],
        { local: "Paris Nord Villepinte", fontes: ["F-011"], mapa: Q.pav, chave: c4.dia + "|caminhada-etienne" });
      anc(c4, { participantes: ["Étienne Prévost"], fontes: ["F-002", "F-005"],
        nota: "Ele marcou pelo calendário do Groupe Vallonne e o convite chegou em horário de Paris, então " + c4.inicio + " aqui é " + c4.inicio + " local mesmo. Conversa de relacionamento e sourcing, não de decisão." });
      if (c4.dia === dSab) P.alerta("atencao", "A reunião das " + c4.inicio + " cai no período que ele pediu para não usar",
        "Seu perfil registra duas vezes: nada de decisão no primeiro meio período depois de voo intercontinental. Mantivemos o compromisso porque foi o Étienne quem marcou, o relacionamento é antigo e a pauta é sourcing, não número. O que NÃO entra nesse dia é o Henrik, que quer discutir números.", ["F-001", "F-006"]);
    }
    pedidosAlmoco.push({ dia: dSab, de: "11:30", ate: "15:30", dur: 75, titulo: "Almoço na praça de alimentação",
      nota: "Não há restaurante de serviço completo dentro dos halls, só praça de alimentação e café de feira." });
    P.gasto("Refeições", "Sábado: almoço na praça de alimentação", 35, "1 pessoa", true);

    var depSab = hm(Math.max(m("17:40"), ultimoPav(dSab)));
    var lHot = P.legDe(dSab, depSab, "Pavilhão -> hotel", "pavilhao", "hotel", [{ rotulo: "carro, 1,6 km", minutos: 10 }],
      { local: "Villepinte", fontes: ["F-013"], mapa: hotel.nome, chave: dSab + "|pav-hotel" });
    var ck = P.add({ dia: dSab, inicio: lHot.fim, fim: hm(m(lHot.fim) + 40), titulo: "Check-in no " + hotel.nome, tipo: "hospedagem", zona: "hotel",
      local: hotel.local, ref: hotel.id, decisoes: ["D-010", "D-011"], fontes: ["F-030", "F-036"], chave: "check-in", nota: "A mala já está na portaria desde o meio-dia." });

    if (e.jantar_sabado === "livre") {
      var jl = hm(Math.max(m("20:00"), m(ck.fim) + 20));
      P.add({ dia: dSab, inicio: jl, fim: hm(m(jl) + 60), titulo: "Jantar leve no hotel", tipo: "refeicao", zona: "hotel", local: hotel.nome, ref: "RES-06",
        decisoes: ["D-002"], fontes: ["F-031"], nota: "Noite livre depois do voo. Ele dorme mal em voo e pousou hoje." });
      P.gasto("Refeições", "Sábado: jantar no hotel", 55, "1 pessoa");
    } else {
      var rS = A.rest("RES-02"), jIni = c5 ? c5.inicio : "20:30", tS = carro("hotel", "RES-02");
      P.legAte(dSab, hm(m(jIni) - 40), "Hotel -> " + rS.nome + " (11e)", "hotel", "paris", [{ rotulo: tS[1], minutos: tS[0] }],
        { local: "Villepinte -> Paris 11e", fontes: [tS[2]], mapa: rS.nome + ", " + rS.endereco });
      var js = P.add({ dia: dSab, inicio: jIni, fim: hm(m(jIni) + 105), titulo: "Jantar de trabalho no " + rS.nome, tipo: "refeicao", zona: "paris",
        local: rS.endereco, ref: rS.id, participantes: ["Contraparte a definir"], decisoes: ["D-002"], fontes: ["F-031"], ref_compromisso: c5 ? "C-05" : undefined,
        nota: "Le Duc está indisponível exatamente no sábado 17. Clamato não aceita reserva e é ruidoso: é o que sobrou." });
      var tV = carro("RES-02", "hotel");
      P.legDe(dSab, js.fim, rS.nome + " -> hotel", "paris", "hotel", [{ rotulo: tV[1], minutos: tV[0] }], { local: "Paris 11e -> Villepinte", fontes: [tV[2], "F-035"], mapa: hotel.nome });
      P.gasto("Refeições", "Sábado: jantar de trabalho no " + rS.nome, 160, "estimado, 2 pessoas", true);
      P.gasto("Deslocamento", "Sábado: ida e volta ao 11e", 145, "VTC", true);
      P.alerta("atencao", "O jantar de sábado contraria duas coisas que ele já disse",
        "Clamato é ruidoso e não aceita reserva, e ele registrou que em lugar barulhento não escuta ninguém e a reunião não rende. Além disso este seria o terceiro jantar de trabalho da semana, e a nota da Camila pediu dois.", ["F-001", "F-007", "F-031"]);
    }

    // ================= DOMINGO 18/10 =================
    var dDom = "2026-10-18";
    var c6 = c("C-06"), c7 = c("C-07"), c8 = c("C-08");
    academia(dDom, hotel);
    manhaPav(dDom, hotel);
    if (c6) anc(c6, { tipo: "sessao", decisoes: ["D-014"], fontes: ["F-003", "F-002"],
      nota: "Escolhido sobre o painel de rastreabilidade das 10:30, que colide com este. O de rastreabilidade ficou com alguém do time de originação." });
    var temPavDom = primeiroPav(dDom) != null;
    var ondeDom = temPavDom ? "pav" : "hotel";    // de onde ele sai para o almoço
    var zonaOnde = temPavDom ? "pavilhao" : "hotel";
    var nomeOnde = temPavDom ? "Pavilhão" : "Hotel";

    var rSofia = null, depoisAlmoco = null, zonaDepois = zonaOnde, lugarDepois = ondeDom;
    if (c7) {
      rSofia = e.almoco_sofia === "arpege" ? A.rest("RES-04") : A.rest("RES-06");
      var aIni = c7.inicio, aFim = c7.fim || hm(m(aIni) + (rSofia.id === "RES-04" ? 120 : 90));
      var tA = carro(ondeDom, lugarRest(rSofia));
      if (tA[0] > 0) P.legAte(dDom, hm(m(aIni) - (rSofia.id === "RES-04" ? 25 : 10)), nomeOnde + " -> " + nomeCurto(rSofia) + (rSofia.id === "RES-04" ? " (7e)" : ""),
        zonaOnde, zonaRest(rSofia), [{ rotulo: tA[1], minutos: tA[0] }],
        { local: rSofia.id === "RES-04" ? "Villepinte -> Paris 7e" : "Villepinte", fontes: [tA[2]], mapa: rSofia.id === "RES-06" ? hotel.nome : rSofia.nome + ", " + rSofia.endereco,
          nota: rSofia.id === "RES-04" ? "Transporte público levaria 59 min com duas trocas. Carro é o modal do perfil dele." : undefined });
      anc(c7, { tipo: "refeicao", zona: zonaRest(rSofia), titulo: "Almoço com Sofia Marchetti", fim: aFim,
        local: rSofia.id === "RES-06" ? hotel.nome : rSofia.nome + ", " + rSofia.endereco, ref: rSofia.id, participantes: ["Sofia Marchetti"],
        decisoes: ["D-004"], fontes: ["F-005", "F-031"],
        nota: rSofia.vegetariano_forte ? "Cozinha vegetal. Ela é vegetariana há anos e isso quase deu problema no jantar de Milão em maio. Ambiente silencioso: dá para conversar."
                                       : "Perto da feira para não gastar 1h30 de carro. Cardápio curto de hotel: confirmar opção vegetariana na véspera." });
      P.gasto("Refeições", "Domingo: almoço com a Sofia no " + nomeCurto(rSofia), rSofia.id === "RES-04" ? 420 : 120, "estimado, 2 pessoas, contraparte externa", true);
      if (!rSofia.vegetariano_forte) P.alerta("atencao", "Almoço de hotel para uma convidada vegetariana",
        "O restaurante do Novotel tem cardápio curto e não é cozinha vegetal. A Sofia é vegetariana há anos e a Camila registrou que no jantar de Milão quase deu problema. Se ficar aqui, confirmar o prato dela com o hotel antes.", ["F-005", "F-031"]);
      depoisAlmoco = aFim; zonaDepois = zonaRest(rSofia); lugarDepois = lugarRest(rSofia);
      if (rSofia.id === "RES-06" && temPavDom) {   // volta ao pavilhão depois do almoço no hotel
        var vp = P.legDe(dDom, aFim, "Hotel -> pavilhão", "hotel", "pavilhao", [{ rotulo: "carro, 1,6 km", minutos: 10 }], { local: "Villepinte", fontes: ["F-013"], mapa: Q.pav, chave: dDom + "|volta-pav" });
        depoisAlmoco = vp.fim; zonaDepois = "pavilhao"; lugarDepois = "pav";
      }
    }

    // jantar do time: decisão automática D-015, refeita se a casa ficar indisponível
    if (c8) {
      var rDom = ["RES-01", "RES-05", "RES-07", "RES-06"].map(A.rest).filter(function (r) { return restOk(r, dDom); })[0];
      if (rDom && rDom.id !== "RES-01") P.alerta("atencao", "Jantar do time mudou de casa",
        "Le Duc não atende mais no domingo 18 pelo corpus. O jantar com o time passou para " + rDom.nome + ", a próxima opção que não é ruidosa e não tem cordeiro na base.", ["F-031"]);
      if (rDom) {
        var tD = carro(lugarDepois, lugarRest(rDom));
        var folgaJ = lugarDepois === "pav" ? 0 : 10;
        if (tD[0] > 0) P.legAte(dDom, hm(m(c8.inicio) - folgaJ), (zonaDepois === "paris" ? "7e" : (zonaDepois === "pavilhao" ? "Pavilhão" : "Hotel")) + " -> " + nomeCurto(rDom),
          zonaDepois, zonaRest(rDom), [{ rotulo: tD[1], minutos: tD[0] }], { local: "-> " + rDom.endereco, fontes: [tD[2]], mapa: rDom.nome + ", " + rDom.endereco, chave: dDom + "|ida-jantar" });
        if (zonaDepois === "paris" && depoisAlmoco) {
          P.add({ dia: dDom, inicio: depoisAlmoco, fim: hm(m(c8.inicio) - folgaJ - tD[0]), titulo: "Tempo livre em Paris", tipo: "livre", zona: "paris", flex: true, local: "Paris 7e",
            nota: "Ele já está no centro e o jantar do time é às " + c8.inicio + ". Primeira janela livre da viagem." });
        }
        var jd = anc(c8, { tipo: "refeicao", zona: zonaRest(rDom), titulo: "Jantar com o time de originação da Aqua Europa", fim: c8.fim || hm(m(c8.inicio) + 150),
          local: rDom.id === "RES-06" ? hotel.nome : rDom.nome + ", " + rDom.endereco, ref: rDom.id,
          participantes: ["Camila Reis", "Pierre Lambert", "Ana Sousa", "Diego Fontana"], decisoes: ["D-015"], fontes: ["F-002", "F-031"],
          nota: "Primeiro dos dois jantares de trabalho que ele pediu. Ambiente reservado: cinco pessoas na mesa e ele precisa ouvir." });
        var tR = carro(lugarRest(rDom), "hotel");
        if (tR[0] > 0) P.legDe(dDom, jd.fim, nomeCurto(rDom) + " -> hotel", zonaRest(rDom), "hotel", [{ rotulo: tR[1], minutos: tR[0] }],
          { local: "-> Villepinte", fontes: [tR[2], "F-035"], mapa: hotel.nome, chave: dDom + "|volta-jantar" });
        P.gasto("Refeições", "Domingo: jantar do time no " + nomeCurto(rDom), rDom.id === "RES-01" ? 550 : 400, "estimado, 5 pessoas", true);
      } else P.alerta("critico", "Nenhuma casa atende o jantar do time no domingo", "Todas as opções estão indisponíveis, ruidosas ou com cordeiro na base.", ["F-031"]);
    }
    P.gasto("Deslocamento", "Domingo: pavilhão -> Paris -> hotel", 160, "VTC", true);

    // ================= SEGUNDA 19/10 =================
    var dSeg = "2026-10-19";
    var c9 = c("C-09"), c10 = c("C-10");
    academia(dSeg, hotel);
    var rodIni = c9 ? hm(Math.max(m(c9.inicio), m("10:00"))) : null;   // 10:00: fica de pé nas duas leituras do horário do SIAL
    manhaPav(dSeg, hotel, rodIni ? [m(rodIni)] : []);
    var depSeg, chegaHotelSeg;
    if (c10 && e.lille === "manter") {
      var vIni = m(c10.inicio), vFim = m(c10.fim);
      var tgvIda = Math.floor((vIni - 20 - 30 - 62 - 4) / 60) * 60 + 4;       // TGV sai nos :04
      var rerFim = tgvIda - 37, rerIni = rerFim - 37;
      depSeg = hm(rerIni);
      P.legDe(c10.dia, depSeg, "Pavilhão -> Gare du Nord", "pavilhao", "paris", [
        { rotulo: "caminhada halls -> estação Parc des Expositions (61 m)", minutos: 6 },
        { rotulo: "espera de plataforma (RER B a cada 15 min)", minutos: 5 },
        { rotulo: "RER B, 9 paradas", minutos: 26 }
      ], { local: "Villepinte -> Paris 10e", decisoes: ["D-018"], fontes: ["F-017", "F-012"], mapa: Q.gdn, chave: "lille|rer",
        nota: "Única exceção ao carro em toda a viagem: a estação fica a 61 m da entrada e o carro no meio do dia é pior." });
      P.add({ dia: c10.dia, inicio: hm(rerFim), fim: hm(tgvIda), titulo: "Gare du Nord: almoço rápido e embarque", tipo: "refeicao", zona: "paris", local: "Paris Gare du Nord",
        mapa: Q.gdn, fontes: ["F-018"], chave: "lille|gare", nota: "37 min de folga antes do TGV." });
      P.legDe(c10.dia, hm(tgvIda), "TGV Paris Gare du Nord -> Lille Europe", "paris", "lille", [{ rotulo: "TGV, 202 km, 2a classe conforme política para trecho até 3h", minutos: 62 }],
        { local: "Paris -> Lille", decisoes: ["D-019"], fontes: ["F-018"], mapa: Q.lille, link_preco: "TGV", chave: "lille|tgv-ida" });
      P.legDe(c10.dia, hm(tgvIda + 62), "Lille Europe -> planta da Coopérative du Nord", "lille", "lille", [{ rotulo: "carro (ESTIMADO: o corpus não traz o endereço da planta)", minutos: 30 }],
        { local: "Lille", fontes: ["F-019"], mapa: "Lille, France", chave: "lille|carro-ida", nota: "Trecho estimado. Ver incerteza U-004: com o endereço real, este tempo muda." });
      anc(c10, { zona: "lille", titulo: "Visita à planta da Coopérative du Nord", decisoes: ["D-005"], mapa: "Lille, France" });
      P.legDe(c10.dia, c10.fim, "Planta -> Lille Europe", "lille", "lille", [{ rotulo: "carro (estimado)", minutos: 30 }], { local: "Lille", fontes: ["F-019"], mapa: Q.lille, chave: "lille|carro-volta" });
      var tgvVolta = Math.ceil((vFim + 30 + 15 - 22) / 60) * 60 + 22;           // TGV de volta nos :22
      P.legDe(c10.dia, hm(tgvVolta), "TGV Lille Europe -> Paris Gare du Nord", "lille", "paris", [{ rotulo: "TGV, 2a classe", minutos: 62 }],
        { local: "Lille -> Paris", decisoes: ["D-019"], fontes: ["F-018"], mapa: Q.gdn, link_preco: "TGV", chave: "lille|tgv-volta" });
      var lv = P.legDe(c10.dia, hm(tgvVolta + 62), "Gare du Nord -> hotel", "paris", "hotel", [{ rotulo: "carro, pico do fim de tarde", minutos: 45 }],
        { local: "Paris 10e -> Villepinte", decisoes: ["D-018"], fontes: ["F-017"], mapa: hotel.nome, chave: "lille|volta-hotel" });
      chegaHotelSeg = lv.fim;
      var saiuHotel = P.itens.filter(function (i) { return i.chave === dSeg + "|manha-pav"; })[0];
      var transito = 37 + 62 + 30 + 30 + 62 + 45;
      P.gasto("Deslocamento", "Segunda: TGV Paris-Lille ida e volta", 120, "2a classe, estimado", true);
      P.gasto("Deslocamento", "Segunda: táxi em Lille, ida e volta à planta", 90, "estimado", true);
      P.gasto("Refeições", "Segunda: almoço na estação e jantar no hotel", 80, "1 pessoa", true);
      P.alerta("info", "A segunda tem " + fmtDur(dur(saiuHotel ? saiuHotel.inicio : "09:30", chegaHotelSeg)) + " de porta a porta para " + fmtDur(vFim - vIni) + " de visita",
        "Sair do hotel às " + (saiuHotel ? saiuHotel.inicio : "09:30") + " e voltar às " + chegaHotelSeg + ", sendo " + fmtDur(transito) +
        " só de deslocamento ida e volta a Lille. Se a visita for cortesia e não o ponto da viagem, converter em call devolve a tarde de feira no dia em que o Henrik também está.", ["F-018", "F-002"]);
    } else {
      if (c10) anc(c10, { zona: "pavilhao", titulo: "Call com a Coopérative du Nord", local: "Sala reservada no pavilhão", decisoes: ["D-005"],
        nota: "A visita à planta convertida em vídeo, no horário que já estava reservado." });
      depSeg = hm(Math.max(m("18:00"), ultimoPav(dSeg), c10 ? m(c10.fim) : 0));
      pedidosAlmoco.push({ dia: dSeg, de: "12:00", ate: "14:00", dur: 60, titulo: "Almoço na praça de alimentação" });
      var lh2 = P.legDe(dSeg, depSeg, "Pavilhão -> hotel", "pavilhao", "hotel", [{ rotulo: "carro, 1,6 km", minutos: 10 }], { local: "Villepinte", fontes: ["F-013"], mapa: hotel.nome, chave: dSeg + "|pav-hotel" });
      chegaHotelSeg = lh2.fim;
      P.gasto("Refeições", "Segunda: almoço na feira e jantar no hotel", 90, "1 pessoa", true);
      if (c10) P.alerta("info", "Visita à planta convertida em call",
        "Você ganhou a tarde de feira na segunda, mas a cooperativa foi vista por vídeo. Avisar a contraparte com antecedência: o compromisso presencial já estava aceito.", ["F-002"]);
    }
    if (c9 && rodIni && m(depSeg) - m(rodIni) >= 20) {
      P.add({ dia: dSeg, inicio: rodIni, fim: hm(Math.min(m(c9.fim) > m(depSeg) ? m(depSeg) : Math.max(m(c9.fim), m(rodIni) + 20), m(depSeg))),
        titulo: "Rodada de reuniões no pavilhão", tipo: "reuniao", zona: "pavilhao", flex: true, local: "Paris Nord Villepinte", fontes: ["F-002"], ref_compromisso: "C-09",
        nota: "Janela da agenda que ainda estava em montagem. Começa às 10:00, não às 09:30: pelo horário real a feira só abre às 10:00." });
    }
    var jsg = hm(Math.max(m("20:00"), m(chegaHotelSeg) + 30));
    P.add({ dia: dSeg, inicio: jsg, fim: hm(m(jsg) + 60), titulo: "Jantar leve no hotel", tipo: "refeicao", zona: "hotel", local: hotel.nome, ref: "RES-06",
      fontes: ["F-031"], nota: "A agenda marcava a noite livre." });

    // ================= TERÇA 20/10 =================
    var dTer = "2026-10-20";
    var c12 = c("C-12");
    academia(dTer, hotel);
    manhaPav(dTer, hotel);
    pedidosAlmoco.push({ dia: dTer, de: "12:00", ate: "13:45", dur: 60, titulo: "Almoço na praça de alimentação" });
    P.gasto("Refeições", "Terça: almoço na feira", 35, "1 pessoa", true);
    if (c12) {
      var jT = e.jantar_terca === "le_duc" ? A.rest("RES-01") : A.rest("RES-05");
      var tJ = carro("pav", jT.id);
      P.legAte(dTer, hm(m(c12.inicio) - 15), "Pavilhão -> " + jT.nome, "pavilhao", "paris", [{ rotulo: tJ[1], minutos: tJ[0] }],
        { local: "Villepinte -> " + jT.endereco, fontes: [tJ[2]], mapa: jT.nome + ", " + jT.endereco, chave: dTer + "|ida-jantar" });
      var jt = anc(c12, { tipo: "refeicao", zona: "paris", titulo: "Jantar com investidores", fim: c12.fim || hm(m(c12.inicio) + 150),
        local: jT.nome + ", " + jT.endereco, ref: jT.id, participantes: ["Investidores (contraparte externa)"], decisoes: ["D-006"], fontes: ["F-002", "F-031"],
        nota: "Segundo dos dois jantares de trabalho que ele pediu, com contraparte externa. " +
              (jT.id === "RES-01" ? "Peixe e ambiente reservado, e comporta mesa maior se forem mais de quatro." : "Casa pequena e silenciosa. Se a mesa passar de quatro, não cabe.") });
      var tJv = carro(jT.id, "hotel");
      P.legDe(dTer, jt.fim, jT.nome + " -> hotel", "paris", "hotel", [{ rotulo: tJv[1], minutos: tJv[0] }],
        { local: jT.endereco + " -> Villepinte", fontes: [tJv[2], "F-035"], mapa: hotel.nome, chave: dTer + "|volta-jantar" });
      P.gasto("Refeições", "Terça: jantar com investidores no " + jT.nome, jT.id === "RES-01" ? 440 : 260, "estimado, 5 pessoas, contraparte externa", true);
      if (jT.id === "RES-05") P.alerta("info", "Le Baratin é casa pequena e ninguém registrou quantos investidores são",
        "A agenda diz apenas 'jantar com investidores, a confirmar'. Se a mesa passar de quatro, Le Baratin não acomoda e não tem peixe como base. Le Duc comporta e atende a preferência dele.", ["F-002", "F-031"]);
    } else {
      var dT = hm(Math.max(m("17:30"), ultimoPav(dTer)));
      P.legDe(dTer, dT, "Pavilhão -> hotel", "pavilhao", "hotel", [{ rotulo: "carro, 1,6 km", minutos: 10 }], { local: "Villepinte", fontes: ["F-013"], mapa: hotel.nome, chave: dTer + "|pav-hotel" });
    }
    P.gasto("Deslocamento", "Terça: pavilhão -> Paris -> hotel", 150, "VTC", true);

    // ================= QUARTA 21/10 =================
    var dQua = "2026-10-21";
    var c13 = c("C-13"), c14 = c("C-14");
    academia(dQua, hotel);
    P.add({ dia: dQua, inicio: "09:30", fim: "10:00", titulo: "Late check-out solicitado e mala na portaria", tipo: "hospedagem", zona: "hotel", local: hotel.nome,
      decisoes: ["D-016"], fontes: ["F-036"], chave: "late-checkout",
      nota: "O check-out padrão é meio-dia e a sessão de encerramento é " + (c13 ? c13.inicio + "-" + c13.fim : "11:00-12:00") + ": não dá para estar nos dois. Late check-out pedido na reserva; se negarem, a mala fica na portaria." });
    manhaPav(dQua, hotel);
    if (c13) anc(c13, { tipo: "sessao", fontes: ["F-002", "F-003"] });
    var upQ = ultimoPav(dQua);
    var depQua = hm(Math.max(m("13:00"), upQ ? upQ + 60 : 0));
    if (upQ) {
      pedidosAlmoco.push({ dia: dQua, de: hm(upQ), ate: "14:00", dur: 60, titulo: "Almoço e últimas conversas" });
      P.legDe(dQua, depQua, "Pavilhão -> hotel", "pavilhao", "hotel", [{ rotulo: "carro, 1,6 km", minutos: 10 }], { local: "Villepinte", fontes: ["F-013"], mapa: hotel.nome, chave: dQua + "|pav-hotel" });
    }
    var voltaH = voo.partida_volta.slice(11, 16);
    var noBalcao = hm(m(voltaH) - 175);
    var lC = P.legAte(dQua, noBalcao, "Hotel -> CDG Terminal 2E", "hotel", "aeroporto", [{ rotulo: "carro, 12,3 km", minutos: 25 }],
      { local: "Villepinte -> CDG", decisoes: ["D-016"], fontes: ["F-010"], mapa: Q.cdg, chave: "hotel-cdg" });
    P.add({ dia: dQua, inicio: hm(upQ ? m(depQua) + 10 : m("10:00")), fim: lC.inicio, titulo: "Hotel: trabalho e reorganizar a mala", tipo: "livre", zona: "hotel", flex: true,
      local: hotel.nome, decisoes: ["D-016"], nota: "Janela de folga deliberada antes do aeroporto." });
    P.add({ dia: dQua, inicio: noBalcao, fim: voltaH, titulo: "CDG: check-in, bagagem, fronteira de saída e sala", tipo: "livre", zona: "aeroporto",
      local: "CDG Terminal 2E", mapa: Q.cdg, decisoes: ["D-016"], fontes: ["F-021"], chave: "cdg-espera", nota: "2h55 de antecedência. O EES também roda na saída, e não só na entrada." });
    P.add({ dia: dQua, inicio: voltaH, fim: "23:59", titulo: voo.companhia + " " + voo.chega_em + " -> GRU", tipo: "voo", zona: "voo",
      local: voo.chega_em + " -> GRU", ref: voo.id, decisoes: ["D-001"], fontes: ["F-009"], ref_compromisso: c14 ? "C-14" : undefined, chave: "voo-volta",
      nota: voo.volta + ". Pousa em GRU " + voo.chegada_volta.slice(8, 10) + "/10 às " + voo.chegada_volta.slice(11, 16) + "." });
    if (voo.id === "VOO-D") P.alerta("atencao", "A volta de quarta também cai no aviso de greve",
      "O aviso de 17 a 21/10 cobre o dia 21, que é o dia da sua volta. Vale ter o LA-8023 das 18:55 mapeado como alternativa: mesmo horário, mesmo aeroporto.", ["F-033"]);

    // ================= QUINTA 22/10, São Paulo =================
    var dQui = "2026-10-22";
    if (voo.chegada_volta && voo.chegada_volta.slice(0, 10) === dQui) {
      var lG = P.legDe(dQui, voo.chegada_volta.slice(11, 16), "Pouso em GRU -> São Paulo", "aeroporto", "sp", [
        { rotulo: "taxiamento, desembarque e caminhada", minutos: 15 },
        { rotulo: "imigração brasileira (cidadão, e-gates)", minutos: 15 },
        { rotulo: "esteira de bagagem", minutos: 25 },
        { rotulo: "carro, GRU -> São Paulo no início da manhã", minutos: 50 }
      ], { local: "GRU -> São Paulo", fontes: ["F-042"], chave: "pouso-gru",
        nota: "Destino estimado: o corpus não diz se ele vai para casa ou para o escritório." });
      P.add({ dia: dQui, inicio: lG.fim, fim: "13:00", titulo: "Manhã sem reunião de decisão", tipo: "livre", zona: "sp", flex: true, local: "São Paulo",
        fontes: ["F-001"], chave: "quinta-manha",
        nota: "A mesma regra do sábado vale na volta: nada de decisão no primeiro meio período depois de voo intercontinental. A agenda exportada não tem nada marcado na quinta." });
      P.gasto("Deslocamento", "Quinta: GRU -> São Paulo", 35, "carro; câmbio assumido de R$ 6,20 por euro", true);
    }

    // ---------------- custos fixos ----------------
    P.gasto("Voo", voo.companhia + " GRU-" + voo.chega_em + "-GRU, executiva", voo.preco_eur, voo.flying_blue ? "Acumula Flying Blue" : "Não acumula Flying Blue");
    P.gasto("Hospedagem", hotel.nome + ", 4 noites x EUR " + hotel.diaria_eur, 4 * hotel.diaria_eur, "Teto da política: EUR " + A.politica.hotel_teto_eur + "/noite");
    P.gasto("Deslocamento", "Sábado: VTC CDG -> pavilhão + mala ao hotel", 60, "pré-agendado, com meet and greet", true);
    P.gasto("Deslocamento", "Fast-track de imigração em CDG", 45, "mitigação da fila EES", true);
    P.gasto("Deslocamento", "Hotel <-> pavilhão, a semana", 90, "8 trechos de carro, 1,6 km", true);
    P.gasto("Deslocamento", "Quarta: hotel -> CDG", 50, "VTC", true);

    // ---------------- agendados: entram onde os dados mandam ----------------
    (A.agendados || []).forEach(function (a) {
      if (!ativo(a)) return;
      if (a.caminhada_min) P.legAte(a.dia, a.inicio, "Caminhada até o " + a.local, "pavilhao", "pavilhao", [{ rotulo: "caminhada entre halls", minutos: a.caminhada_min }],
        { local: "Paris Nord Villepinte", fontes: ["F-011"], mapa: Q.pav, chave: a.id + "|caminhada" });
      anc(a, {
        nota: a.id === "A-HENRIK" ? "Os 40 min que ele pediu, de manhã, como ele preferia. Sala fechada e não estande: a Claire Dubois, concorrente direta neste deal, está no evento a semana toda."
            : a.id === "A-ORTEGA" ? "Terça é o único dia dele no evento. Fornecedor de duas investidas, e fala espanhol, que o Sebastian fala."
            : a.id === "A-BELTRAN" ? "Sem agenda fixa, conhece todo mundo. Vale o café."
            : a.id === "A-PRIVATE" ? "Casa com sourcing, o outro foco declarado da edição."
            : a.id === "A-CLAIRE" ? "Relacionamento com fundos europeus, sem pauta. Nordvest fora da conversa: ela é concorrente direta nesse deal. Local público e neutro, longe do estande da Nordvest."
            : a.nota
      });
    });
    var aH = A.agendado("A-HENRIK"), aC = A.agendado("A-CLAIRE");
    if (aC && ativo(aC) && aH) P.alerta("atencao", "Claire e Henrik estão nos dois lados do mesmo deal",
      "Você vê o Henrik (Nordvest) " + rotuloDia(aH.dia) + " " + aH.inicio + " e a Claire (concorrente direta no deal da Nordvest) " + rotuloDia(aC.dia) + " " + aC.inicio +
      ". Dias diferentes e Henrik primeiro, de propósito. A disciplina na conversa com ela é a única proteção que o plano não consegue dar sozinho.", ["F-005", "F-006"]);

    // ---------------- compromissos que só existem nos dados (ex.: incluídos por um fato novo) ----------------
    var semTrajeto = [];
    A.compromissos.forEach(function (x) {
      if (DO_ROTEIRO.indexOf(x.id) >= 0) return;
      if (!x.inicio) return;
      if (!DIAS.some(function (d) { return d.data === x.dia; })) return;
      var z = zonaDe(x.local), fim = x.fim || hm(m(x.inicio) + 60);
      anc(x, { fim: fim, tipo: x.tipo || (/^SIAL/.test(x.titulo || "") ? "sessao" : "reuniao"), zona: z === "fora" ? "fora" : z,
        nota: x.nota || "Compromisso que entrou pelos dados, fora do roteiro original." });
      if (z === "fora" || z === "hotel") {
        semTrajeto.push(x);
        P.alerta("critico", "Sem trajeto calculado para " + x.titulo,
          "O local \"" + (x.local || "não informado") + "\" não é o pavilhão nem uma call, e o motor não inventa trajeto. Informe o endereço ou mova o compromisso para o pavilhão.", ["F-002"]);
      }
    });

    acomodar(P);
    pedidosAlmoco.forEach(function (r) { colocarAlmoco(P, r); });
    acomodar(P);            // o almoço também empurra o que é flexível
    preencher(P);
    fechar(P, hotel);

    // ============================================================
    //                        TRAVAS
    // ============================================================
    var G = [];
    function guarda(id, titulo, ok, detalhe, fontes) { G.push({ id: id, titulo: titulo, ok: ok, detalhe: detalhe, fontes: fontes || [] }); }
    var I = P.itens;

    guarda("G-01", "Chega ao Hall 7 antes da abertura de sábado", !c3 || folgaAbertura >= 0,
      !c3 ? "A sessão de abertura não está mais na agenda." :
      folgaAbertura >= 0 ? "Pronto " + prontoSab + ", com " + fmtDur(folgaAbertura) + " de folga para as " + c3.inicio + "."
                         : "Pronto " + prontoSab + ", ou seja " + fmtDur(-folgaAbertura) + " depois do início.", ["F-020"]);

    var numerosSab = I.filter(function (i) { return i.dia === dSab && (i.ref_agendado === "A-HENRIK" || /n[uú]meros|transa[cç][aã]o/i.test(i.titulo)); });
    guarda("G-02", "Nenhuma reunião de números no primeiro meio período depois do pouso", numerosSab.length === 0,
      numerosSab.length === 0 ? "O Henrik, que é a conversa de números, não está no sábado." :
      "Há reunião de números no sábado: " + numerosSab.map(function (i) { return i.titulo; }).join(", "), ["F-001"]);

    guarda("G-03", "Diária do hotel dentro do teto da política", hotel.diaria_eur <= A.politica.hotel_teto_eur,
      "EUR " + hotel.diaria_eur + " contra teto de EUR " + A.politica.hotel_teto_eur + ".", ["F-004"]);

    var iH = I.filter(function (i) { return i.ref_agendado === "A-HENRIK"; })[0];
    var iC = I.filter(function (i) { return i.ref_agendado === "A-CLAIRE"; })[0];
    var sep = !iC || (iH && iH.dia < iC.dia);
    guarda("G-04", "Henrik e Claire em dias diferentes, Henrik primeiro", sep,
      !iC ? "A Claire não está no plano nesta rodada." :
      sep ? "Henrik " + rotuloDia(iH.dia) + ", Claire " + rotuloDia(iC.dia) + ". Nenhum cruzamento de agenda." : "Os dois caem no mesmo dia ou a Claire vem primeiro.", ["F-005"]);

    var okVeg = !c7 || (rSofia && rSofia.vegetariano_forte);
    guarda("G-05", "Almoço com a Sofia em casa que serve bem uma vegetariana", okVeg,
      !c7 ? "O almoço com a Sofia não está mais na agenda." : okVeg ? rSofia.nome + " é cozinha vegetal." : "Restaurante de hotel, cardápio curto: exige confirmar o prato dela antes.", ["F-005"]);

    var cordeiro = I.filter(function (i) { return i.ref && (A.rest(i.ref) || {}).cordeiro_base; });
    guarda("G-06", "Nenhuma refeição dele em casa com cordeiro na base do cardápio", cordeiro.length === 0,
      cordeiro.length === 0 ? "Paul Bert ficou fora por isso." : "Há refeição em casa de cordeiro.", ["F-001"]);

    var ruid = I.filter(function (i) { return i.ref && (A.rest(i.ref) || {}).ruidoso && i.tipo === "refeicao" && (i.participantes || []).length; });
    guarda("G-07", "Nenhum jantar de trabalho em lugar barulhento", ruid.length === 0,
      ruid.length === 0 ? "Todos os jantares de trabalho em ambiente reservado." : "Jantar de trabalho em lugar ruidoso: " + ruid.map(function (i) { return i.titulo; }).join(", "), ["F-001"]);

    var jtr = I.filter(function (i) { return i.tipo === "refeicao" && (i.participantes || []).length && m(i.inicio) >= m("18:00"); });
    guarda("G-08", "Exatamente dois jantares de trabalho na semana", jtr.length === 2,
      jtr.length + " jantar(es) de trabalho: " + jtr.map(function (i) { return i.dia.slice(8) + "/10"; }).join(", ") + ". A nota da Camila pediu dois: um com o time e um com contraparte externa.", ["F-007"]);

    var indisp = I.filter(function (i) { var r = i.ref && A.rest(i.ref); return r && (r.indisponivel_corpus || []).indexOf(i.dia) >= 0; });
    guarda("G-09", "Nenhum restaurante usado em data que o corpus marca indisponível", indisp.length === 0,
      indisp.length === 0 ? "Checado contra a disponibilidade de cada casa no corpus." : "Conflito: " + indisp.map(function (i) { return i.titulo + " (" + A.rest(i.ref).nome + ", " + i.dia.slice(8) + "/10)"; }).join("; "), ["F-008"]);

    var over = [];
    DIAS.forEach(function (d) {
      var l = I.filter(function (i) { return i.dia === d.data && i.fim && i.tipo !== "voo" && !i.flex; }).sort(porHora);
      for (var x = 0; x < l.length; x++) for (var y = x + 1; y < l.length; y++) {
        if (m(l[y].inicio) >= m(l[x].fim)) continue;
        if (l[x].chave === "pouso-cdg" && l[y].ref_compromisso === "C-03") continue;   // G-01 já mede isso com precisão
        over.push(d.rotulo + ": " + l[x].titulo + " (" + l[x].inicio + "-" + l[x].fim + ") x " + l[y].titulo + " (" + l[y].inicio + "-" + l[y].fim + ")");
      }
    });
    guarda("G-10", "Nenhum item do roteiro se sobrepõe a outro", over.length === 0, over.length === 0 ? "Checado dia a dia." : over.join(" | "));

    var fixos = A.compromissos.filter(function (x) { return x.firmeza === "fixo"; });
    var faltando = fixos.filter(function (x) { return !I.some(function (i) { return i.ref_compromisso === x.id; }); });
    guarda("G-11", "Todo compromisso firme da agenda está no plano", faltando.length === 0,
      faltando.length === 0 ? fixos.length + " compromissos firmes, todos presentes." : "Fora do plano: " + faltando.map(function (x) { return x.titulo; }).join("; "), ["F-002"]);

    var noiteRer = I.filter(function (i) {
      return i.tipo === "deslocamento" && m(i.inicio) >= m("22:00") && (i.componentes || []).some(function (x) { return /RER/i.test(x.rotulo) && !/interrompe/i.test(x.rotulo); });
    });
    guarda("G-12", "Nenhuma volta noturna depende do RER B depois das 22h45", noiteRer.length === 0,
      noiteRer.length === 0 ? "Todas as voltas de jantar são de carro, por causa da obra que vai até 11/12." : "Há volta noturna por RER B.", ["F-035"]);

    var ant = dur(noBalcao, voltaH);
    guarda("G-13", "Chega a CDG com antecedência suficiente na quarta", ant >= 170,
      "No balcão às " + noBalcao + " para voo " + voltaH + ": " + fmtDur(ant) + " de antecedência.", ["F-021"]);

    var tgv = I.filter(function (i) { return /TGV/.test(i.titulo); });
    guarda("G-14", "TGV em 2a classe, como manda a política para trecho até 3h",
      tgv.every(function (i) { return (i.componentes || []).some(function (x) { return /2a classe/.test(x.rotulo); }); }),
      tgv.length ? tgv.length + " trecho(s) de TGV, 62 min cada, todos em 2a classe." : "Sem TGV nesta rodada.", ["F-004"]);

    var cedo = I.filter(function (i) { return i.dia >= dSab && i.zi === "pavilhao" && !i.flex && (i.tipo === "sessao" || i.tipo === "reuniao") && m(i.inicio) < m("10:00"); });
    guarda("G-15", "Nada crítico no pavilhão antes das 10:00", cedo.length === 0,
      cedo.length === 0 ? "O corpus diz que a feira abre 09:30 e o site oficial diz 10:00. O plano fica de pé nos dois."
                        : "Antes das 10:00: " + cedo.map(function (i) { return i.titulo; }).join("; "), ["F-003", "F-024"]);

    var somaRuim = I.filter(function (i) { return i.componentes && i.componentes.reduce(function (s, x) { return s + x.minutos; }, 0) !== dur(i.inicio, i.fim); });
    guarda("G-16", "Todo trecho declara componentes que somam a janela exata", somaRuim.length === 0,
      somaRuim.length === 0 ? "Checado em todos os deslocamentos." : somaRuim.map(function (i) { return i.titulo; }).join(" | "));

    guarda("G-17", "Chega a GRU com pelo menos 1h30 antes do voo de ida", folgaGru >= 90,
      "No aeroporto às " + lSP.fim + " para voo " + horaVoo + ": " + fmtDur(Math.max(0, folgaGru)) + " de folga.", ["F-022"]);

    guarda("G-18", "Todo compromisso tem trajeto calculado", semTrajeto.length === 0,
      semTrajeto.length === 0 ? "Nenhum compromisso em lugar que o motor não saiba ligar." : "Sem trajeto: " + semTrajeto.map(function (x) { return x.titulo + " (" + (x.local || "sem local") + ")"; }).join("; "), ["F-002"]);

    // ---------------- agregação ----------------
    var cats = {};
    P.custos.forEach(function (x) { (cats[x.categoria] = cats[x.categoria] || []).push(x); });
    var categorias = Object.keys(cats).map(function (nome) {
      return { nome: nome, total: cats[nome].reduce(function (s, x) { return s + x.eur; }, 0), itens: cats[nome] };
    }).sort(function (a, b) { return b.total - a.total; });
    var total = categorias.reduce(function (s, x) { return s + x.total; }, 0);

    var dias = DIAS.map(function (d) {
      var itens = I.filter(function (i) { return i.dia === d.data; });
      var desl = itens.filter(function (i) { return i.tipo === "deslocamento"; }).reduce(function (s, i) { return s + dur(i.inicio, i.fim); }, 0);
      return Object.assign({}, d, { itens: itens, min_deslocamento: desl,
        n_compromissos: itens.filter(function (i) { return (i.tipo === "reuniao" || i.tipo === "sessao") && !i.flex; }).length });
    });

    return {
      escolhas: e,
      respondidas: A.decisoes.filter(function (d) { return d.modo === "aberta" && escUsuario[d.chave]; }).map(function (d) { return d.id; }),
      pendentes: A.decisoes.filter(function (d) { return d.modo === "aberta" && !escUsuario[d.chave]; }),
      itens: I, dias: dias,
      custos: { total: total, categorias: categorias, linhas: P.custos },
      alertas: P.alertas, guardas: G, guardas_ok: G.filter(function (g) { return g.ok; }).length,
      voo: voo, hotel: hotel, folga_abertura_min: folgaAbertura, pronto_sabado: prontoSab, fato: null
    };
  }

  function rotuloDia(d) { var x = DIAS.filter(function (y) { return y.data === d; })[0]; return x ? x.rotulo.toLowerCase() : d; }
  function porHora(a, b) { return a.dia < b.dia ? -1 : a.dia > b.dia ? 1 : (m(a.inicio) - m(b.inicio)) || (m(a.fim) - m(b.fim)); }

  // Item flexível (academia, tempo livre, janela de rodada) cede espaço a qualquer compromisso:
  // é cortado e, se sobrar menos de 15 min, sai.
  function acomodar(P) {
    var fixos = P.itens.filter(function (i) { return !i.flex && i.tipo !== "voo"; });
    P.itens = P.itens.filter(function (f) {
      if (!f.flex) return true;
      var livres = [[m(f.inicio), m(f.fim)]];
      fixos.forEach(function (x) {
        if (x.dia !== f.dia) return;
        var a = m(x.inicio), b = m(x.fim), nova = [];
        livres.forEach(function (s) {
          if (b <= s[0] || a >= s[1]) { nova.push(s); return; }
          if (a > s[0]) nova.push([s[0], a]);
          if (b < s[1]) nova.push([b, s[1]]);
        });
        livres = nova;
      });
      var maior = livres.sort(function (p, q) { return (q[1] - q[0]) - (p[1] - p[0]); })[0];
      if (!maior || maior[1] - maior[0] < 15) return false;
      f.inicio = hm(maior[0]); f.fim = hm(maior[1]);
      return true;
    });
  }

  function pares(P, dia, comFlex) {
    var l = P.itens.filter(function (i) { return i.dia === dia && (comFlex || !i.flex) && i.tipo !== "voo"; }).sort(porHora), r = [], ate = -1, dono = null;
    for (var i = 0; i + 1 < l.length; i++) {
      if (m(l[i].fim) >= ate) { ate = m(l[i].fim); dono = l[i]; }
      r.push([dono, l[i + 1], ate]);
    }
    return r;
  }
  // Almoço no pavilhão: primeira janela de 40 min ou mais dentro do horário pedido.
  function colocarAlmoco(P, req) {
    var achou = pares(P, req.dia).some(function (p) {
      if (p[0].zf !== "pavilhao" || p[1].zi !== "pavilhao") return false;
      var s = Math.max(p[2], m(req.de));
      if (s > m(req.ate)) return false;
      var f = Math.min(m(p[1].inicio), s + req.dur);
      if (f - s < 40) return false;
      P.add({ dia: req.dia, inicio: hm(s), fim: hm(f), titulo: req.titulo, tipo: "refeicao", zona: "pavilhao", local: "Paris Nord Villepinte",
        mapa: Q.pav, fontes: ["F-003"], chave: req.dia + "|almoco-pav", nota: req.nota });
      return true;
    });
    if (!achou) P.alerta("info", "Sem janela de almoço na " + rotuloDia(req.dia),
      "Entre " + req.de + " e " + req.ate + " não sobrou intervalo de 40 min no pavilhão. Vale um lanche entre um compromisso e outro, ou abrir espaço na agenda.", ["F-003"]);
  }
  // Intervalo de 25 min ou mais no pavilhão vira tempo de estande: o roteiro não fica com buraco.
  function preencher(P) {
    var primeiro = true;
    DIAS.forEach(function (d) {
      pares(P, d.data, true).forEach(function (p) {
        if (p[0].zf !== "pavilhao" || p[1].zi !== "pavilhao") return;
        var g = m(p[1].inicio) - p[2];
        if (g < 25) return;
        P.add({ dia: d.data, inicio: hm(p[2]), fim: p[1].inicio, titulo: "Estandes e conversas abertas", tipo: "livre", zona: "pavilhao", flex: true,
          local: "Paris Nord Villepinte", mapa: Q.pav, decisoes: primeiro ? ["D-020"] : [], fontes: ["F-007"],
          nota: primeiro ? "Foco declarado da edição: sourcing de ingredientes e proteína. Três conversas boas valem mais que vinte apertos de mão." : undefined });
        primeiro = false;
      });
    });
  }
  // Ordena, numera e dá a cada item uma chave estável para comparar uma rodada com a outra.
  function fechar(P, hotel) {
    P.itens.sort(porHora);
    var visto = {};
    P.itens.forEach(function (o, n) {
      o.id = "I-" + ("00" + (n + 1)).slice(-3);
      var k = o.chave || o.ref_compromisso || o.ref_agendado || (o.dia + "|" + o.tipo + "|" + norm(o.titulo));
      visto[k] = (visto[k] || 0) + 1;
      o.chave = visto[k] > 1 ? k + "#" + visto[k] : k;
      if (o.mapa === undefined) o.mapa = o.zi === "pavilhao" ? Q.pav : o.zi === "hotel" ? hotel.nome : null;
      if (o.tipo === "deslocamento") o.modo = modoDe(o.componentes);
      if (o.zi && !o.zona) o.zona = o.zi === o.zf ? o.zi : null;
      Object.keys(o).forEach(function (k2) { if (o[k2] === undefined) delete o[k2]; });
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
