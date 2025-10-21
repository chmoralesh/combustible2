import { queryApi } from "../../db/config.js";
import "dotenv/config";
import pool from "../../db/configPsql.js";

const { POINTS } = process.env;

export const getParametrosModel = async (fechaInicio, fechaFin) => {
  console.log("Parámetros: ", fechaInicio, fechaInicio);
  const startISO = fechaInicio.toISOString();
  const endISO = fechaFin.toISOString();

  const start = new Date(startISO);
  const end = new Date(endISO);
  const duracionEnSegundos = (end - start) / 1000;

  const puntosDeseados = Number(POINTS) || 2000;

  let intervaloEnSegundos = Math.floor(duracionEnSegundos / puntosDeseados);
  if (intervaloEnSegundos < 1) intervaloEnSegundos = 1; // seguridad extra

  const convertirASufijoFlux = (segundos) => {
    if (segundos < 1) return "1s";
    if (segundos < 60) return `${segundos}s`; // menos de 1 minuto
    if (segundos < 3600) return `${Math.floor(segundos / 60)}m`; // menos de 1 hora
    return `${Math.floor(segundos / 3600)}h`; // más de 1 hora
  };

  const every = convertirASufijoFlux(intervaloEnSegundos);
  console.log("intervalo: ", every);
  //console.log("Intervalo calculado para aggregateWindow:", every);

  //   const fluxQuery = `
  //   from(bucket: "datos")
  //     |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  //     |> filter(fn: (r) => r["_measurement"] == "parametros")
  //     |> filter(fn: (r) => r["_field"] == "consumoInstantaneo" or r["_field"] == "rpmMotorPrincipal" or r["_field"] == "velocidadAgua")
  //     |> aggregateWindow(every: ${every}, fn: last, createEmpty: false)
  //     |> fill(usePrevious: true)
  //     |> yield(name: "last")
  // `;

  const fluxQuery = `
  from(bucket: "datos")
  |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  |> filter(fn: (r) => r["_measurement"] == "parametros")
  |> filter(fn: (r) => r["_field"] == "pitch" or r["_field"] == "velocidadAgua" or r["_field"] == "rendimiento")
  |> aggregateWindow(every: ${every}, fn: last, createEmpty: false)
  |> yield(name: "last")
  `;
  console.log("Consulta Flux enviada:\n", fluxQuery);

  try {
    const resultado = await queryApi.collectRows(fluxQuery);
    //console.log("Resultado crudo de InfluxDB:", resultado);
    return resultado;
  } catch (error) {
    console.error("Error al consultar InfluxDB:", error);
    throw error;
  }
};
export const getParametrosModelPsql = async (fechaInicio, fechaFin) => {
  const startISO = fechaInicio.toISOString();
  const endISO = fechaFin.toISOString();

  //const puntosDeseados = Number(process.env.POINTS) || 5000;
  const puntosDeseados = Number(5000);

  const SQLquery = {
    text: `
      WITH ranked AS (
        SELECT *,
               NTILE($3) OVER (ORDER BY timestamp) AS tile
        FROM combustible
        WHERE timestamp BETWEEN $1 AND $2
      )
      SELECT DISTINCT ON (tile) *
      FROM ranked
      ORDER BY tile, timestamp DESC;
    `,
    values: [startISO, endISO, puntosDeseados],
  };

  console.log("Consulta SQL:", SQLquery);

  // const SQLquery = {
  //   text: `SELECT * FROM combustible WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp DESC`,
  //   values: [startISO, endISO],
  // };
  // console.log(SQLquery);

  const response = await pool.query(SQLquery);
  return response.rows;
};

// export const getParametrosModelPsql = async (fechaInicio, fechaFin) => {
//   const startISO = fechaInicio.toISOString();
//   const endISO = fechaFin.toISOString();

//   const maxRecords = Number(process.env.POINTS) || 5000; // número máximo de registros deseados

//   const SQLquery = `
//     WITH conteo AS (
//       SELECT COUNT(*) AS total_rows
//       FROM combustible
//       WHERE timestamp BETWEEN $1 AND $2
//     ),
//     data AS (
//       SELECT *,
//              ROW_NUMBER() OVER (ORDER BY timestamp ASC) AS rn
//       FROM combustible
//       WHERE timestamp BETWEEN $1 AND $2
//     )
//     SELECT *
//     FROM data, conteo
//     WHERE
//       (conteo.total_rows <= $3)
//       OR (
//         conteo.total_rows > $3
//         AND rn IN (
//           SELECT FLOOR(1 + (conteo.total_rows - 1) * n / ($3 - 1))
//           FROM generate_series(0, $3 - 1) AS n
//         )
//       )
//     ORDER BY timestamp ASC;
//   `;

//   const params = [startISO, endISO, maxRecords];

//   try {
//     const response = await pool.query(SQLquery, params);
//     console.log(`Cantidad de registros devueltos: ${response.rows.length}`);
//     return response.rows;
//   } catch (error) {
//     console.error("Error al consultar la base de datos:", error);
//     throw error;
//   }
// };
