export function drawMultiColumnTablesStats(doc, tables, options) {
  const { startX, startY, pageWidth, margin, spacing = 5 } = options;

  // 🧠 1. Define el ancho de la primera tabla manualmente (por ejemplo, 50% del espacio)
  const firstTableWidth = (pageWidth - margin * 2) * 0.2;

  // 🧮 2. Calcula el ancho del resto
  const remainingWidth =
    pageWidth - margin * 2 - firstTableWidth - spacing * (tables.length - 1);
  const otherColWidth = remainingWidth / (tables.length - 1);

  let currentX = startX;

  for (let col = 0; col < tables.length; col++) {
    const colWidth = col === 0 ? firstTableWidth : otherColWidth;
    const tableX = currentX;

    // 🟩 Dibujar header con fondo
    doc.fillColor("teal");
    doc.roundedRect(tableX, startY, colWidth, 17, 3).fill();

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(tables[col].headers[0], tableX + 5, startY + 5, {
        width: colWidth - 10,
        align: "center",
      });

    // 📊 Dibujar tabla
    doc.table(
      {
        headers: [""],
        rows: tables[col].rows.map((r) => [r]),
      },
      {
        x: tableX,
        y: startY + 20,
        width: colWidth,
        prepareRow: (row, iCol, iRow, rectRow) => {
          doc.font("Helvetica").fontSize(9).fillColor("black");
          if (iRow % 2 === 0) {
            const customRect = {
              x: tableX,
              y: rectRow.y,
              width: colWidth,
              height: rectRow.height,
            };
          }
        },
      }
    );

    // 🧭 Avanza la posición X para la siguiente tabla
    currentX += colWidth + spacing;
  }
}
