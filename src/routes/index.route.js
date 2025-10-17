import { Router } from "express";
import { buildPDF } from "../libs/pdfKit.js";
import { generarGrafico } from "../libs/generarGrafico.js";
import {
  getParametros,
  getParametrosControllerSql,
} from "../controllers/datos.controller.js";
import { getStatistics } from "../controllers/statistics.controller.js";
import path from "path";

const router = Router();
let datos = [];

router.post("/grafico", async (req, res) => {
  try {
    datos = req.body; // aquí recibes los arrays desde el frontend
    if (!datos) {
      throw new Error("No se recibieron datos para generar gráfico");
    }

    // Pasamos los datos a generarGrafico
    const buffer = await generarGrafico(datos[0]);
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar gráfico");
  }
});

router.get("/invoice", (req, res) => {
  res.sendFile(path.resolve("src/public/index.html"));
});

router.post("/invoice/pdf", (req, res) => {
  const { fechaInicio, fechaFin, operador, comentario, stats } = req.body;
  console.log("Fechas recibidas en backend:", {
    fechaInicio,
    fechaFin,
    operador,
    comentario,
    stats,
  });

  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline; filename=invoice.pdf",
  });

  buildPDF(
    (chunk) => res.write(chunk),
    () => res.end(),
    { desde: fechaInicio, hasta: fechaFin, operador, comentario, stats, datos }
  );
});

router.get("/parametros", getParametros);
router.get("/statistics", getStatistics);
router.get("/parametros2", getParametrosControllerSql);

export default router;
