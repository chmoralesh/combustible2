import {
  getStaticticsModel,
  getStatisticsModelSql,
} from "../models/statisticsModel.js";

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
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatisticsSql = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    // Llamada al modelo SQL
    const { row, variables } = await getStatisticsModelSql(
      fechaInicio,
      fechaFin
    );
    console.log("Estos son: -->", row, variables);

    const result = {
      fields: [],
      means: [],
      counts: [],
      mins: [],
      maxs: [],
      stddevs: [],
      vars: [],
      cvs: [],
    };

    variables.forEach((col) => {
      const mean = row[`${col}_mean`];
      const min = row[`${col}_min`];
      const max = row[`${col}_max`];
      const stddev = row[`${col}_stddev`];
      const variance = row[`${col}_var`];
      const cv = row[`${col}_cv`];
      const count = row[`${col}_count`] ?? 0;

      result.fields.push([col]);
      result.means.push([mean != null ? parseFloat(mean).toFixed(1) : "0.0"]);
      result.counts.push([count]);
      result.mins.push([min != null ? parseFloat(min).toFixed(1) : "0.0"]);
      result.maxs.push([max != null ? parseFloat(max).toFixed(1) : "0.0"]);
      result.stddevs.push([
        stddev != null ? parseFloat(stddev).toFixed(1) : "0.0",
      ]);
      result.vars.push([
        variance != null ? parseFloat(variance).toFixed(1) : "0.0",
      ]);
      result.cvs.push([cv != null ? parseFloat(cv).toFixed(1) : "0.0"]);
    });

    res.json(result);
  } catch (error) {
    console.error("Error estadísticas:", error);
    res.status(500).json({ error: error.message });
  }
};
