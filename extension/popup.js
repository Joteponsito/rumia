const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MAX_FILAS = 20000;

function mensaje(txt, error) {
  const m = $("#msg"); m.hidden = false; m.className = "msg" + (error ? " err" : ""); m.textContent = txt;
}
async function capturas() { const r = await chrome.storage.local.get(["capturas"]); return r.capturas || []; }
async function pintar() {
  const l = await capturas();
  $("#resumen").textContent = l.length ? `${l.length} tabla${l.length > 1 ? "s" : ""} guardada${l.length > 1 ? "s" : ""}, ${l.reduce((s, c) => s + c.filas.length - 1, 0)} filas.` : "Sin tablas leídas todavía.";
  $("#borrar").hidden = !l.length;
  $("#lista").innerHTML = l.map(c => `<li><b title="${esc(c.nombre)}">${esc(c.nombre)}</b><span>${c.filas.length - 1} filas · ${c.filas[0].length} columnas · ${new Date(c.fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}</span></li>`).join("");
}
const firma = (host, encabezado) => host + "|" + encabezado.join("¦").toLowerCase();

$("#leer").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:/.test(tab.url || "")) return mensaje("Abra primero la página de su monitoreo web.", true);
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ["lector.js"] });
    const res = await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func: () => rumiaLeerTablas() });
    const encontrados = res.map(r => r.result).filter(r => r && r.tablas && r.tablas.length);
    const nuevas = encontrados.flatMap(r => r.tablas.map(t => ({ ...t, host: r.host, url: r.url, pagina: r.pagina })));
    if (!nuevas.length) return mensaje("No encontré tablas en esta página. Abra la lista de vacas (celos, salud o producción) y vuelva a intentar.", true);
    const lista = await capturas(); let filasNuevas = 0, tablasNuevas = 0;
    for (const t of nuevas) {
      const enc = t.filas[0], f = firma(t.host, enc);
      const ya = lista.find(c => c.firma === f);
      if (ya) { // otra página de la misma tabla: juntar filas sin repetir
        const vistas = new Set(ya.filas.slice(1).map(x => x.join("¦")));
        const extra = t.filas.slice(1).filter(x => !vistas.has(x.join("¦")));
        ya.filas.push(...extra); ya.filas = ya.filas.slice(0, MAX_FILAS); ya.fecha = new Date().toISOString(); filasNuevas += extra.length;
      } else {
        lista.push({ firma: f, nombre: `${t.host} · ${t.titulo}`, url: t.url, fecha: new Date().toISOString(), hoja: t.titulo, filas: t.filas.slice(0, MAX_FILAS) });
        tablasNuevas++; filasNuevas += t.filas.length - 1;
      }
    }
    await chrome.storage.local.set({ capturas: lista });
    mensaje(tablasNuevas ? `Listo: ${tablasNuevas} tabla${tablasNuevas > 1 ? "s" : ""} nueva${tablasNuevas > 1 ? "s" : ""}, ${filasNuevas} filas.` : filasNuevas ? `Se agregaron ${filasNuevas} filas a una tabla ya leída.` : "Esas filas ya estaban guardadas.");
    pintar();
  } catch (e) {
    mensaje("No se pudo leer esta página: " + (e && e.message ? e.message : e), true);
  }
});
$("#abrir").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("app.html#hoy") }));
$("#borrar").addEventListener("click", async () => { await chrome.storage.local.set({ capturas: [] }); $("#msg").hidden = true; pintar(); });
pintar();
