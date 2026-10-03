#!/usr/bin/env node
/* Verifica a interface num celular de verdade: emula 375x812 via Chrome DevTools Protocol,
   percorre as quatro abas e mede se algo estoura a largura da tela. Salva um print de cada aba.

   OPCIONAL e so para desenvolvimento. Precisa do Google Chrome instalado; o app em si nao precisa.
   Uso: node cli/verificar-mobile.js            (usa ./index.html e grava em /tmp/aqua-*.png)
        node cli/verificar-mobile.js <html> <prefixo-de-saida>

   O que conta como aprovado: scrollWidth == clientWidth == 375 em todas as abas.
   Elementos filhos do carrossel de dias aparecem "fora" de proposito: aquele trilho rola. */
const { spawn } = require("child_process");
const fs = require("fs");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const ARQ = process.argv[2] || require("path").resolve(__dirname, "..", "index.html");
const DEST = process.argv[3] || "/tmp/tiro";

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--user-data-dir=/tmp/cdp-prof-" + Date.now(), "--remote-debugging-port=" + PORT, "about:blank"
], { stdio: "ignore" });

const esperar = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let alvo = null;
  for (let i = 0; i < 40 && !alvo; i++) {
    await esperar(250);
    try {
      const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      alvo = l.find(t => t.type === "page");
    } catch (e) {}
  }
  if (!alvo) { console.error("nao conectei no Chrome"); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m.error); pend.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const cmd = (method, params) => new Promise(r => { const k = ++id; pend.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
  const js = async expr => (await cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;

  await cmd("Page.enable"); await cmd("Runtime.enable");
  await cmd("Emulation.setDeviceMetricsOverride", {
    width: 375, height: 812, deviceScaleFactor: 2, mobile: true,
    screenWidth: 375, screenHeight: 812
  });
  await cmd("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cmd("Page.navigate", { url: "file://" + ARQ });
  await esperar(1800);

  console.log("viewport real:", await js("document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight"));

  const MEDIR = `(function(){
    var W=document.documentElement.clientWidth, c=[];
    document.querySelectorAll("body *").forEach(function(el){
      if(el.offsetParent===null && getComputedStyle(el).position!=="fixed") return;
      var r=el.getBoundingClientRect(), e=getComputedStyle(el);
      var rolavel = e.overflowX==="auto"||e.overflowX==="scroll";
      if(rolavel) return;
      if(r.right > W+1 || r.left < -1 || r.width > W+1){
        var p=el.parentElement, pe=p?getComputedStyle(p):null;
        if(pe&&(pe.overflowX==="auto"||pe.overflowX==="scroll")) return;
        c.push(el.tagName.toLowerCase()+"."+String(el.className||"-").slice(0,24)
          +" w="+Math.round(r.width)+" x="+Math.round(r.left)+".."+Math.round(r.right));
      }
    });
    return { docScroll: document.documentElement.scrollWidth, clientW: W, estouros: c.slice(0,8), n: c.length };
  })()`;

  const abas = await js(`document.querySelectorAll(".nav-in button").length`);
  console.log("abas:", abas);

  for (let i = 0; i < abas; i++) {
    const nome = await js(`(function(){var b=document.querySelectorAll(".nav-in button")[${i}];b.click();return b.getAttribute("data-v");})()`);
    await esperar(500);
    const m = await js(MEDIR);
    console.log(`  ${nome.padEnd(8)} scrollW=${m.docScroll} client=${m.clientW} estouros=${m.n}` + (m.n ? "\n      " + m.estouros.join("\n      ") : ""));
    const tiro = await cmd("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    if (tiro.data) fs.writeFileSync(`${DEST}-${nome}.png`, Buffer.from(tiro.data, "base64"));
  }

  // estado estressado: roteiro com deslocamentos expandidos e painel de fonte aberto
  await js(`document.querySelectorAll(".nav-in button")[0].click()`); await esperar(300);
  const nLegs = await js(`(function(){var n=0;document.querySelectorAll("[data-leg],.leg-h,.leg,.desloc").forEach(function(x){try{x.click();n++}catch(e){}});return n})()`);
  await esperar(400);
  let m = await js(MEDIR);
  console.log(`  legs(${nLegs}) abertas: estouros=${m.n}` + (m.n ? "\n      " + m.estouros.join("\n      ") : ""));
  let t = await cmd("Page.captureScreenshot", { format: "png" });
  if (t.data) fs.writeFileSync(`${DEST}-legs.png`, Buffer.from(t.data, "base64"));

  const abriu = await js(`(function(){var b=document.querySelector(".src-btn,[data-src]");if(!b)return false;b.click();return true})()`);
  await esperar(500);
  if (abriu) {
    m = await js(MEDIR);
    console.log(`  sheet de fonte aberto: estouros=${m.n}` + (m.n ? "\n      " + m.estouros.join("\n      ") : ""));
    t = await cmd("Page.captureScreenshot", { format: "png" });
    if (t.data) fs.writeFileSync(`${DEST}-sheet.png`, Buffer.from(t.data, "base64"));
  } else console.log("  (nao achei botao de fonte)");

  // alvo de toque minimo
  const toques = await js(`(function(){
    var p=[];document.querySelectorAll("button,a,[role=button]").forEach(function(b){
      if(b.offsetParent===null)return;var r=b.getBoundingClientRect();
      if(r.height<44||r.width<44) p.push(String(b.className||b.tagName).slice(0,22)+" "+Math.round(r.width)+"x"+Math.round(r.height));
    });return p.slice(0,10)})()`);
  console.log("  alvos de toque abaixo de 44px:", toques.length ? toques.join(" | ") : "nenhum");

  ws.close(); chrome.kill();
})().catch(e => { console.error("erro:", e.message); chrome.kill(); process.exit(1); });
