/* Interface do guia de viagem. Toda mudanca de escolha chama AQUA.planejar e
   redesenha: nao ha recompilacao, nao ha recarga. */
(function () {
  "use strict";

  var A = window.AQUA;
  var U = A.util;
  var LS = "aqua.escolhas.v1";
  var INICIO = "2026-10-16", FIM = "2026-10-21";

  // ---------- icones (SVG inline, traco 1.75, currentColor) ----------
  var P = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    train: '<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M12 3v8M8 22l2-4M16 22l-2-4"/><path d="M8 15h.01M16 15h.01"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m7 22 3-7 2.5 2v5"/><path d="M10.5 15 12 9l3 2.5 3 1"/><path d="M12 9 8.5 10.5 7 13"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    pin: '<path d="M20 10c0 5-5.54 10.19-7.4 11.79a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    undo: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>'
  };
  function ICON(n, s) {
    s = s || 20;
    return '<svg class="i" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[n] || "") + "</svg>";
  }

  // ---------- estado ----------
  var agora = agoraViagem();
  var st = {
    escolhas: carregar(),
    dia: faseDe(agora) === "durante" && agora.dia >= INICIO && agora.dia <= FIM ? agora.dia : "2026-10-17",
    view: "roteiro",
    atraso: 0,
    orcamento: null,
    abertos: {},        // deslocamentos expandidos
    notas: {},          // notas com "ver mais" abertas
    alertasAbertos: {}, // por dia
    seg: "fontes"
  };
  var plano = null;

  function carregar() {
    try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; }
  }
  function salvar() {
    try { localStorage.setItem(LS, JSON.stringify(st.escolhas)); } catch (e) {}
  }

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function eur(n) { return "EUR " + Number(n).toLocaleString("pt-BR"); }
  function seta(s) { return String(s || "").replace(/\s*->\s*/g, " → "); }
  // codigo de voo nao quebra no hifen (AF-0459)
  function cod(s) { return String(s).replace(/\b([A-Z]{2})-(\d{3,4})\b/g, "$1\u2011$2"); }
  function isUrl(s) { return /^https?:\/\//.test(s || ""); }
  function slug(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  var CURTO = { "Sexta": "Sex", "Sábado": "Sáb", "Domingo": "Dom", "Segunda": "Seg", "Terça": "Ter", "Quarta": "Qua" };
  var TIPO = {
    voo: ["plane", "Voo"], sessao: ["mic", "Sessão"], reuniao: ["users", "Reunião"],
    refeicao: ["utensils", "Refeição"], hospedagem: ["bed", "Hospedagem"], livre: ["clock", "Livre"],
    deslocamento: ["car", "Trajeto"]
  };
  function diaObj(data) { return plano.dias.filter(function (d) { return d.data === data; })[0]; }
  function diaLongo(data) { return diaObj(data).rotulo + ", " + (+data.slice(8)) + " de outubro"; }
  function fimMin(i) {
    if (!i.fim || i.fim === "23:59") return i.tipo === "voo" ? 1440 : U.m(i.inicio) + 60;
    return U.m(i.fim);
  }
  // modal do trecho: trem se algum componente for RER/TGV, carro se houver VTC/carro/taxi,
  // a pe so quando o trecho inteiro e caminhada (o pouso tem "caminhada" no 1o componente e e de carro)
  function modal(i) {
    var r = (i.componentes || []).map(function (c) { return c.rotulo; }).join(" | ") + " | " + i.titulo;
    if (/TGV|RER/i.test(r)) return "train";
    if (/VTC|carro|t[aá]xi/i.test(r)) return "car";
    if (/caminhada/i.test(r)) return "walk";
    return "car";
  }
  function iniciais(nome) {
    var w = String(nome).replace(/\(.*?\)/g, "").split(/\s+/).filter(function (x) { return /^[A-Za-zÀ-ÿ]/.test(x); });
    return ((w[0] || "?")[0] + ((w[1] || "")[0] || "")).toUpperCase();
  }

  // ---------- relogio da viagem ----------
  // sexta 16 em Sao Paulo (UTC-3); de 17 a 21 em Paris (UTC+2, verao ate 25/10).
  // ?agora=2026-10-17T15:40 simula, interpretado como hora local da viagem naquele dia.
  function agoraViagem() {
    var q = /[?&]agora=([^&]+)/.exec(location.search);
    if (q) {
      var mm = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(decodeURIComponent(q[1]));
      if (mm) return { dia: mm[1], min: +mm[2] * 60 + +mm[3], simulado: true };
    }
    var t = Date.now();
    function local(off) {
      var d = new Date(t + off * 60000);
      return { dia: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes(), simulado: false };
    }
    var paris = local(120);
    return paris.dia >= "2026-10-17" ? paris : local(-180);
  }
  function faseDe(n) {
    if (n.dia < INICIO || (n.dia === INICIO && n.min < 9 * 60)) return "antes";
    if (n.dia > FIM) return "depois";
    return "durante";
  }
  function emCurso(n) {
    var d = plano.dias.filter(function (x) { return x.data === n.dia; })[0];
    if (!d) return null;
    var cur = d.itens.filter(function (i) { return U.m(i.inicio) <= n.min && n.min < fimMin(i); });
    if (cur.length) return cur[cur.length - 1];
    // madrugada dentro do voo que saiu na vespera
    var ant = plano.dias.filter(function (x) { return x.data < n.dia; }).pop();
    if (ant && d.itens.length && n.min < U.m(d.itens[0].inicio)) {
      var ult = ant.itens[ant.itens.length - 1];
      if (ult && ult.tipo === "voo") return ult;
    }
    return null;
  }
  function proximoDe(n) {
    var lista = [];
    plano.dias.forEach(function (d) { d.itens.forEach(function (i) { lista.push(i); }); });
    return lista.filter(function (i) {
      return i.tipo !== "deslocamento" && (i.dia > n.dia || (i.dia === n.dia && U.m(i.inicio) > n.min));
    })[0] || null;
  }
  function trechoAntes(item) {
    var d = diaObj(item.dia), k = d.itens.indexOf(item);
    return k > 0 && d.itens[k - 1].tipo === "deslocamento" ? d.itens[k - 1] : null;
  }

  // ---------- alertas por dia ----------
  // o motor emite alertas da viagem inteira; aqui cada um vai para o dia a que se refere
  var ALERTA_DIA = [
    [/volta de quarta/i, "2026-10-21"],
    [/convidada vegetariana|almoço de hotel/i, "2026-10-18"],
    [/segunda tem|visita à planta/i, "2026-10-19"],
    [/claire e henrik|le baratin/i, "2026-10-20"]
  ];
  function diaDoAlerta(a) {
    for (var k = 0; k < ALERTA_DIA.length; k++) if (ALERTA_DIA[k][0].test(a.titulo)) return ALERTA_DIA[k][1];
    return "2026-10-17";
  }
  function alertaAtraso() {
    if (!st.atraso) return null;
    var novo = U.hm(U.m(plano.pronto_sabado) + st.atraso);
    var folga = plano.folga_abertura_min - st.atraso;
    var perdeu = folga < 0;
    return {
      nivel: perdeu ? "critico" : "atencao",
      titulo: "Fato novo: voo atrasado " + st.atraso + " min",
      texto: "Pronto no Hall 7 às " + novo + " em vez de " + plano.pronto_sabado + ". " +
        (perdeu ? "A sessão de abertura das 13:00 está perdida por " + U.fmtDur(-folga) +
          ". A reunião com o Étienne às 16:00 continua de pé." : "Ainda dá, com " + U.fmtDur(folga) + " de folga.")
    };
  }
  function alertasDoDia(dia) {
    var arr = plano.alertas.filter(function (a) { return diaDoAlerta(a) === dia; });
    var at = dia === "2026-10-17" ? alertaAtraso() : null;
    return at ? [at].concat(arr) : arr;
  }
  var PESO = { critico: 3, atencao: 2, info: 1 };

  // trecho literal da evidencia, quando houver; senao o rotulo da fonte
  function fonteHtml(fid) {
    var f = A.fonte(fid);
    if (!f) return "";
    var evs = A.evidencias.filter(function (e) { return e.fonte === fid; });
    var h = '<div class="ev-src"><div class="hd"><span class="tag ' + slug(f.tipo) + '">' + esc(f.tipo) + "</span>" +
      "<b>" + esc(f.rotulo || f.id) + "</b></div>";
    if (evs.length) h += "<q>" + esc(evs[0].trecho) + "</q>";
    h += isUrl(f.referencia)
      ? '<a class="path" href="' + esc(f.referencia) + '" target="_blank" rel="noopener">' + esc(f.referencia) + " " + ICON("ext", 13) + "</a>"
      : '<code class="path">' + esc(f.referencia) + "</code>";
    if (f.consultado_em) h += '<span class="path">consultado em ' + esc(f.consultado_em.replace("T", " ").slice(0, 16)) + "</span>";
    return h + "</div>";
  }

  // ============================================================
  //                        RENDER
  // ============================================================
  function render() {
    plano = A.planejar(st.escolhas);
    topo();
    roteiro();
    inbox();
    custos();
    fontes();
    navBadge();
  }

  function topo() {
    var n = plano.guardas.length, ok = plano.guardas_ok, b = $("healthBtn");
    b.className = "health " + (ok === n ? "ok" : "bad");
    b.innerHTML = ICON(ok === n ? "check" : "alert", 16) + '<span class="sr">' + (ok === n ? "✓" : "!") + " </span><span>" + ok + "/" + n + "</span>";
    b.setAttribute("aria-label", "Travas de consistência: " + ok + " de " + n + " passam");
    $("hdrSub").textContent = plano.voo.companhia + " · " + eur(plano.custos.total) + " · 4 noites";
  }

  function navBadge() {
    var n = plano.pendentes.length, el = $("navBadge");
    el.hidden = n === 0;
    el.textContent = n;
  }

  // ---------------- ROTEIRO ----------------
  function roteiro() {
    $("hero").innerHTML = hero();

    $("days").innerHTML = plano.dias.map(function (d) {
      var al = alertasDoDia(d.data).length;
      return '<button class="day' + (d.data === st.dia ? " on" : "") + '" data-d="' + d.data + '" role="tab" aria-selected="' + (d.data === st.dia) + '">' +
        "<small>" + (CURTO[d.rotulo] || d.rotulo).toUpperCase() + "</small>" +
        "<b>" + (+d.data.slice(8)) + "</b><i>" + esc(d.cidade.split(" / ")[0]) + "</i>" +
        (al ? '<span class="dot" aria-label="tem alerta"></span>' : "") + "</button>";
    }).join("");

    var d = diaObj(st.dia);
    if (!d) return;
    $("dayHd").innerHTML = "<b>" + esc(diaLongo(d.data)) + " · " + esc(d.cidade) + "</b>" +
      "<span>" + d.n_compromissos + " compromisso" + (d.n_compromissos === 1 ? "" : "s") +
      (d.min_deslocamento ? " · " + U.fmtDur(d.min_deslocamento) + " em trânsito" : "") +
      " · " + esc(d.tzLabel) + "</span>";

    $("alerts").innerHTML = alertasHtml(d.data);

    var cur = faseDe(agora) === "durante" ? emCurso(agora) : null;
    $("timeline").innerHTML = d.itens.map(function (i) { return linha(i, cur && cur.id === i.id); }).join("") ||
      '<div class="card hint">Nada marcado neste dia.</div>';
  }

  function hero() {
    var f = faseDe(agora);
    var sim = agora.simulado ? '<span class="sim">simulado · ' + agora.dia.slice(8) + "/10 " + U.hm(agora.min) + "</span>" : "";
    var abertas = A.decisoes.filter(function (d) { return d.modo === "aberta"; });
    var feitas = abertas.filter(function (d) { return st.escolhas[d.chave]; }).length;

    if (f === "antes") {
      var hoje = new Date(agora.dia + "T12:00:00Z"), ini = new Date(INICIO + "T12:00:00Z");
      var nd = Math.round((ini - hoje) / 86400000);
      var d0 = plano.dias[0];
      var prim = d0.itens.filter(function (i) { return i.tipo !== "deslocamento"; })[0];
      var voo = d0.itens.filter(function (i) { return i.tipo === "voo"; })[0];
      var cod = (plano.voo.ida || "").split(" ")[0];
      var h = '<div class="hero">' + sim + '<p class="hero-k">Viagem a Paris · SIAL 2026</p>';
      h += '<p class="hero-big">' + (nd <= 0 ? "É hoje" : "Faltam " + nd + " dia" + (nd === 1 ? "" : "s")) + "</p>";
      h += '<div class="hero-rows">';
      if (prim) h += '<div class="hero-r">' + ICON("calendar", 18) + "<span>Sex 16 · <b class=\"tnum\">" + esc(prim.inicio) + "</b> " + esc(prim.titulo) + "</span></div>";
      if (voo) h += '<div class="hero-r">' + ICON("plane", 18) + "<span><b class=\"tnum\">" + esc(voo.inicio) + "</b> · " + esc(cod) + " GRU → " + esc(plano.voo.chega_em) + "</span></div>";
      h += "</div>";
      h += '<div class="hero-prog"><div class="hero-prog-t"><span>' +
        (feitas === abertas.length ? "Tudo decidido" : feitas + " de " + abertas.length + " decisões tomadas") + "</span>" +
        (feitas === abertas.length ? "" : '<button class="hero-btn" data-v="inbox">Decidir ' + ICON("chevR", 16) + "</button>") +
        '</div><div class="pbar"><div style="width:' + (feitas / abertas.length * 100) + '%"></div></div></div>';
      return h + "</div>";
    }

    if (f === "depois") {
      return '<div class="hero">' + sim + '<p class="hero-k">De volta a São Paulo</p><p class="hero-big">Viagem concluída</p>' +
        '<div class="hero-rows"><div class="hero-r">' + ICON("wallet", 18) + "<span>Total gasto: " + eur(plano.custos.total) + "</span></div></div></div>";
    }

    var cur = emCurso(agora), prox = proximoDe(agora);
    var h2 = '<div class="hero">' + sim;
    if (cur) {
      h2 += '<button class="hero-now" data-go="' + cur.id + '" data-gd="' + cur.dia + '">' +
        '<span class="hero-k">Agora</span><span class="hero-now-t">' + ICON(cur.tipo === "deslocamento" ? modal(cur) : (TIPO[cur.tipo] || TIPO.livre)[0], 18) +
        "<b>" + esc(seta(cur.titulo)) + "</b></span>" +
        (cur.tipo !== "voo" && cur.fim ? '<i class="tnum">até ' + esc(cur.fim) + "</i>" : "") + "</button>";
    }
    if (prox) {
      var mesmo = prox.dia === agora.dia;
      var falta = mesmo ? U.m(prox.inicio) - agora.min : null;
      var tr = trechoAntes(prox);
      var saida = "";
      if (tr && tr.dia === agora.dia && U.m(tr.inicio) > agora.min) {
        saida = '<div class="hero-leave">' + ICON("clock", 16) + "<span>Saia às <b class=\"tnum\">" + esc(tr.inicio) + "</b> · " + U.fmtDur(U.dur(tr.inicio, tr.fim)) + " de trajeto</span></div>";
      } else if (tr && cur && cur.id === tr.id) {
        saida = '<div class="hero-leave">' + ICON(modal(tr), 16) + "<span>Em trânsito · chega às <b class=\"tnum\">" + esc(tr.fim) + "</b></span></div>";
      }
      var dd = diaObj(prox.dia);
      h2 += '<button class="hero-next" data-go="' + prox.id + '" data-gd="' + prox.dia + '">' +
        '<span class="hero-k">Próximo · ' + (mesmo ? (falta < 60 ? "em " + falta + " min" : "em " + U.fmtDur(falta)) : (CURTO[dd.rotulo] || dd.rotulo) + " " + (+prox.dia.slice(8))) + "</span>" +
        '<span class="hero-big2">' + esc(seta(prox.titulo)) + "</span>" +
        '<span class="hero-meta"><b class="tnum">' + esc(prox.inicio) + "</b>" + (prox.local ? " · " + esc(prox.local) : "") + "</span>" +
        (prox.participantes && prox.participantes.length ? '<span class="hero-meta">' + ICON("users", 15) + " " + esc(prox.participantes.join(", ")) + "</span>" : "") +
        "</button>" + saida;
    }
    if (!cur && !prox) h2 += '<p class="hero-big">Nada mais hoje</p>';
    return h2 + "</div>";
  }

  function alertasHtml(dia) {
    var arr = alertasDoDia(dia);
    if (!arr.length) return "";
    var crit = arr.filter(function (a) { return a.nivel === "critico"; });
    var resto = arr.filter(function (a) { return a.nivel !== "critico"; });
    var h = crit.map(alertaCard).join("");
    if (resto.length) {
      var top = resto.reduce(function (m, a) { return PESO[a.nivel] > PESO[m] ? a.nivel : m; }, "info");
      var aberto = !!st.alertasAbertos[dia];
      h += '<button class="al-line ' + top + '" data-al="' + dia + '" aria-expanded="' + aberto + '">' +
        ICON(top === "info" ? "info" : "alert", 18) +
        "<span>" + resto.length + " alerta" + (resto.length > 1 ? "s" : "") + " neste dia</span>" +
        '<span class="chev' + (aberto ? " up" : "") + '">' + ICON("chevD", 18) + "</span></button>";
      if (aberto) h += '<div class="al-list">' + resto.map(alertaCard).join("") + "</div>";
    }
    return h;
  }
  function alertaCard(a) {
    return '<div class="alert ' + a.nivel + '">' + ICON(a.nivel === "info" ? "info" : "alert", 18) +
      "<div><b>" + esc(a.titulo) + "</b><p>" + esc(a.texto) + "</p></div></div>";
  }

  function linha(i, agoraAqui) {
    if (i.tipo === "deslocamento") return linhaMove(i, agoraAqui);
    var t = TIPO[i.tipo] || TIPO.livre;
    var h = '<div class="row ev t-' + i.tipo + (agoraAqui ? " now" : "") + '" id="it-' + i.id + '">';
    h += '<div class="tcol"><b class="tnum">' + esc(i.inicio) + "</b>" +
      (i.fim && i.tipo !== "voo" ? '<i class="tnum">' + esc(i.fim) + "</i>" : "") + "</div>";
    h += '<div class="rail"><span class="node"></span></div>';
    h += '<div class="card ev-card">';
    if (i.tipo === "voo") h += embarque(i, agoraAqui);
    else {
      h += '<div class="ev-top">' + ICON(t[0], 16) + "<span>" + t[1] + "</span>" +
        (agoraAqui ? '<span class="now-tag">agora</span>' : "") +
        (i.fim ? '<em class="tnum">até ' + esc(i.fim) + "</em>" : "") + "</div>";
      h += "<h3>" + esc(seta(i.titulo)) + "</h3>";
      if (i.local) h += '<p class="ev-loc">' + ICON("pin", 15) + "<span>" + esc(i.local) + "</span></p>";
    }
    if (i.participantes && i.participantes.length) {
      h += '<div class="who"><span class="avs">' + i.participantes.slice(0, 4).map(function (p) {
        return '<span class="av">' + esc(iniciais(p)) + "</span>";
      }).join("") + "</span><span>" + esc(i.participantes.join(", ")) + "</span></div>";
    }
    var longa = false;
    if (i.nota) {
      longa = i.nota.length > 95;
      h += '<p class="note' + (longa && !st.notas[i.id] ? " clamp" : "") + '">' + esc(i.nota) + "</p>";
    }
    var dec = (i.decisoes || []).map(A.decisao).filter(function (d) { return d && d.modo === "aberta"; })[0];
    var temFonte = (i.fontes && i.fontes.length) || (i.decisoes && i.decisoes.length);
    if (dec) h += '<button class="dec-chip" data-dec="' + dec.id + '">' + ICON("inbox", 15) + "<span>Decisão: " + esc(dec.titulo) + "</span>" + ICON("chevR", 15) + "</button>";
    if (temFonte || longa) {
      h += '<div class="ev-foot">';
      if (longa) h += '<button class="more" data-more="' + i.id + '">' + (st.notas[i.id] ? "ver menos" : "ver mais") + "</button>";
      if (temFonte) h += '<button class="src" data-src="' + i.id + '">' + ICON("book", 14) + "fontes</button>";
      h += "</div>";
    }
    return h + "</div></div>";
  }

  function embarque(i, agoraAqui) {
    var v = plano.voo, ida = i.dia === INICIO;
    var via = (v.rota || "").split("-").slice(1, -1);
    var de, para, sai, chega, cod;
    if (ida) {
      de = "GRU"; para = v.chega_em; sai = v.partida_gru.slice(11, 16); chega = v.chegada.slice(11, 16) + " +1";
      cod = (v.ida || "").split(" ")[0];
    } else {
      de = v.chega_em; para = "GRU"; sai = v.partida_volta.slice(11, 16);
      var m2 = /GRU\s+(\d{2}:\d{2})(\(\+1\))?/.exec(v.volta || "");
      chega = m2 ? m2[1] + (m2[2] ? " +1" : "") : "";
      cod = ((v.volta || "").match(/[A-Z]{2}-\d+/) || [v.companhia])[0];
      via = via.reverse();
    }
    return '<div class="ev-top">' + ICON("plane", 16) + "<span>Voo · " + esc(v.companhia) + "</span>" +
      (agoraAqui ? '<span class="now-tag">agora</span>' : "") + "<em>" + esc(cod) + "</em></div>" +
      '<div class="bp"><div><b>' + esc(de) + '</b><i class="tnum">' + esc(sai) + "</i></div>" +
      '<div class="bp-mid"><span class="bp-l"></span>' + ICON("plane", 18) + '<span class="bp-l"></span>' +
      "<small>" + (via.length ? "via " + esc(via.join(", ")) : "direto") + "</small></div>" +
      '<div class="r"><b>' + esc(para) + '</b><i class="tnum">' + esc(chega) + "</i></div></div>";
  }

  // tons do petroleo, do mais escuro ao mais claro
  function tom(k, n) {
    var a = [13, 64, 81], b = [150, 190, 203];
    var f = n <= 1 ? 0 : k / (n - 1);
    return "rgb(" + a.map(function (x, j) { return Math.round(x + (b[j] - x) * f); }).join(",") + ")";
  }

  function linhaMove(i, agoraAqui) {
    var total = i.fim ? U.dur(i.inicio, i.fim) : 0;
    var aberto = !!st.abertos[i.id];
    var comp = i.componentes || [];
    var resumo = comp.length ? comp[0].rotulo.split(",")[0].split("(")[0].split(":")[0].trim() : "";
    var longo = total >= 45 && comp.length > 1;
    var h = '<div class="row mv' + (aberto ? " open" : "") + (longo ? " long" : "") + (agoraAqui ? " now" : "") + '" id="it-' + i.id + '">';
    h += '<div class="tcol"><i class="tnum">' + esc(i.inicio) + "</i></div>";
    h += '<div class="rail"><span class="mv-ico">' + ICON(modal(i), 14) + "</span></div>";
    h += '<div class="mv-body"><button class="mv-hd" data-move="' + i.id + '" aria-expanded="' + aberto + '">' +
      '<span class="mv-t"><b>' + esc(seta(i.titulo)) + "</b>" +
      "<span>" + U.fmtDur(total) + (comp.length > 1 ? " · " + comp.length + " etapas" : resumo ? " · " + esc(resumo) : "") + "</span></span>" +
      (agoraAqui ? '<span class="now-tag">agora</span>' : "") +
      '<span class="chev' + (aberto ? " up" : "") + '">' + ICON("chevD", 16) + "</span></button>";
    if (longo) {
      h += '<div class="stack" role="img" aria-label="' + esc(comp.map(function (c) { return c.minutos + " min " + c.rotulo; }).join(", ")) + '">' +
        '<div class="stack-bar">' + comp.map(function (c, k) {
          return '<span style="flex:' + c.minutos + ";background:" + tom(k, comp.length) + '" title="' + esc(c.rotulo + ": " + c.minutos + " min") + '"></span>';
        }).join("") + '</div><b class="tnum">' + U.fmtDur(total) + "</b></div>";
    }
    if (aberto && comp.length) {
      h += '<ul class="mv-parts">' + comp.map(function (c, k) {
        return '<li><span class="sw" style="background:' + (longo ? tom(k, comp.length) : "var(--brand)") + '"></span><span>' +
          esc(seta(c.rotulo)) + '</span><u class="tnum">' + c.minutos + " min</u></li>";
      }).join("") + "</ul>";
      if (i.nota) h += '<p class="mv-note">' + esc(i.nota) + "</p>";
      if (i.fontes && i.fontes.length) h += '<button class="src" data-src="' + i.id + '">' + ICON("book", 14) + "fontes</button>";
    }
    return h + "</div></div>";
  }

  // ---------------- INBOX ----------------
  function inbox() {
    var abertas = A.decisoes.filter(function (d) { return d.modo === "aberta"; });
    var pend = abertas.filter(function (d) { return !st.escolhas[d.chave]; });
    var resp = abertas.filter(function (d) { return st.escolhas[d.chave]; });

    var h = '<div class="ib-top"><h2 class="screen-t">' + (pend.length ? "Esperando você decidir" : "Tudo decidido") + "</h2>" +
      '<p class="ib-prog"><b>' + resp.length + " de " + abertas.length + "</b> decididas</p>" +
      '<div class="pbar light"><div style="width:' + (resp.length / abertas.length * 100) + '%"></div></div>';
    if (!pend.length) h += '<p class="hint">O roteiro já reflete as seis escolhas.</p>';
    if (resp.length) h += '<button class="btn ghost sm" id="resetAll">' + ICON("undo", 16) + "Voltar ao recomendado</button>";
    $("inboxTop").innerHTML = h + "</div>";

    $("pending").innerHTML = pend.map(cardAberta).join("");
    $("answered").innerHTML = resp.length ? '<h2 class="sec">Você já decidiu</h2>' + resp.map(cardRespondida).join("") : "";
    var autos = A.decisoes.filter(function (d) { return d.modo === "auto"; });
    $("autosHd").textContent = "O sistema decidiu por você (" + autos.length + ")";
    $("autos").innerHTML = autos.map(cardAuto).join("");
    $("autosWrap").querySelector(".chev-d").innerHTML = ICON("chevD", 18);
  }

  function cardAberta(d) {
    var h = '<div class="card dec" id="dec-' + d.id + '">';
    h += '<p class="dec-sub">' + esc(d.grupo || "") + (d.grupo ? " · " : "") + esc(d.titulo) + "</p>";
    h += '<h3 class="dec-q">' + esc(d.pergunta) + "</h3>";
    h += '<div class="why"><b>Por que você decide</b>' + esc(d.porque_voce_decide) + "</div>";

    if (d.conflito && d.conflito.length) {
      h += '<p class="mini-h">Os dois documentos que divergem</p><div class="conf-g">';
      h += d.conflito.map(function (c) {
        // c.ev as vezes aponta para uma fonte, nao para uma evidencia: pega o primeiro trecho lido dela
        var ev = A.evidencia(c.ev);
        if (!ev) ev = A.evidencias.filter(function (x) { return x.fonte === (c.ev || c.fonte); })[0];
        var f = A.fonte(c.fonte);
        var x = '<div class="conf-i">';
        if (f) x += '<span class="tag ' + slug(f.tipo) + '">' + esc(f.tipo) + "</span>";
        x += "<cite>" + esc(c.rotulo) + "</cite>";
        if (ev) x += "<q>" + esc(ev.trecho) + "</q>";
        if (f) x += isUrl(f.referencia)
          ? '<a class="ref" href="' + esc(f.referencia) + '" target="_blank" rel="noopener">' + esc(f.referencia) + "</a>"
          : '<code class="ref">' + esc(f.referencia) + "</code>";
        return x + "</div>";
      }).join("");
      h += "</div>";
    }

    h += '<p class="mini-h">Suas opções</p><div class="opts">' + d.opcoes.map(function (o) { return optBtn(d, o); }).join("") + "</div>";

    if (d.politica) h += '<div class="note-box">' + ICON("shield", 16) + "<span><b>Política 4.2.</b> " + esc(d.politica) + "</span></div>";
    if (d.descartadas && d.descartadas.length) {
      h += '<details class="disc"><summary>Também olhei e descartei (' + d.descartadas.length + ")" + ICON("chevD", 16) + "</summary>";
      h += d.descartadas.map(function (x) {
        return '<div class="disc-i"><b>' + esc(x.opcao) + "</b><span>" + esc(x.motivo) + "</span></div>";
      }).join("") + "</details>";
    }
    return h + "</div>";
  }

  function optBtn(d, o) {
    var atual = st.escolhas[d.chave] === o.valor;
    var h = '<button class="opt' + (atual ? " on" : "") + '" data-set="' + d.chave + '" data-val="' + esc(o.valor) + '" aria-pressed="' + atual + '">';
    h += '<div class="opt-h"><b>' + cod(esc(o.rotulo)) + "</b>";
    if (o.recomendada) h += '<span class="rec">recomendado</span>';
    h += '<span class="opt-ck">' + ICON("check", 16) + "</span></div>";
    if (o.sub) h += '<p class="opt-sub">' + esc(o.sub) + "</p>";
    h += '<ul class="pc">';
    (o.a_favor || []).forEach(function (t) { h += '<li class="y">' + ICON("check", 15) + "<span>" + esc(t) + "</span></li>"; });
    (o.contra || []).forEach(function (t) { h += '<li class="n">' + ICON("x", 15) + "<span>" + esc(t) + "</span></li>"; });
    h += "</ul>";
    if (o.guardas && o.guardas.length) {
      h += '<div class="guards-note"><b>Se escolher, combinado que</b><ul>' +
        o.guardas.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + "</ul></div>";
    }
    h += impacto(d, o);
    return h + "</button>";
  }

  // o que muda se essa opcao for escolhida: itens tocados + delta de custo + travas
  function impacto(d, o) {
    if (st.escolhas[d.chave] === o.valor) return "";
    var base = plano;
    var hip = {}; for (var k in st.escolhas) hip[k] = st.escolhas[k];
    hip[d.chave] = o.valor;
    var p2 = A.planejar(hip);

    var a = {}; base.itens.forEach(function (i) { a[i.dia + i.inicio + i.titulo] = 1; });
    var mudou = p2.itens.filter(function (i) { return !a[i.dia + i.inicio + i.titulo]; }).length;
    var dc = p2.custos.total - base.custos.total;
    var dg = p2.guardas_ok - base.guardas_ok;

    var partes = [];
    if (mudou) partes.push("<span>Muda " + mudou + " " + (mudou > 1 ? "itens" : "item") + " do roteiro</span>");
    if (dc) partes.push("<span><b>" + (dc > 0 ? "+" : "−") + eur(Math.abs(dc)) + "</b></span>");
    if (dg < 0) partes.push('<span class="bad">quebra ' + (-dg) + " trava" + (-dg > 1 ? "s" : "") + "</span>");
    else if (dg > 0) partes.push('<span class="good">conserta ' + dg + " trava" + (dg > 1 ? "s" : "") + "</span>");
    if (!partes.length) return "";
    return '<div class="impact">' + partes.join("<i>·</i>") + "</div>";
  }

  function cardRespondida(d) {
    var o = d.opcoes.filter(function (x) { return x.valor === st.escolhas[d.chave]; })[0] || {};
    return '<div class="card done" id="dec-' + d.id + '"><span class="check">' + ICON("check", 16) + "</span>" +
      "<div><b>" + esc(d.titulo) + "</b><span>" + esc(o.rotulo || st.escolhas[d.chave]) + (o.sub ? " · " + esc(o.sub) : "") + "</span></div>" +
      '<button class="swap" data-clear="' + d.chave + '">trocar</button></div>';
  }

  function cardAuto(d) {
    var h = '<details class="card auto-i"><summary><span class="pick">' + ICON("check", 15) + "</span>" +
      "<span><b>" + esc(d.titulo) + "</b><small>" + esc(d.grupo || "") + "</small></span>" + ICON("chevD", 16) + "</summary>";
    h += '<p class="just">' + esc(d.justificativa) + "</p>";
    if (d.detalhes && d.detalhes.length) {
      h += '<ul class="det">' + d.detalhes.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    }
    if (d.alerta) h += '<div class="guards-note"><b>Atenção</b>' + esc(d.alerta) + "</div>";
    if (d.descartadas && d.descartadas.length) {
      h += '<p class="mini-h">Descartadas</p>' + d.descartadas.map(function (x) {
        return '<div class="disc-i"><b>' + esc(x.opcao) + "</b><span>" + esc(x.motivo) + "</span></div>";
      }).join("");
    }
    if (d.metodo) h += '<span class="method">decidido por ' + esc(d.metodo) + "</span>";
    return h + "</details>";
  }

  // ---------------- CUSTOS ----------------
  // cor pela categoria, nunca pela posicao: se a ordem virar, Voo continua --c1
  var COR_CAT = { voo: "var(--c1)", refeicoes: "var(--c2)", hospedagem: "var(--c3)", deslocamento: "var(--c4)" };
  function corCat(nome) { return COR_CAT[slug(nome)] || "var(--text-faint)"; }

  function custos() {
    var c = plano.custos;
    var nEst = c.linhas.filter(function (l) { return l.estimado; }).length;
    $("totalBox").innerHTML = '<div class="total"><span class="total-k">Total da viagem</span>' +
      '<b class="tnum"><small>EUR</small>' + Number(c.total).toLocaleString("pt-BR") + "</b>" +
      "<span>" + esc(plano.voo.companhia) + " · 4 noites em Villepinte · " + nEst + " valores estimados</span></div>";

    $("compBox").innerHTML = '<p class="mini-h" style="margin-top:0">Por categoria</p>' +
      '<div class="comp" role="img" aria-label="' + esc(c.categorias.map(function (x) { return x.nome + " " + eur(x.total); }).join(", ")) + '">' +
      c.categorias.map(function (cat) {
        return '<span style="flex:' + cat.total + ";background:" + corCat(cat.nome) + '" title="' + esc(cat.nome + " " + eur(cat.total)) + '"></span>';
      }).join("") + "</div>" +
      '<div class="legend">' + c.categorias.map(function (cat) {
        var pc = Math.round(cat.total / c.total * 100);
        return '<div class="lg" data-cat="' + slug(cat.nome) + '"><span class="sw" style="background:' + corCat(cat.nome) + '"></span>' +
          "<b>" + esc(cat.nome) + '</b><u class="tnum">' + eur(cat.total) + '</u><i class="tnum">' + pc + "%</i></div>";
      }).join("") + "</div>";

    $("costLines").innerHTML = c.categorias.map(function (cat) {
      return '<details class="card grp"><summary><span class="sw" style="background:' + corCat(cat.nome) + '"></span>' +
        "<b>" + esc(cat.nome) + '</b><u class="tnum">' + eur(cat.total) + "</u>" + ICON("chevD", 16) + "</summary>" +
        cat.itens.map(function (l) {
          return '<div class="line"><span>' + esc(l.rotulo) +
            (l.nota ? "<small>" + esc(l.nota) + "</small>" : "") +
            (l.estimado ? '<span class="est">estimado</span>' : "") +
            '</span><u class="tnum">' + eur(l.eur) + "</u></div>";
        }).join("") + "</details>";
    }).join("");

    var ht = plano.hotel, teto = A.politica.hotel_teto_eur, dentro = ht.diaria_eur <= teto;
    $("policyBox").innerHTML =
      '<div class="cap"><span>Diária do hotel</span><b class="tnum">' + eur(ht.diaria_eur) + "</b></div>" +
      '<div class="cap"><span>Teto da política 4.2</span><b class="tnum">' + eur(teto) + "</b></div>" +
      '<div class="meter"><div style="width:' + (ht.diaria_eur / teto * 100) + "%;background:" + (dentro ? "var(--ok)" : "var(--crit)") + '"></div></div>' +
      '<p class="st-line ' + (dentro ? "ok" : "bad") + '">' + ICON(dentro ? "check" : "alert", 16) + "<span>" +
      (dentro ? "Dentro do teto, com EUR " + (teto - ht.diaria_eur) + " de margem por noite. Não precisa do comitê."
        : "Acima do teto: exigiria aprovação prévia do comitê, que não se reúne durante a viagem.") + "</span></p>";

    $("nGuards").textContent = plano.guardas.length;
    if (st.orcamento) orcamento(st.orcamento);
  }

  function todasCombinacoes() {
    var combos = [{}];
    A.decisoes.filter(function (d) { return d.modo === "aberta"; }).forEach(function (d) {
      var novo = [];
      d.opcoes.forEach(function (o) {
        combos.forEach(function (c) {
          var x = {}; for (var k in c) x[k] = c[k];
          x[d.chave] = o.valor; novo.push(x);
        });
      });
      combos = novo;
    });
    return combos.map(function (c) {
      var p = A.planejar(c);
      return { c: c, total: p.custos.total, ok: p.guardas_ok, n: p.guardas.length, p: p };
    }).sort(function (a, b) { return a.total - b.total; });
  }

  function diffEscolhas(combo) {
    return A.decisoes.filter(function (d) { return d.modo === "aberta"; })
      .filter(function (d) { return combo[d.chave] !== A.padroes[d.chave]; })
      .map(function (d) {
        var de = d.opcoes.filter(function (o) { return o.valor === A.padroes[d.chave]; })[0] || {};
        var pa = d.opcoes.filter(function (o) { return o.valor === combo[d.chave]; })[0] || {};
        return "<li><b>" + esc(d.titulo) + "</b><br>" + esc(de.rotulo || "") +
          '<span class="arrw">→</span>' + esc(pa.rotulo || "") + "</li>";
      });
  }

  function pct(de, para) {
    return (Math.round((de - para) / de * 1000) / 10).toString().replace(".", ",");
  }

  /* Modo orcamento. Tres respostas possiveis, e a honesta importa mais que a otimista:
     1. o teto cabe com o plano limpo;
     2. o teto so cabe quebrando trava - entao diz o preco exato de forcar;
     3. o teto e maior que o plano recomendado. */
  function orcamento(teto) {
    var out = $("budgetOut");
    var todas = todasCombinacoes();
    var limpas = todas.filter(function (r) { return r.ok === r.n; });
    var base = A.planejar({});
    var maisBarataLimpa = limpas[0];
    var nTravas = base.guardas.length;

    if (teto >= base.custos.total) {
      out.innerHTML = '<div class="res ok">' + ICON("check", 18) + "<div><b>Esse teto já cabe.</b>" +
        "<p>O plano recomendado custa " + eur(base.custos.total) + ", dentro do teto de " + eur(teto) +
        ", com as " + nTravas + " travas de pé. Nada precisa ser sacrificado.</p></div></div>";
      return;
    }

    var limpasNoTeto = limpas.filter(function (r) { return r.total <= teto; });
    if (limpasNoTeto.length) {
      var m1 = limpasNoTeto[0];
      var sac = diffEscolhas(m1.c);
      out.innerHTML = '<div class="res ok">' + ICON("check", 18) + "<div>" +
        "<b>Cabe em " + eur(m1.total) + ", com as " + nTravas + " travas de pé.</b>" +
        "<p>São " + eur(base.custos.total - m1.total) + " menos que o plano recomendado (" + eur(base.custos.total) +
        "), ou −" + pct(base.custos.total, m1.total) + "%.</p>" +
        (sac.length ? '<p class="mini-h">O que muda</p><ul class="sac">' + sac.join("") + "</ul>" : "") +
        '<div class="btn-row"><button class="btn" data-apply="limpo">Aplicar essa combinação</button></div></div></div>';
      out.querySelector("[data-apply]").onclick = function () {
        st.escolhas = m1.c; salvar(); st.orcamento = null; render(); go("roteiro");
      };
      return;
    }

    var noTeto = todas.filter(function (r) { return r.total <= teto; });
    var forcada = noTeto[0];

    var h = '<div class="res bad">' + ICON("alert", 18) + "<div>";
    h += "<b>Nesse teto não dá, e vale dizer por quê.</b>";
    h += "<p>Testei as " + todas.length + " combinações possíveis das seis decisões. Nenhuma chega a " + eur(teto) +
      " mantendo as " + nTravas + " travas de pé.</p>";
    if (maisBarataLimpa) {
      h += '<div class="impact solo">O plano mais barato que <b>não quebra nada</b> custa <b>' + eur(maisBarataLimpa.total) +
        "</b>, ou −" + pct(base.custos.total, maisBarataLimpa.total) + "% sobre o recomendado.</div>";
      var sac2 = diffEscolhas(maisBarataLimpa.c);
      if (sac2.length) h += '<p class="mini-h">Para chegar nele</p><ul class="sac">' + sac2.join("") + "</ul>";
    }
    if (forcada) {
      var quebradas = forcada.p.guardas.filter(function (g) { return !g.ok; });
      h += '<p class="mini-h">Para chegar a ' + eur(teto) + " você teria que aceitar</p>";
      h += '<p class="hint" style="margin:0 0 7px">A combinação mais barata dentro do teto custa ' +
        eur(forcada.total) + " e quebra " + quebradas.length + ":</p>";
      h += '<ul class="sac">' + quebradas.map(function (g) {
        return '<li><b class="bad">' + esc(g.titulo) + "</b><br>" + esc(g.detalhe) + "</li>";
      }).join("") + "</ul>";
    }
    h += '<div class="btn-row">';
    if (maisBarataLimpa) h += '<button class="btn" data-apply="limpo">Aplicar o mais barato que fecha (' + eur(maisBarataLimpa.total) + ")</button>";
    h += "</div></div></div>";

    out.innerHTML = h;
    var b = out.querySelector('[data-apply="limpo"]');
    if (b) b.onclick = function () {
      st.escolhas = maisBarataLimpa.c; salvar(); st.orcamento = null; render(); go("roteiro");
    };
  }

  // ---------------- FONTES ----------------
  function fontes() {
    var falhas = plano.guardas.length - plano.guardas_ok;
    var SEGS = [
      ["fontes", "Fontes", A.fontes.length],
      ["divs", "Divergências", A.divergencias.length],
      ["uncs", "Incertezas", A.incertezas.length],
      ["travas", "Travas", plano.guardas_ok + "/" + plano.guardas.length]
    ];
    $("seg").innerHTML = SEGS.map(function (s) {
      return '<button data-seg="' + s[0] + '" role="tab" aria-selected="' + (st.seg === s[0]) + '" class="' + (st.seg === s[0] ? "on" : "") +
        (s[0] === "travas" && falhas ? " bad" : "") + '">' + s[1] + "<small>" + s[2] + "</small></button>";
    }).join("");
    ["fontes", "divs", "uncs", "travas"].forEach(function (k) { $("p-" + k).hidden = st.seg !== k; });

    var ROTULO = {
      corpus: ["Material da Aqua", "Arquivos do repositório. Mandam em preço, disponibilidade e condições."],
      web: ["Web pública", "Verificado na internet, com data e hora da consulta."],
      mapa: ["Rotas medidas", "Distância, rota e tempo buscados no mundo real, como o desafio pede."],
      suposicao: ["Suposição", "Não achei fonte. Está assumido e marcado como tal."]
    };
    var ORDEM = ["corpus", "web", "mapa", "suposicao"];
    // os grupos saem dos dados: se aparecer um tipo novo, ele aparece aqui
    var tipos = [];
    A.fontes.forEach(function (f) { if (tipos.indexOf(f.tipo) < 0) tipos.push(f.tipo); });
    tipos.sort(function (a, b) {
      var ia = ORDEM.indexOf(slug(a)), ib = ORDEM.indexOf(slug(b));
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

    $("sources").innerHTML = tipos.map(function (tipo) {
      var fs = A.fontes.filter(function (f) { return f.tipo === tipo; });
      var cls = slug(tipo), r = ROTULO[cls] || [tipo, ""];
      return '<div class="card f-grp"><div class="f-h"><span class="tag ' + cls + '">' + esc(r[0]) + "</span><b>" + fs.length + "</b></div>" +
        '<p class="hint" style="margin:0 0 4px">' + esc(r[1]) + "</p>" +
        fs.map(function (f) {
          return '<div class="f-i"><b>' + esc(f.rotulo || f.id) + "</b>" +
            (isUrl(f.referencia)
              ? '<a href="' + esc(f.referencia) + '" target="_blank" rel="noopener">' + esc(f.referencia) + "</a>"
              : "<code>" + esc(f.referencia) + "</code>") +
            (f.consultado_em ? "<i>" + esc(f.consultado_em.replace("T", " ").slice(0, 16)) + "</i>" : "") + "</div>";
        }).join("") + "</div>";
    }).join("");

    $("divs").innerHTML = A.divergencias.map(function (v) {
      var usouCorpus = v.usada === "corpus";
      return '<div class="card dv"><div class="dv-h"><h3>' + esc(v.tema) + "</h3>" +
        (v.impacto ? '<span class="imp ' + esc(v.impacto) + '">impacto ' + esc(v.impacto) + "</span>" : "") + '</div><div class="dv-g">' +
        '<div class="dv-c' + (usouCorpus ? " used" : "") + '"><b>O material diz' + (usouCorpus ? " · usei esta" : "") + "</b><p>" + esc(v.corpus_diz) + "</p></div>" +
        '<div class="dv-c' + (!usouCorpus ? " used" : "") + '"><b>A web diz' + (!usouCorpus ? " · usei esta" : "") + "</b><p>" + esc(v.web_diz) + "</p></div></div>" +
        '<p class="just">' + esc(v.justificativa) + "</p>" +
        (v.evidencia ? '<button class="chip" data-ev="' + v.evidencia + '">' + ICON("book", 15) + "ver o trecho lido</button>" : "") + "</div>";
    }).join("");

    $("uncs").innerHTML = A.incertezas.map(function (u) {
      var h = '<div class="card unc"><span class="tag ' + (u.tipo === "stakeholder" ? "corpus" : "mapa") + '">' +
        (u.tipo === "stakeholder" ? "só a pessoa responde" : "pesquisável") + "</span><h3>" + esc(u.descricao) + "</h3>";
      if (u.pergunta) h += '<div class="ask"><b>Pergunta ao CEO ou à secretaria</b>' + esc(u.pergunta) + "</div>";
      h += '<p class="kv"><b>Assumi que</b>' + esc(u.suposicao_adotada) + "</p>";
      if (u.proxima_verificacao) h += '<p class="kv"><b>Reconferir</b>' + esc(u.proxima_verificacao) + "</p>";
      if (u.horizonte_da_fonte) {
        var f = A.fonte(u.fonte_horizonte);
        h += '<p class="kv"><b>A fonte informa até</b>' + esc(u.horizonte_da_fonte) + (f ? " (" + esc(f.rotulo) + ")" : "") + "</p>";
      }
      return h + "</div>";
    }).join("");

    $("guards").innerHTML = plano.guardas.map(function (g) {
      return '<div class="g-i ' + (g.ok ? "y" : "n") + '" id="g-' + g.id + '">' +
        '<span class="g-ico">' + ICON(g.ok ? "check" : "x", 15) + '<span class="sr">' + (g.ok ? "passa" : "falha") + "</span></span>" +
        "<div><b>" + esc(g.titulo) + "</b><span>" + esc(g.detalhe) + "</span></div></div>";
    }).join("");
  }

  // ---------------- sheet ----------------
  function abrirSheet(titulo, html) {
    $("sheetTitle").textContent = titulo;
    $("sheetBody").innerHTML = html;
    $("sheet").style.transform = "";
    $("sheetBg").classList.add("on");
    $("sheet").classList.add("on");
    $("sheetBody").scrollTop = 0;
    document.body.classList.add("lock");
  }
  function fecharSheet() {
    $("sheetBg").classList.remove("on");
    $("sheet").classList.remove("on");
    $("sheet").style.transform = "";
    document.body.classList.remove("lock");
  }

  function sheetFontes(itemId) {
    var i = plano.itens.filter(function (x) { return x.id === itemId; })[0];
    if (!i) return;
    var h = "";
    (i.fontes || []).forEach(function (f) { h += fonteHtml(f); });
    (i.decisoes || []).forEach(function (did) {
      var d = A.decisao(did);
      if (!d) return;
      h += '<div class="ev-src"><div class="hd"><span class="tag mapa">decisão</span>' +
        "<b>" + esc(d.titulo) + "</b></div><q>" + esc(d.justificativa || d.porque_voce_decide || "") + "</q>" +
        '<span class="path">' + esc(d.id) + " · " + esc(d.modo === "auto" ? "decidida pelo sistema" : "sua escolha no Inbox") + "</span></div>";
    });
    if (i.ref_compromisso) {
      var c = A.compromissos.filter(function (x) { return x.id === i.ref_compromisso; })[0];
      if (c) h += '<div class="ev-src"><div class="hd"><span class="tag corpus">agenda</span>' +
        "<b>Já estava na agenda dele</b></div><q>" + esc(c.titulo) + (c.nota ? " — " + esc(c.nota) : "") +
        '</q><span class="path">dados/agenda-ceo.md · ' + esc(c.id) + "</span></div>";
    }
    abrirSheet("De onde veio", h || '<p class="hint">Sem fonte registrada.</p>');
  }

  function sheetFato() {
    var h = '<p class="hint" style="margin-top:0">Injete um fato e veja o plano reagir. ' +
      "Nada aqui é desfeito sozinho: o que você aplicar fica, e o Roteiro reflete na hora.</p>";
    var F = [
      ["af", "plane", "Air France cancelou o voo de 17/10", "a greve de 17 a 21 se confirmou na transportadora francesa"],
      ["atraso90", "clock", "O voo vai atrasar 90 min", "recalcula a folga da sessão de abertura"],
      ["atraso30", "clock", "O voo vai atrasar 30 min", "o caso de limite"],
      ["orc", "wallet", "O orçamento caiu 20%", "acha a combinação mais barata que ainda passa nas travas"],
      ["zerar", "undo", "Limpar os fatos novos", "volta ao plano recomendado"]
    ];
    h += F.map(function (f) {
      return '<button class="fact-b" data-fato="' + f[0] + '"><span class="fact-i">' + ICON(f[1], 18) + "</span>" +
        "<span><b>" + f[2] + "</b><span>" + f[3] + "</span></span>" + ICON("chevR", 16) + "</button>";
    }).join("");
    h += '<div id="deltaOut"></div>';
    abrirSheet("Fato novo", h);
  }

  // aplica o fato e descreve preservado / mudou / quebrou
  function aplicarFato(tipo) {
    var antes = A.planejar(st.escolhas), antesAtraso = st.atraso;
    var titulo = "", nota = "";

    if (tipo === "af") {
      st.escolhas.voo = "VOO-B"; salvar();
      titulo = "Air France cancelada";
      nota = "Troquei para a LATAM LA-8022, que não está no aviso de greve.";
    } else if (tipo === "atraso90") {
      st.atraso = 90; titulo = "Atraso de 90 min"; st.dia = "2026-10-17";
    } else if (tipo === "atraso30") {
      st.atraso = 30; titulo = "Atraso de 30 min"; st.dia = "2026-10-17";
    } else if (tipo === "orc") {
      st.orcamento = Math.round(antes.custos.total * 0.8);
      titulo = "Orçamento reduzido para " + eur(st.orcamento);
      nota = "O resultado está na aba Custos, em Modo orçamento.";
    } else if (tipo === "zerar") {
      st.escolhas = {}; st.atraso = 0; st.orcamento = null; salvar();
      titulo = "Fatos limpos";
    }

    render();
    var depois = plano;
    var manteve = [], mudou = [], quebrou = [];
    A.decisoes.filter(function (d) { return d.modo === "aberta"; }).forEach(function (d) {
      if (antes.escolhas[d.chave] === depois.escolhas[d.chave]) manteve.push(d.titulo);
      else {
        var de = d.opcoes.filter(function (o) { return o.valor === antes.escolhas[d.chave]; })[0] || {};
        var pa = d.opcoes.filter(function (o) { return o.valor === depois.escolhas[d.chave]; })[0] || {};
        mudou.push(d.titulo + ": " + (de.rotulo || "?") + " → " + (pa.rotulo || "?"));
      }
    });
    if (antes.custos.total !== depois.custos.total) {
      mudou.push("Custo total: " + eur(antes.custos.total) + " → " + eur(depois.custos.total));
    }
    depois.guardas.forEach(function (g) {
      var a = antes.guardas.filter(function (x) { return x.id === g.id; })[0];
      if (a && a.ok && !g.ok) quebrou.push(g.titulo + " — " + g.detalhe);
    });
    if (st.atraso !== antesAtraso && st.atraso) {
      var folga = depois.folga_abertura_min - st.atraso;
      if (folga < 0) quebrou.push("Sessão de abertura das 13:00 — perdida por " + U.fmtDur(-folga) +
        " (pronto às " + U.hm(U.m(depois.pronto_sabado) + st.atraso) + ")");
      else manteve.push("Sessão de abertura ainda de pé, com " + U.fmtDur(folga) + " de folga");
    }

    var out = $("deltaOut");
    if (!out) return;
    var h = '<div class="delta"><div class="delta-hd"><b>' + esc(titulo) + "</b>" +
      (nota ? "<p>" + esc(nota) + "</p>" : "") + "</div>";
    if (quebrou.length) h += grupo("brk", "Quebrou", quebrou);
    if (mudou.length) h += grupo("chg", "Mudou", mudou);
    h += grupo("keep", "Continua de pé (" + manteve.length + ")", manteve);
    out.innerHTML = h + "</div>";
    if (out.scrollIntoView) out.scrollIntoView({ block: "start", behavior: "smooth" });

    function grupo(cls, lbl, arr) {
      return '<div class="delta-g ' + cls + '"><b>' + lbl + "</b><ul>" +
        arr.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }
  }

  // ---------------- navegacao ----------------
  function go(v) {
    st.view = v;
    ["roteiro", "inbox", "custos", "fontes"].forEach(function (x) { $("v-" + x).classList.toggle("on", x === v); });
    document.querySelectorAll(".nav button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.v === v);
      if (b.dataset.v === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  function rolarPara(el, destacar) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    if (destacar) {
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 1500);
    }
  }

  // ---------------- eventos ----------------
  document.addEventListener("click", function (ev) {
    if (ev.target.closest("#sheetX") || ev.target.id === "sheetBg") { fecharSheet(); return; }
    if (ev.target.closest("#factBtn")) { sheetFato(); return; }
    if (ev.target.closest("#healthBtn")) {
      st.seg = "travas"; fontes(); go("fontes");
      var ruim = plano.guardas.filter(function (g) { return !g.ok; })[0];
      setTimeout(function () { rolarPara($(ruim ? "g-" + ruim.id : "guards"), !!ruim); }, 60);
      return;
    }
    if (ev.target.closest("#resetAll")) { st.escolhas = {}; st.atraso = 0; st.orcamento = null; salvar(); render(); return; }
    if (ev.target.id === "budgetGo") {
      var v = parseInt($("budgetIn").value, 10);
      if (v > 0) { st.orcamento = v; orcamento(v); }
      return;
    }
    if (ev.target.id === "budget20") {
      var teto = Math.round(plano.custos.total * 0.8);
      $("budgetIn").value = teto; st.orcamento = teto; orcamento(teto);
      return;
    }
    if (ev.target.id === "budgetClr") { st.orcamento = null; $("budgetIn").value = ""; $("budgetOut").innerHTML = ""; return; }

    var t = ev.target.closest("[data-v],[data-d],[data-move],[data-src],[data-set],[data-clear],[data-fato],[data-ev],[data-al],[data-more],[data-dec],[data-go],[data-seg]");
    if (!t) return;
    var ds = t.dataset;

    if (ds.v) { go(ds.v); return; }
    if (ds.d) { st.dia = ds.d; roteiro(); return; }
    if (ds.go) {
      st.dia = ds.gd; roteiro();
      setTimeout(function () { rolarPara($("it-" + ds.go), true); }, 30);
      return;
    }
    if (ds.move) { st.abertos[ds.move] = !st.abertos[ds.move]; roteiro(); return; }
    if (ds.al) { st.alertasAbertos[ds.al] = !st.alertasAbertos[ds.al]; roteiro(); return; }
    if (ds.more) { st.notas[ds.more] = !st.notas[ds.more]; roteiro(); return; }
    if (ds.seg) { st.seg = ds.seg; fontes(); window.scrollTo(0, 0); return; }
    if (ds.src) { sheetFontes(ds.src); return; }
    if (ds.dec) {
      go("inbox");
      setTimeout(function () { rolarPara($("dec-" + ds.dec), true); }, 40);
      return;
    }
    if (ds.ev) {
      var e2 = A.evidencia(ds.ev);
      abrirSheet("Trecho lido", e2 ? fonteHtml(e2.fonte) : "");
      return;
    }
    if (ds.set) { st.escolhas[ds.set] = ds.val; salvar(); render(); return; }
    if (ds.clear) { delete st.escolhas[ds.clear]; salvar(); render(); return; }
    if (ds.fato) { aplicarFato(ds.fato); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("sheet").classList.contains("on")) fecharSheet();
  });

  // arrastar o sheet para baixo fecha
  (function () {
    var sh = $("sheet"), y0 = null, dy = 0;
    function ini(e) { y0 = e.touches[0].clientY; dy = 0; sh.classList.add("drag"); }
    function mov(e) {
      if (y0 == null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      sh.style.transform = "translateY(" + dy + "px)";
    }
    function fim() {
      if (y0 == null) return;
      sh.classList.remove("drag");
      if (dy > 90) fecharSheet(); else sh.style.transform = "";
      y0 = null;
    }
    [$("sheetGrab"), sh.querySelector(".sheet-hd")].forEach(function (el) {
      el.addEventListener("touchstart", ini, { passive: true });
      el.addEventListener("touchmove", mov, { passive: true });
      el.addEventListener("touchend", fim);
    });
  })();

  // ---------------- boot ----------------
  document.querySelectorAll("[data-i]").forEach(function (el) { el.innerHTML = ICON(el.dataset.i, 22); });
  $("factBtn").innerHTML = ICON("zap", 20) + '<span class="sr">Fato novo</span>';
  $("sheetX").innerHTML = ICON("x", 20);
  render();
  go("roteiro");
})();
