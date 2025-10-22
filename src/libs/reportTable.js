// export const drawReportTable = (doc, dataRows, options) => {
//   const { pageWidth, margin } = options;
//   const totalCols = 5; // Número total de columnas
//   const firstColWidth = 40;
//   const totalWidth = pageWidth - 2 * margin - firstColWidth;
//   const colWidth = totalWidth / (totalCols - 1);

//   const table = {
//     headers: [
//       { label: "N°", property: "name", width: firstColWidth, renderer: null },
//       { label: "Fecha", property: "fecha", width: colWidth, renderer: null },
//       {
//         label: "Consumo [l/NM]",
//         property: "price1",
//         width: colWidth,
//         renderer: null,
//       },
//       {
//         label: "Pitch [%]",
//         property: "price2",
//         width: colWidth,
//         renderer: null,
//       },
//       {
//         label: "Velocidad [kt]",
//         property: "price3",
//         width: colWidth,
//         renderer: null,
//       },
//     ],
//     rows: dataRows,
//   };

//   doc.table(table, {
//     x: margin,
//     y: doc.y,
//     width: pageWidth - 2 * margin,
//     padding: 5,
//     columnSpacing: 5,

//     prepareHeader: () => {
//       doc.save();

//       // Color de texto
//       doc.fillColor("white").font("Helvetica-Bold").fontSize(10);

//       // Estilo de fondo teal por celda
//       table.headers.forEach((h, i) => {
//         const cellWidth = h.width;
//         const cellX =
//           margin +
//           table.headers.slice(0, i).reduce((acc, c) => acc + c.width, 0);
//         const cellY = doc.y;

//         doc.rect(cellX, cellY, cellWidth, 20).fill("#008080"); // Fondo teal
//         doc.fillColor("white");
//       });

//       doc.restore();
//     },

//     prepareRow: (row, i) => {
//       doc.fillColor("black").font("Helvetica").fontSize(8);
//     },
//   });
// };

export const drawReportTable = (doc, dataRows, options) => {
  const { startX, startY, pageWidth, margin, spacing = 5 } = options;
  const totalCols = 6; // Número total de columnas
  const firstColWidth = 40;
  const secondColWidth = 100;
  const totalWidth = pageWidth - 2 * margin - firstColWidth - secondColWidth; // Ancho total disponible menos la primera columna
  const colWidth = totalWidth / (totalCols - 2); // Resto de columnas

  const headerColor = "#008080"; // Color de fondo teal
  //   const dataRedondear = dataRows.map((row, index) => {
  //     newData = row.map((value, i) => {
  //       i < 2 ? value : parseFloat(value).toFixed(2);
  //     });
  //   });
  //   console.log("dataRedondear", dataRedondear[0]);

  const dataRedondear = dataRows.map((row) => {
    return row.map((value, i) => {
      if (i < 2) {
        return value; // conservamos los 2 primeros
      } else {
        return parseFloat(value).toFixed(1); // limitar a 1 decimal
      }
    });
  });

  //onsole.log("dataRedondear", dataRedondear[0]);

  const table = {
    headers: [
      {
        label: "N°",
        property: "name",
        width: firstColWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      {
        label: "Fecha",
        property: "fecha",
        width: secondColWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      {
        label: "Pitch [%]",
        property: "price1",
        width: colWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      {
        label: "Velocidad [Kn]",
        property: "price2",
        width: colWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      {
        label: "Rendimiento [l/Nm]",
        property: "price3",
        width: colWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      {
        label: "Presión Turbo [bar]",
        property: "price4",
        width: colWidth,
        headerColor: headerColor,
        headerOpacity: 1,
        renderer: null,
      },
      // { label: "Price 4", property: "price4", width: 60, renderer: null },
    ],

    rows: dataRedondear,
  };

  doc.table(table, {
    x: margin,
    y: doc.y,
    width: pageWidth - 2 * margin,
    padding: 5,
    columnSpacing: 5,
    prepareHeader: () => {
      doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
    },
    prepareRow: (row, i) =>
      doc.fillColor("black").font("Helvetica").fontSize(8),
  });
};
