/**
 * Dibuja múltiples tablas en columnas
 * @param {PDFDocument} doc - Instancia de PDFKit
 * @param {Array} tables - Arreglo de tablas [{ headers: [], rows: [] }]
 * @param {Object} options - Configuración
 * @param {number} options.startX - Margen izquierdo
 * @param {number} options.startY - Posición vertical inicial
 * @param {number} options.pageWidth - Ancho de la página
 * @param {number} options.margin - Margen lateral
 * @param {number} [options.spacing=5] - Espaciado entre columnas
 */
export function drawMultiColumnTables(doc, tables, options) {
  const { startX, startY, pageWidth, margin, spacing = 5 } = options;

  const colWidth =
    (pageWidth - margin * 2 - spacing * (tables.length - 1)) / tables.length;

  for (let col = 0; col < tables.length; col++) {
    const tableX = startX + col * (colWidth + spacing);

    // Dibujar header con fondo
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

    // Dibujar tabla
    doc.table(
      { headers: ["", ""], rows: tables[col].rows },
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
  }
}
