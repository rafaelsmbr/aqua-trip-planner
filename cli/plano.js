#!/usr/bin/env node
/* Gera o plano fora do navegador: saida/plano.json (no schema da entrega) e saida/PLANO.md.
   Mesmo motor que a interface usa. Uso:
     node cli/plano.js
     node cli/plano.js --set voo=VOO-B --set lille=remoto
     node cli/plano.js --fato fatos/exemplo-voo-cancelado.json
     node cli/plano.js --delta            (compara com o plano anterior e escreve o bloco delta)
     node cli/plano.js --validar          (so valida saida/plano.json e sai)
*/
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const RAIZ = path.resolve(__dirname, "..");

globalThis.window = globalThis;
["dados/fontes.js","dados/corpus.js","dados/decisoes.js","dados/deslocamentos.js","engine.js"]
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(RAIZ, f), "utf8"), { filename: f }));
const A = globalThis.AQUA;

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const escolhas = {};
let arquivoFato = null, querDelta = false, soValidar = false, fatoTexto = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--set") { const [k, v] = String(argv[++i]).split("="); escolhas[k] = v; }
  else if (argv[i] === "--fato") arquivoFato = argv[++i];
  else if (argv[i] === "--delta") querDelta = true;
  else if (argv[i] === "--validar") soValidar = true;
}
if (arquivoFato) {
  const f = JSON.parse(fs.readFileSync(path.resolve(RAIZ, arquivoFato), "utf8"));
  fatoTexto = f.fato_novo || null;
  Object.assign(escolhas, f.escolhas || {});
}

const SAIDA = path.join(RAIZ, "saida");
fs.mkdirSync(SAIDA, { recursive: true });
const DESTINO = path.join(SAIDA, "plano.json");

