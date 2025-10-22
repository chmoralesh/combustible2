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
  //acondicionando datos
  function formatearFechaChilena(fechaISO) {
    const fechaLocal = new Date(fechaISO);

    // Formatear la fecha y hora en zona horaria chilena
    const opciones = {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const fechaChilena = fechaLocal
      .toLocaleString("es-CL", opciones)
      .replace(",", "");

    const [fechaStr, horaStrRaw] = fechaChilena.split(" ");

    // Si por alguna razón el formato local retorna "24" en la hora, la convertimos a "00"
    const horaStr = horaStrRaw.startsWith("24")
      ? horaStrRaw.replace("24", "00")
      : horaStrRaw;

    return { fecha: fechaStr, hora: horaStr };
  }

  const inicio = formatearFechaChilena(desde);
  const fin = formatearFechaChilena(hasta);

  const tables = [
    {
      headers: ["Inicio", ""],
      rows: [
        // ["Fecha", desde.slice(0, 10)],
        // ["Hora", desde.slice(11, 19)],
        ["Fecha", inicio.fecha],
        ["Hora", inicio.hora],
      ],
    },
    {
      headers: ["Fin", ""],
      rows: [
        ["Fecha", fin.fecha],
        ["Hora", fin.hora],
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

  //formatear fecha

  const dataFormateada = tableRows.map((row) => {
    const fechaISO = row[1];
    const d = new Date(fechaISO);

    // Formatear fecha a DD-MM-AAAA HH:MM:SS
    const fechaFormateada = d
      .toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");

    // Reemplazar la fecha en el array original
    return [row[0], fechaFormateada, ...row.slice(2)];
  });

  console.log(dataFormateada);

  //console.log("En pdfkit", tableRows);

  drawReportTable(doc, dataFormateada, {
    startX: margin,
    startY: doc.y,
    pageWidth,
    margin,
    spacing: 5,
  });

  doc.end();
};
