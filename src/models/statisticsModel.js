import { queryApi } from "../../db/config.js";
import "dotenv/config";
import pool from "../../db/configPsql.js";

const { POINTS } = process.env;

export const getStaticticsModel = async (fechaInicio, fechaFin) => {
  const startISO = fechaInicio.toISOString();
  const endISO = fechaFin.toISOString();

  const start = new Date(startISO);
  const end = new Date(endISO);
  const duracionEnSegundos = (end - start) / 1000;

  const puntosDeseados = POINTS || 2000;

  let intervaloEnSegundos = Math.floor(duracionEnSegundos / puntosDeseados);
  if (intervaloEnSegundos < 1) intervaloEnSegundos = 1;

  const convertirASufijoFlux = (segundos) => {
    if (segundos < 1) return "1s";
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.ceil(segundos / 60)}m`;
    return `${Math.ceil(segundos / 3600)}h`;
  };

  const every = convertirASufijoFlux(intervaloEnSegundos);

  const fluxQuery = `import "math"

fieldsToProcess = ["rendimiento", "pitch", "velocidadAgua"]

from(bucket: "datos")
  |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  |> filter(fn: (r) => r["_measurement"] == "parametros")
  |> filter(fn: (r) => contains(value: r._field, set: fieldsToProcess))
  |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
  |> group(columns: ["_field"])
  |> reduce(
      identity: {
          min: 1.0/0.0,
          max: -1.0/0.0,
          sum: 0.0,
          sumsq: 0.0,
          count: 0
      },
      fn: (r, accumulator) => ({
          min: if r._value < accumulator.min then r._value else accumulator.min,
          max: if r._value > accumulator.max then r._value else accumulator.max,
          sum: accumulator.sum + r._value,
          sumsq: accumulator.sumsq + r._value * r._value,
          count: accumulator.count + 1
      })
  )
  |> map(fn: (r) => {
      mean = r.sum / float(v: r.count)
      variance = (r.sumsq / float(v: r.count)) - (mean * mean)
      stddev = math.sqrt(x: if variance > 0.0 then variance else 0.0)
      CV = if mean != 0.0 then stddev / mean else 0.0
      return {
          _field: r._field,
          min: r.min,
          max: r.max,
          mean: mean,
          count: r.count,
          var: variance,
          stddev: stddev,
          CV: CV
      }
  })
`;

  try {
    const resultado = await queryApi.collectRows(fluxQuery);
    console.log("Resultado stats:", resultado);
    return resultado;
  } catch (error) {
    console.error("Error al consultar InfluxDB:", error);
    throw error;
  }
};

// export const getStaticticsModelSql = async (fechaInicio, fechaFin) => {
//   const startISO = fechaInicio.toISOString();
//   const endISO = fechaFin.toISOString();

//   const SQLquery = {
//     text: `SELECT * FROM combustible WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp DESC`,
//     values: [startISO, endISO],
//   };
//   console.log(SQLquery);

//   const response = await pool.query(SQLquery);
//   return response.rows;
// };
export const getStatisticsModelSql = async (fechaInicio, fechaFin) => {
  const startISO = fechaInicio.toISOString();
  const endISO = fechaFin.toISOString();

  const variables = ["pitch", "velocidadagua", "rendimiento", "presionturbo"];
  // const variables = [
  //   "pitch",
  //   "velocidadagua",
  //   "rendimiento",
  //   "presionturbo",
  //   "consumoinstantaneo",
  //   "totalizadorconsumo",
  //   "temperaturaturbo",
  //   "rpmmotorprincipal",
  //   "cargamotorprincipal",
  //   "potenciashaft",
  //   "velocidadtierra",
  // ];

  const selectParts = variables.map(
    (col) => `
    MAX(${col}) AS ${col}_max,
    MIN(${col}) AS ${col}_min,
    AVG(${col})::double precision AS ${col}_mean,
    STDDEV_SAMP(${col})::double precision AS ${col}_stddev,
    VAR_SAMP(${col})::double precision AS ${col}_var,
    CASE 
      WHEN AVG(${col}) IS NULL OR AVG(${col}) = 0 THEN NULL
      ELSE (STDDEV_SAMP(${col})::double precision / NULLIF(AVG(${col})::double precision,0)) * 100
    END AS ${col}_cv,
    COUNT(${col}) FILTER (WHERE ${col} IS NOT NULL) AS ${col}_count
  `
  );

  const SQLquery = {
    text: `
      SELECT
        ${selectParts.join(",\n")}
      FROM combustible
      WHERE timestamp BETWEEN $1 AND $2;
    `,
    values: [startISO, endISO],
  };

  const result = await pool.query(SQLquery);
  return { row: result.rows[0], variables };
};
