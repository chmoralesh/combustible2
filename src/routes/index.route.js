import { Router } from "express";
import { buildPDF } from "../libs/pdfKit.js";
import { generarGrafico } from "../libs/generarGrafico.js";
import {
  getParametros,
  getParametrosControllerSql,
} from "../controllers/datos.controller.js";
import {
  getStatistics,
  getStatisticsSql,
} from "../controllers/statistics.controller.js";
import path from "path";
import { Console } from "console";

const router = Router();
let datos = [];

router.post("/grafico", async (req, res) => {
  try {
    datos = req.body; // aquí recibes los arrays desde el frontend
    //console.log("Estos son sisi", datos);
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
// router.post("/grafico", async (req, res) => {
//   try {
//     // Verificamos que req.body exista y sea un array
//     if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
//       console.error("Datos inválidos recibidos:", req.body);
//       return res
//         .status(400)
//         .send("No se recibieron datos válidos para generar gráfico");
//     }

//     // Guardamos los datos globalmente
//     datos = req.body;
//     console.log(
//       "Datos actualizados globalmente:",
//       datos.length,
//       "arrays recibidos"
//     );

//     // Solo para depuración: no generamos el gráfico todavía
//     res.status(200).send("Datos recibidos y almacenados correctamente");
//   } catch (error) {
//     console.error("Error en /grafico:", error);
//     res.status(500).send("Error interno en el servidor");
//   }
// });

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

  console.log("hasta aquí todo bien");

  buildPDF(
    (chunk) => res.write(chunk),
    () => res.end(),
    { desde: fechaInicio, hasta: fechaFin, operador, comentario, stats, datos }
  );
});

// router.get(
//   "/parametros",
//   (req, res, next) => {
//     console.log("➡️ Petición recibida en /parametros con query:", req.query);
//     next(); // esto pasa el control al controlador getParametros
//   },
//   getParametros
// );
//router.get("/parametros", getParametros);
router.get("/statistics", getStatisticsSql);
//router.get("/statistics", getStatistics);
router.get("/parametros", getParametrosControllerSql);

export default router;
