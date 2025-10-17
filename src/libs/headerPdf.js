export const drawHeader = (
  doc,
  logoPath,
  logoPathClient,
  margin,
  pageWidth,
  pageTitle
) => {
  // Logo a la izquierda, en la parte superior
  doc.image(logoPath, margin, margin, { height: 35 });

  doc.image(logoPathClient, pageWidth - margin - 60, margin, {
    width: 60,
    height: 35,
    align: "right",
    baseline: "bottom", // alinear abajo
  });

  // Texto centrado, en la parte superior
  doc.fontSize(15).text(
    pageTitle,
    margin, // x base
    margin * 2.2, // ajustar un poco verticalmente
    {
      width: pageWidth - margin * 2, // ancho disponible
      align: "center", // centrar el texto
      baseline: "bottom", // alinear abajo
    }
  );
};
