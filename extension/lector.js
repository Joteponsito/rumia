// Se ejecuta dentro de la página del monitoreo. Devuelve todas las tablas visibles como filas de texto.
// Entiende tablas HTML normales, Element UI (el-table), Ant Design (ant-table) y cuadrículas con roles ARIA.
function rumiaLeerTablas() {
  const limpio = el => (el ? (el.innerText || el.textContent || "") : "").replace(/\s+/g, " ").trim();
  const visible = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const usados = new Set();
  const out = [];
  const ES_TITULO = "h1, h2, h3, h4, h5, .el-card__header, .ant-card-head-title, .panel-title, .card-title, .title, legend, caption";
  const titulo = el => {
    // el título más cercano ANTES de la tabla: hermanos anteriores, subiendo hasta 6 niveles
    let n = el;
    for (let i = 0; i < 6 && n && n !== document.body; i++, n = n.parentElement) {
      let s = n.previousElementSibling;
      for (let j = 0; j < 4 && s; j++, s = s.previousElementSibling) {
        const h = s.matches(ES_TITULO) ? s : s.querySelector(ES_TITULO);
        if (h && limpio(h) && limpio(h).length < 80) return limpio(h).slice(0, 60);
      }
      const cap = n.querySelector && n.querySelector(":scope > caption, :scope > .el-card__header, :scope > .ant-card-head");
      if (cap && limpio(cap)) return limpio(cap).slice(0, 60);
    }
    const act = document.querySelector(".el-tabs__item.is-active, .ant-tabs-tab-active, .el-menu-item.is-active, .ant-menu-item-selected");
    return limpio(act) || document.title || location.hostname;
  };
  const agregar = (el, filas) => {
    filas = filas.filter(f => f.some(c => c !== ""));
    if (filas.length >= 2 && Math.max(...filas.map(f => f.length)) >= 2) out.push({ titulo: titulo(el), filas });
  };
  const celdas = tr => [...tr.children].filter(c => /^(TD|TH)$/.test(c.tagName) && !c.classList.contains("is-hidden") && !c.classList.contains("ant-table-selection-column")).map(c => limpio(c.querySelector(".cell") || c));

  // Element UI: encabezado y cuerpo vienen en tablas separadas
  document.querySelectorAll(".el-table").forEach(t => {
    if (!visible(t)) return;
    const head = t.querySelector(":scope > .el-table__header-wrapper table"), body = t.querySelector(":scope > .el-table__body-wrapper table");
    if (!body) return;
    t.querySelectorAll("table").forEach(x => usados.add(x));
    const hdr = head ? celdas(head.querySelector("tr:last-child") || head.querySelector("tr")) : [];
    const filas = [...body.querySelectorAll("tbody > tr")].filter(tr => !tr.classList.contains("el-table__expanded-cell")).map(celdas);
    agregar(t, hdr.length ? [hdr, ...filas] : filas);
  });
  // Ant Design
  document.querySelectorAll(".ant-table").forEach(t => {
    if (!visible(t)) return;
    const head = t.querySelector(".ant-table-header table, .ant-table-container > .ant-table-content table, table");
    const body = t.querySelector(".ant-table-body table") || head;
    if (!body) return;
    t.querySelectorAll("table").forEach(x => usados.add(x));
    const hdrTr = head && head.querySelector("thead tr:last-child");
    const hdr = hdrTr ? celdas(hdrTr) : [];
    const filas = [...body.querySelectorAll("tbody > tr")].filter(tr => !tr.classList.contains("ant-table-measure-row") && !tr.classList.contains("ant-table-placeholder")).map(celdas);
    agregar(t, hdr.length ? [hdr, ...filas] : filas);
  });
  // Tablas HTML normales
  document.querySelectorAll("table").forEach(t => {
    if (usados.has(t) || !visible(t) || t.closest(".el-table, .ant-table")) return;
    if (t.querySelector("table")) return; // tablas de maquetación
    const filas = [...t.querySelectorAll("tr")].filter(tr => tr.closest("table") === t).map(celdas);
    agregar(t, filas);
  });
  // Cuadrículas con roles (AG Grid y similares)
  document.querySelectorAll("[role=grid], [role=table], [role=treegrid]").forEach(g => {
    if (g.tagName === "TABLE" || !visible(g)) return;
    const filas = [...g.querySelectorAll("[role=row]")].map(r => [...r.querySelectorAll("[role=columnheader], [role=gridcell], [role=cell], [role=rowheader]")].map(limpio));
    agregar(g, filas);
  });
  return { url: location.href, host: location.hostname, pagina: document.title, tablas: out };
}
