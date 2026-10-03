#!/usr/bin/env node
/* Confere que todo trecho citado de fonte do corpus existe de fato no arquivo original.
   As citacoes em dados/fontes.js foram escritas sem acento, entao a comparacao normaliza
   acento e pontuacao dos dois lados antes de procurar.
   Uso: node cli/conferir-citacoes.js */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const RAIZ = path.resolve(__dirname, "..");
globalThis.window = globalThis;
["dados/fontes.js", "dados/corpus.js", "dados/decisoes.js", "dados/deslocamentos.js", "engine.js"].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(RAIZ, f), "utf8"), { filename: f }));
const A = globalThis.AQUA;

const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const corpus = A.fontes.filter(f => f.tipo === "corpus");
let ok = 0, falhas = [], semArquivo = [];

for (const f of corpus) {
  const alvo = path.join(RAIZ, "corpus", "aqua", f.referencia);
  if (!fs.existsSync(alvo)) { semArquivo.push(f.id + " -> " + f.referencia); continue; }
  const texto = norm(fs.readFileSync(alvo, "utf8"));
  for (const ev of A.evidencias.filter(e => e.fonte === f.id)) {
    const t = norm(ev.trecho);
    // confere por sentenca: uma citacao longa costuma juntar frases separadas no original
    const partes = t.split(" ").length > 14
      ? ev.trecho.split(/(?<=[.:])\s+/).map(norm).filter(x => x.split(" ").length >= 4)
      : [t];
    const faltou = partes.filter(p => !texto.includes(p));
    if (faltou.length) falhas.push({ ev: ev.id, fonte: f.id, arquivo: f.referencia, faltou });
    else ok++;
  }
}

console.log("Citacoes de fonte do corpus conferidas contra o arquivo original\n");
console.log("  arquivos do corpus:", corpus.length);
console.log("  citacoes conferidas:", ok + falhas.length);
console.log("  conferem:", ok);
console.log("  divergem:", falhas.length);
if (semArquivo.length) console.log("  arquivo nao encontrado:", semArquivo.join(", "));
if (falhas.length) {
  console.log("\nTrechos que nao achei no original:");
  falhas.forEach(f => {
    console.log("\n  " + f.ev + " (" + f.arquivo + ")");
    f.faltou.forEach(p => console.log("    nao achei: \"" + p.slice(0, 110) + (p.length > 110 ? "..." : "") + "\""));
  });
}
const naoCorpus = A.evidencias.filter(e => { const f = A.fonte(e.fonte); return f && f.tipo !== "corpus"; }).length;
console.log("\n  (" + naoCorpus + " citacoes de web, mapa e suposicao nao sao conferiveis aqui: a fonte e externa.)");
process.exit(falhas.length || semArquivo.length ? 1 : 0);
