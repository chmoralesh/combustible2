import { getStaticticsModel } from "../models/statisticsModel.js";

export const getStatistics = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    const datos = await getStaticticsModel(fechaInicio, fechaFin);
    console.log("Datos de estadísticas obtenidos:", datos);

    const transformData = (arr) => {
      const fields = arr.map((d) => [d._field]);
      const means = arr.map((d) => [d.mean.toFixed(1)]);
      const counts = arr.map((d) => [d.count.toFixed(0)]);
      const mins = arr.map((d) => [d.min.toFixed(1)]);
      const maxs = arr.map((d) => [d.max.toFixed(1)]);
      const stddevs = arr.map((d) => [d.stddev.toFixed(1)]);
      const vars = arr.map((d) => [d.var.toFixed(1)]);
      const cvs = arr.map((d) => [d.CV.toFixed(1)]);

      return { fields, means, counts, mins, maxs, stddevs, vars, cvs };
    };

    const result = transformData(datos);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
