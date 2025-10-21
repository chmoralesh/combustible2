import PDFDocument from "pdfkit-table";
import path from "path";
import { drawMultiColumnTables } from "./multiColumnTables.js";
import { drawMultiColumnTablesStats } from "./multiColumnTablesStats.js";
import { drawHeader } from "./headerPdf.js";
import { drawReportTable } from "./reportTable.js";
//import { page } from "pdfkit";

export const buildPDF = (
  dataCallback,
  endCallback,
  { desde, hasta, operador, comentario, stats, datos }
) => {
  const doc = new PDFDocument();
  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  const logoPath = path.resolve("src/imgs/logo.png");
  const logoPathClient = path.resolve("src/imgs/logo_alimar.png");
  const graphPath = path.resolve("src/imgs/graph.jpg"); // desde backend
  const pageWidth = doc.page.width;
  const margin = 50;

  // Dibujar el encabezado
  const pageTitle = "Reporte de Consumos";
  drawHeader(doc, logoPath, logoPathClient, margin, pageWidth, pageTitle);

  //-----------------Tabla 1-----------------------
  const tables = [
    {
      headers: ["Inicio", ""],
      rows: [
        ["Fecha", desde.slice(0, 10)],
        ["Hora", desde.slice(11, 19)],
      ],
    },
    {
      headers: ["Fin", ""],
      rows: [
        ["Fecha", hasta.slice(0, 10)],
        ["Hora", hasta.slice(11, 19)],
      ],
    },
    {
      headers: ["Operador"],
      rows: [[operador]],
    },
  ];

  drawMultiColumnTables(doc, tables, {
    startX: margin,
    startY: doc.y - 10,
    pageWidth,
    margin,
    spacing: 5,
  });
  //-----------------Tabla 2-----------------------
  const tables2 = [
    {
      headers: ["Comentarios"],
      rows: [[comentario]],
    },
  ];

  drawMultiColumnTables(doc, tables2, {
    startX: margin,
    startY: doc.y + 20,
    pageWidth,
    margin,
    spacing: 5,
  });
  //----------------------------------------------

  // Texto centrado, en la parte superior
  doc.fontSize(12).text(
    "Resumen de datos estadísticos",
    margin, // x base
    doc.y + 10, // ajustar un poco verticalmente
    {
      width: pageWidth - margin * 2, // ancho disponible
      align: "center", // centrar el texto
      baseline: "bottom", // alinear abajo
    }
  );
  //-----------------Tabla 3-----------------------
  const result = stats;

  const tables3 = [
    {
      headers: ["Descripción"],
      // rows: result.fields,
      rows: [
        ["Pitch [%]"],
        ["Velocidad [kt]"],
        ["Consumo [L/NM]"],
        ["Presión Turbo [bar]"],
      ],
    },
    {
      headers: ["Max"],
      rows: result.maxs,
    },
    {
      headers: ["Min"],
      rows: result.mins,
    },
    {
      headers: ["Media"],
      rows: result.means,
    },
    {
      headers: ["Desv. St."],
      rows: result.stddevs,
    },
    {
      headers: ["Varianza"],
      rows: result.vars,
    },
    {
      headers: ["Coef. Var."],
      rows: result.cvs,
    },
  ];

  drawMultiColumnTablesStats(doc, tables3, {
    startX: margin,
    startY: doc.y,
    pageWidth,
    margin,
    spacing: 5,
  });

  //----------------------------------------------

  // Texto centrado, en la parte superior
  doc.fontSize(12).text(
    "Gráfico de tendencias",
    margin, // x base
    doc.y + 20, // ajustar un poco verticalmente
    {
      width: pageWidth - margin * 2, // ancho disponible
      align: "center", // centrar el texto
      baseline: "bottom", // alinear abajo
    }
  );

  // Insertar imagen del gráfico guardado
  const graficoPath = path.join(process.cwd(), "public", "grafico.png");
  doc.image(graficoPath, margin, doc.y - 30, {
    fit: [500, 300],
    align: "center",
    valign: "center",
  });

  // // Añadir una nueva página
  doc.addPage();

  // // Dibujar el encabezado en la nueva página
  const pageTitle2 = "Tabla de registros";
  drawHeader(doc, logoPath, logoPathClient, margin, pageWidth, pageTitle2);

  const totalCols = datos[1].length;
  const firstColWidth = 20; // Ancho fijo para la primera columna
  console.log("Total columnas:", totalCols);
  const totalWidth = pageWidth - 2 * margin - firstColWidth; // Ancho total disponible menos la primera columna
  const colWidth = totalWidth / totalCols;

  const tableHeaderName = [
    "N°",
    "Fecha",
    "Consumo [l/NM]",
    "Pitch [%]",
    "Velocidad [kt]",
  ];
  const tableRows = datos[1].reverse();

  // doc.on("pageAdded", () => {
  //   drawHeader(doc, logoPath, logoPathClient, margin, pageWidth, pageTitle2);
  //   doc.y = 300;
  // });

  drawReportTable(doc, tableRows, {
    startX: margin,
    startY: doc.y,
    pageWidth,
    margin,
    spacing: 5,
  });

  doc.end();
};