// ---------- helpers de tempo ----------
const OFFSET = { "America/Sao_Paulo": "-03:00", "Europe/Paris": "+02:00" }; // out/2026: Paris em CEST, SP sem horario de verao
const tzDoDia = {}; A.dias.forEach(d => tzDoDia[d.data] = d.tz);
function iso(dia, hhmm) {
  let d = dia, h = hhmm;
  const mais = /\(\+(\d)\)/.exec(h);
  if (mais) { h = h.replace(/\s*\(\+\d\)/, ""); d = somaDia(dia, +mais[1]); }
  return d + "T" + h + ":00" + OFFSET[tzDoDia[dia] || "Europe/Paris"];
}
function somaDia(dia, n) { const t = new Date(dia + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
function chegadaVolta(voo) {
  const mm = /GRU\s+(\d{2}:\d{2})\(\+1\)/.exec(voo.volta.replace(/\s*\(\+1\)/g, "(+1)"));
  const hora = mm ? mm[1] : "05:30";
  return somaDia("2026-10-21", 1) + "T" + hora + ":00-03:00";
}

// ---------- plano ----------
const P = A.planejar(escolhas);

// resolve de_item / para_item: o trecho comeca no item anterior e termina no proximo
const porDia = {}; P.itens.forEach(i => (porDia[i.dia] = porDia[i.dia] || []).push(i));
const vizinho = new Map();
Object.values(porDia).forEach(lista => {
  lista.forEach((it, k) => {
    if (it.tipo !== "deslocamento") return;
    const antes = lista.slice(0, k).reverse().find(x => x.tipo !== "deslocamento");
    const depois = lista.slice(k + 1).find(x => x.tipo !== "deslocamento");
    vizinho.set(it.id, {
      de: (antes || lista[Math.max(0, k - 1)] || it).id,
      para: (depois || lista[Math.min(lista.length - 1, k + 1)] || it).id
    });
  });
});

const itinerario = P.itens.map(i => {
  const o = { id: i.id, inicio: iso(i.dia, i.inicio), titulo: i.titulo, tipo: i.tipo };
  if (i.tipo === "voo") {
    const ida = i.titulo.indexOf("GRU ->") >= 0;
    o.inicio = ida ? P.voo.partida_gru : P.voo.partida_volta;
    o.fim = ida ? P.voo.chegada : chegadaVolta(P.voo);
  } else if (i.fim) o.fim = iso(i.dia, i.fim);
  if (i.local) o.local = i.local;
  if (i.participantes && i.participantes.length) o.participantes = i.participantes;
  if (i.decisoes && i.decisoes.length) o.decisoes = i.decisoes;
  if (i.ref) o.ref = i.ref;
  if (i.componentes) o.componentes = i.componentes.map(c => ({ rotulo: c.rotulo, minutos: c.minutos }));
  if (i.fontes && i.fontes.length) o.fontes = i.fontes;
  if (i.tipo === "deslocamento") {
    const v = vizinho.get(i.id) || {};
    o.de_item = v.de; o.para_item = v.para;
    if (!o.fontes || !o.fontes.length) o.fontes = ["F-019"];
  }
  if (i.nota) o.nota = i.nota;
  return o;
});

// deslocamentos[] no formato do schema (ids T-001...)
const deslocamentos = P.itens.filter(i => i.tipo === "deslocamento").map((i, k) => {
  const total = A.util.dur(i.inicio, i.fim);
  const d = {
    id: "T-" + ("00" + (k + 1)).slice(-3),
    origem: (i.local || "").split("->")[0].trim() || i.local || "n/d",
    destino: (i.local || "").split("->")[1] ? i.local.split("->")[1].trim() : (i.local || "n/d"),
    modal: (i.componentes[0] || {}).rotulo.replace(/,.*$/, "") || "misto",
    partida: iso(i.dia, i.inicio),
    duracao_min: total,
    fonte: (i.fontes && i.fontes[0]) || "F-019"
  };
  const ehPouso = /Pouso em CDG/.test(i.titulo);
  if (ehPouso) d.buffer = { componentes: i.componentes.map(c => c.rotulo + " (" + c.minutos + " min)"), total_min: total };
  return d;
});

const decisoes = A.decisoes.map(d => {
  const aberta = d.modo === "aberta";
  const valor = aberta ? P.escolhas[d.chave] : d.escolha;
  const opt = aberta ? (d.opcoes.find(o => o.valor === valor) || {}) : null;
  const o = {
    id: d.id,
    titulo: d.titulo,
    escolha: aberta ? (opt.rotulo || valor) + (opt.sub ? " (" + opt.sub + ")" : "") : d.escolha,
    justificativa: aberta
      ? (d.porque_voce_decide + " Escolha vigente: " + (opt.rotulo || valor) + ". A favor: " +
         (opt.a_favor || []).join("; ") + ". Contra: " + (opt.contra || []).join("; ") + ".")
      : d.justificativa,
    restricoes: d.restricoes || [],
    fontes: d.fontes || [],
    metodo: d.metodo || "misto"
  };
  const desc = (d.descartadas || []).concat(
    aberta ? d.opcoes.filter(x => x.valor !== valor).map(x => ({ opcao: x.rotulo, motivo: "Não escolhida. Contra: " + (x.contra || []).join("; ") })) : []);
  if (desc.length) o.alternativas_descartadas = desc;
  const ref = aberta ? opt.ref : d.ref;
  if (ref) o.selecao = { catalogo: ref.startsWith("VOO") ? "voos" : ref.startsWith("HOT") ? "hoteis" : "restaurantes", id: ref };
  const us = A.incertezas.filter(u => (u.pergunta || "") && d.chave && new RegExp(d.chave.split("_")[0], "i").test(u.descricao)).map(u => u.id);
  if (us.length) o.incertezas = us;
  return o;
});

const plano = {
  meta: {
    candidato: "Rafael Mendonça",
    gerado_em: new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00"),
    rodada: querDelta ? "delta" : "primeira",
    modelo_usado: "Nenhum em tempo de execução: o motor é determinístico (engine.js). O julgamento foi feito na curadoria do corpus e no catálogo de decisões, com Claude Code.",
    notas: "Plano gerado por " + path.relative(RAIZ, __filename) + ". Travas: " + P.guardas_ok + "/" + P.guardas.length +
           ". Escolhas: " + JSON.stringify(P.escolhas) + "."
  },
  decisoes,
  restricoes: A.restricoes.map(r => ({ id: r.id, descricao: r.descricao, origem: r.origem, tipo: r.tipo })),
  fontes: A.fontes.map(f => ({ id: f.id, tipo: f.tipo, referencia: f.referencia, consultado_em: f.consultado_em })),
  evidencias: A.evidencias.map(e => {
    const o = { id: e.id, fonte: e.fonte, trecho: e.trecho };
    if (e.endereco) o.endereco = e.endereco;
    if (e.acessado_em) o.acessado_em = e.acessado_em;
    return o;
  }),
  deslocamentos,
  incertezas: A.incertezas.map(u => {
    const o = { id: u.id, descricao: u.descricao, tipo: u.tipo, suposicao_adotada: u.suposicao_adotada };
    if (u.pergunta) o.pergunta = u.pergunta;
    if (u.horizonte_da_fonte) o.horizonte_da_fonte = u.horizonte_da_fonte;
    if (u.fonte_horizonte) o.fonte_horizonte = u.fonte_horizonte;
    if (u.proxima_verificacao) o.proxima_verificacao = u.proxima_verificacao;
    return o;
  }),
  divergencias: A.divergencias.map(v => ({
    id: v.id, corpus_diz: v.corpus_diz, web_diz: v.web_diz, usada: v.usada,
    justificativa: v.justificativa, evidencia: v.evidencia
  })),
  itinerario
};

// ---------- delta ----------
if (querDelta && fs.existsSync(DESTINO)) {
  const antes = JSON.parse(fs.readFileSync(DESTINO, "utf8"));
  const mapaAntes = new Map(antes.decisoes.map(d => [d.id, d]));
  const preservado = [], alterado = [];
  decisoes.forEach(d => {
    const a = mapaAntes.get(d.id);
    if (!a) return;
    if (a.escolha === d.escolha) preservado.push(d.id);
    else alterado.push({ decisao: d.id, antes: a.escolha, depois: d.escolha, motivo: fatoTexto || "Escolha trocada nesta rodada." });
  });
  const quebrado = P.guardas.filter(g => !g.ok).map(g => g.id + ": " + g.titulo + " - " + g.detalhe);
  plano.delta = { fato_novo: fatoTexto || "Rodada delta sem fato declarado.", preservado, alterado, quebrado };
}

// ============================ VALIDACAO ============================
function validar(p) {
  const erros = [];
  const fIds = new Set(p.fontes.map(f => f.id)), rIds = new Set(p.restricoes.map(r => r.id));
  const eIds = new Set(p.evidencias.map(e => e.id)), iIds = new Set(p.itinerario.map(i => i.id));
  const re = { D:/^D-\d{3}$/, R:/^R-\d{3}$/, F:/^F-\d{3}$/, E:/^E-\d{3}$/, U:/^U-\d{3}$/, I:/^I-\d{3}$/, T:/^T-\d{3}$/, V:/^V-\d{3}$/,
               sel:/^(VOO|HOT|RES)-[A-Z0-9]{1,3}$/, dt:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/ };

  ["meta","decisoes","restricoes","fontes","evidencias","incertezas","itinerario"].forEach(k => { if (!p[k]) erros.push("falta o bloco obrigatório: " + k); });
  ["candidato","gerado_em","rodada"].forEach(k => { if (!p.meta[k]) erros.push("meta." + k + " ausente"); });
  if (!["primeira","delta"].includes(p.meta.rodada)) erros.push("meta.rodada inválida");
  if (!re.dt.test(p.meta.gerado_em)) erros.push("meta.gerado_em não é ISO com fuso: " + p.meta.gerado_em);

  p.decisoes.forEach(d => {
    if (!re.D.test(d.id)) erros.push("decisão com id fora do padrão: " + d.id);
    ["titulo","escolha","justificativa"].forEach(k => { if (!d[k]) erros.push(d.id + ": " + k + " ausente"); });
    (d.restricoes || []).forEach(r => { if (!re.R.test(r)) erros.push(d.id + ": restrição fora do padrão " + r); else if (!rIds.has(r)) erros.push(d.id + ": restrição inexistente " + r); });
    (d.fontes || []).forEach(f => { if (!re.F.test(f)) erros.push(d.id + ": fonte fora do padrão " + f); else if (!fIds.has(f)) erros.push(d.id + ": fonte inexistente " + f); });
    (d.incertezas || []).forEach(u => { if (!re.U.test(u)) erros.push(d.id + ": incerteza fora do padrão " + u); });
    if (d.selecao) {
      if (!["voos","hoteis","restaurantes"].includes(d.selecao.catalogo)) erros.push(d.id + ": seleção.catálogo inválido");
      if (!re.sel.test(d.selecao.id)) erros.push(d.id + ": seleção.id fora do padrão " + d.selecao.id);
    }
    if (d.metodo && !["modelo","regra","misto"].includes(d.metodo)) erros.push(d.id + ": método inválido " + d.metodo);
  });

  p.restricoes.forEach(r => {
    if (!re.R.test(r.id)) erros.push("restrição com id fora do padrão: " + r.id);
    if (!["dura","preferencia","politica"].includes(r.tipo)) erros.push(r.id + ": tipo inválido " + r.tipo);
    if (!r.origem) erros.push(r.id + ": origem ausente");
  });

  p.fontes.forEach(f => {
    if (!re.F.test(f.id)) erros.push("fonte com id fora do padrão: " + f.id);
    if (!["corpus","web","mapa","suposicao"].includes(f.tipo)) erros.push(f.id + ": tipo inválido " + f.tipo);
    if (!f.referencia) erros.push(f.id + ": referência ausente");
  });

  // evidencia e obrigatoria para fonte do tipo web e mapa
  const comEvid = new Set(p.evidencias.map(e => e.fonte));
  p.fontes.filter(f => f.tipo === "web" || f.tipo === "mapa").forEach(f => {
    if (!comEvid.has(f.id)) erros.push(f.id + " (" + f.tipo + ") não tem nenhuma evidência lida");
  });
  p.evidencias.forEach(e => {
    if (!re.E.test(e.id)) erros.push("evidência com id fora do padrão: " + e.id);
    if (!fIds.has(e.fonte)) erros.push(e.id + ": aponta para fonte inexistente " + e.fonte);
    if (!e.trecho) erros.push(e.id + ": trecho vazio");
  });

  p.incertezas.forEach(u => {
    if (!re.U.test(u.id)) erros.push("incerteza com id fora do padrão: " + u.id);
    if (!["pesquisavel","stakeholder"].includes(u.tipo)) erros.push(u.id + ": tipo inválido");
    if (!u.suposicao_adotada) erros.push(u.id + ": suposição_adotada ausente");
    // regra allOf do schema: horizonte ou proxima_verificacao exigem fonte_horizonte
    if ((u.horizonte_da_fonte || u.proxima_verificacao) && !u.fonte_horizonte)
      erros.push(u.id + ": tem horizonte/próxima_verificação mas não diz de qual fonte (fonte_horizonte)");
    if (u.fonte_horizonte) {
      if (!fIds.has(u.fonte_horizonte)) erros.push(u.id + ": fonte_horizonte inexistente " + u.fonte_horizonte);
      else if (!comEvid.has(u.fonte_horizonte)) erros.push(u.id + ": fonte_horizonte " + u.fonte_horizonte + " não tem evidência lida no plano");
    }
  });

  (p.divergencias || []).forEach(v => {
    if (!re.V.test(v.id)) erros.push("divergência com id fora do padrão: " + v.id);
    if (!["corpus","web"].includes(v.usada)) erros.push(v.id + ": usada inválida");
    if (v.evidencia && !eIds.has(v.evidencia)) erros.push(v.id + ": evidência inexistente " + v.evidencia);
  });

  (p.deslocamentos || []).forEach(t => {
    if (!re.T.test(t.id)) erros.push("deslocamento com id fora do padrão: " + t.id);
    ["origem","destino","modal","partida"].forEach(k => { if (!t[k]) erros.push(t.id + ": " + k + " ausente"); });
    if (typeof t.duracao_min !== "number") erros.push(t.id + ": duração_min não é inteiro");
    if (!fIds.has(t.fonte)) erros.push(t.id + ": fonte inexistente " + t.fonte);
  });

  const TIPOS = ["voo","deslocamento","hospedagem","sessao","reuniao","refeicao","livre"];
  p.itinerario.forEach(i => {
    if (!re.I.test(i.id)) erros.push("item com id fora do padrão: " + i.id);
    if (!TIPOS.includes(i.tipo)) erros.push(i.id + ": tipo inválido " + i.tipo);
    if (!re.dt.test(i.inicio)) erros.push(i.id + ": inicio não é ISO com fuso: " + i.inicio);
    if (i.fim && !re.dt.test(i.fim)) erros.push(i.id + ": fim não é ISO com fuso: " + i.fim);
    if (i.ref && !re.sel.test(i.ref)) erros.push(i.id + ": ref fora do padrão " + i.ref);
    (i.fontes || []).forEach(f => { if (!fIds.has(f)) erros.push(i.id + ": fonte inexistente " + f); });
    if (i.tipo === "deslocamento") {
      ["fim","de_item","para_item","componentes","fontes"].forEach(k => {
        if (!i[k] || (Array.isArray(i[k]) && !i[k].length)) erros.push(i.id + ": deslocamento exige " + k);
      });
      if (i.de_item && !iIds.has(i.de_item)) erros.push(i.id + ": de_item aponta para item inexistente " + i.de_item);
      if (i.para_item && !iIds.has(i.para_item)) erros.push(i.id + ": para_item aponta para item inexistente " + i.para_item);
      if (i.componentes && i.fim) {
        const soma = i.componentes.reduce((s, c) => s + c.minutos, 0);
        const janela = Math.round((new Date(i.fim) - new Date(i.inicio)) / 60000);
        if (soma !== janela) erros.push(i.id + ": componentes somam " + soma + " min mas a janela tem " + janela + " min (" + i.titulo + ")");
      }
    }
  });
  return erros;
}

if (soValidar) {
  if (!fs.existsSync(DESTINO)) { console.error("saida/plano.json não existe. Rode sem --validar primeiro."); process.exit(1); }
  const erros = validar(JSON.parse(fs.readFileSync(DESTINO, "utf8")));
  console.log(erros.length ? "Inválido (" + erros.length + "):\n  " + erros.join("\n  ") : "plano.json válido contra corpus/aqua/entrega/schema-plano.json");
  process.exit(erros.length ? 1 : 0);
}

const erros = validar(plano);
fs.writeFileSync(DESTINO, JSON.stringify(plano, null, 2) + "\n");

// ---------- PLANO.md ----------
const L = [];
const U = A.util;
L.push("# Roteiro: " + A.viagem.viajante + " no SIAL Paris 2026", "");
L.push("> Gerado por `node cli/plano.js`" + (Object.keys(escolhas).length ? " com `" + Object.entries(escolhas).map(([k, v]) => "--set " + k + "=" + v).join(" ") + "`" : "") + ".");
L.push("> Travas de consistência: **" + P.guardas_ok + "/" + P.guardas.length + "**. Custo total: **EUR " + P.custos.total.toLocaleString("pt-BR") + "**.", "");
if (fatoTexto) L.push("**Fato novo desta rodada:** " + fatoTexto, "");

L.push("## Em uma linha", "");
L.push("Sai de Guarulhos na noite de sexta 16/10 pela " + P.voo.companhia + ", pousa em " + P.voo.chega_em + " as " +
  P.voo.chegada.slice(11, 16) + " de sábado e vai **direto do aeroporto ao pavilhão**, com a mala seguindo para o hotel, para alcançar a sessão de abertura das 13:00 - a única que ele disse que interessa de verdade. Fica as quatro noites no " +
  P.hotel.nome + ", a 8 min do pavilhão. Volta quarta 21/10 as " + P.voo.partida_volta.slice(11, 16) + ".", "");
L.push("A margem para a abertura é de **" + U.fmtDur(Math.abs(P.folga_abertura_min)) + (P.folga_abertura_min < 0 ? " de atraso" : "") + "**. Essa margem é o número que manda em todo o sábado.", "");

L.push("## Alertas", "");
if (!P.alertas.length) L.push("_Nenhum._", "");
P.alertas.forEach(a => L.push("- **[" + a.nivel.toUpperCase() + "] " + a.titulo + "** - " + a.texto));
L.push("");

L.push("## Itinerário", "");
P.dias.forEach(d => {
  L.push("### " + d.rotulo + ", " + d.data.slice(8) + "/10 - " + d.cidade + " (" + d.tzLabel + ")", "");
  L.push("_" + d.n_compromissos + " compromisso(s), " + U.fmtDur(d.min_deslocamento) + " em deslocamento._", "");
  d.itens.forEach(i => {
    const faixa = i.inicio + (i.fim ? "-" + i.fim : "");
    if (i.tipo === "deslocamento") {
      L.push("- `" + faixa + "` **" + i.titulo + "** _(" + U.fmtDur(U.dur(i.inicio, i.fim)) + ")_");
      (i.componentes || []).forEach(c => L.push("    - " + c.rotulo + ": " + c.minutos + " min"));
      if (i.nota) L.push("    - _" + i.nota + "_");
    } else {
      L.push("- `" + faixa + "` **" + i.titulo + "**" + (i.local ? " - " + i.local : ""));
      if (i.participantes && i.participantes.length) L.push("    - com: " + i.participantes.join(", "));
      if (i.nota) L.push("    - _" + i.nota + "_");
    }
  });
  L.push("");
});

L.push("## Custos", "");
L.push("| Categoria | EUR |", "|---|---:|");
P.custos.categorias.forEach(c => L.push("| " + c.nome + " | " + c.total.toLocaleString("pt-BR") + " |"));
L.push("| **Total** | **" + P.custos.total.toLocaleString("pt-BR") + "** |", "");
L.push("Abertura linha a linha:", "");
P.custos.categorias.forEach(c => {
  L.push("**" + c.nome + "**", "");
  c.itens.forEach(x => L.push("- " + x.rotulo + ": EUR " + x.eur.toLocaleString("pt-BR") + (x.estimado ? " _(estimado)_" : "") + (x.nota ? " - " + x.nota : "")));
  L.push("");
});

L.push("## Decisões", "");
L.push("### As que você decide", "");
A.decisoes.filter(d => d.modo === "aberta").forEach(d => {
  const v = P.escolhas[d.chave], o = d.opcoes.find(x => x.valor === v) || {};
  L.push("#### " + d.id + " - " + d.titulo, "");
  L.push("**Vigente:** " + (o.rotulo || v) + (o.sub ? " - " + o.sub : "") + (o.recomendada ? " _(recomendada)_" : " _(trocada por você)_"), "");
  L.push("**Por que é sua:** " + d.porque_voce_decide, "");
  L.push("**Os dois documentos em conflito:**", "");
  (d.conflito || []).forEach(c => {
    const ev = A.evidencia(c.ev), fo = A.fonte(c.fonte);
    L.push("- _" + c.rotulo + "_ (`" + (fo ? fo.referencia : c.fonte) + "`)" + (ev ? ": \"" + ev.trecho + "\"" : ""));
  });
  L.push("");
  d.opcoes.forEach(x => {
    L.push((x.valor === v ? "- **" + x.rotulo + " <- escolhida**" : "- " + x.rotulo) + " _(" + x.sub + ")_");
    (x.a_favor || []).forEach(t => L.push("    - a favor: " + t));
    (x.contra || []).forEach(t => L.push("    - contra: " + t));
  });
  (d.descartadas || []).forEach(x => L.push("- ~~" + x.opcao + "~~: " + x.motivo));
  if (d.politica) L.push("", "_Política:_ " + d.politica);
  L.push("");
});
L.push("### As que o sistema decidiu", "");
A.decisoes.filter(d => d.modo === "auto").forEach(d => {
  L.push("#### " + d.id + " - " + d.titulo, "");
  L.push(d.justificativa, "");
  (d.detalhes || []).forEach(t => L.push("- " + t));
  if (d.detalhes) L.push("");
  (d.descartadas || []).forEach(x => L.push("- ~~" + x.opcao + "~~: " + x.motivo));
  if (d.alerta) L.push("", "_Atenção:_ " + d.alerta);
  L.push("");
});

L.push("## Divergências entre o corpus e a web", "");
A.divergencias.forEach(v => {
  L.push("### " + v.id + " - " + v.tema + " (impacto " + v.impacto + ")", "");
  L.push("- **O corpus diz:** " + v.corpus_diz);
  L.push("- **A web diz:** " + v.web_diz);
  L.push("- **Usei:** " + v.usada + ". " + v.justificativa);
  const ev = A.evidencia(v.evidencia);
  if (ev) { const fo = A.fonte(ev.fonte); L.push("- **Evidência (" + v.evidencia + "):** \"" + ev.trecho + "\" - " + (fo ? fo.referencia : "")); }
  L.push("");
});

L.push("## O que eu não sabia", "");
A.incertezas.forEach(u => {
  L.push("### " + u.id + " - " + u.descricao, "");
  L.push("- **Tipo:** " + (u.tipo === "stakeholder" ? "só a pessoa responde" : "a resposta existe no mundo"));
  if (u.pergunta) L.push("- **Pergunta exata:** \"" + u.pergunta + "\"");
  L.push("- **O que assumi:** " + u.suposicao_adotada);
  if (u.horizonte_da_fonte) L.push("- **Horizonte da fonte " + u.fonte_horizonte + ":** " + u.horizonte_da_fonte);
  if (u.proxima_verificacao) L.push("- **Quando reconsultar:** " + u.proxima_verificacao);
  L.push("");
});

L.push("## Travas de consistência", "");
L.push("O motor roda estas " + P.guardas.length + " verificações a cada recálculo. Elas existem para que nada quebre sem ninguém perceber.", "");
L.push("| Trava | Situação | Detalhe |", "|---|---|---|");
P.guardas.forEach(g => L.push("| " + g.id + " " + g.titulo + " | " + (g.ok ? "passa" : "**FALHA**") + " | " + g.detalhe + " |"));
L.push("");
if (plano.delta) {
  L.push("## Delta desta rodada", "");
  L.push("**Fato novo:** " + plano.delta.fato_novo, "");
  L.push("- **Preservado:** " + (plano.delta.preservado.join(", ") || "nada"));
  plano.delta.alterado.forEach(a => L.push("- **Mudou " + a.decisao + ":** " + a.antes + " -> " + a.depois));
  L.push("- **Quebrado:** " + (plano.delta.quebrado.join("; ") || "nada"));
  L.push("");
}
L.push("---", "", "_Fontes consultadas: " + A.fontes.length + " (" +
  ["corpus","web","mapa","suposicao"].map(t => A.fontes.filter(f => f.tipo === t).length + " " + t).join(", ") +
  "), com " + A.evidencias.length + " trechos citados. Saída estruturada em `saida/plano.json`._");

fs.writeFileSync(path.join(SAIDA, "PLANO.md"), L.join("\n") + "\n");

console.log("saida/plano.json   " + itinerario.length + " itens, " + decisoes.length + " decisões, " + A.fontes.length + " fontes");
console.log("saida/PLANO.md     " + L.length + " linhas");
console.log("travas             " + P.guardas_ok + "/" + P.guardas.length + (P.guardas_ok < P.guardas.length ? "  -> " + P.guardas.filter(g => !g.ok).map(g => g.id).join(", ") : ""));
console.log("custo total        EUR " + P.custos.total.toLocaleString("pt-BR"));
console.log("schema             " + (erros.length ? "Inválido (" + erros.length + " erro(s)):\n  " + erros.join("\n  ") : "valido"));
if (erros.length) process.exit(1);
