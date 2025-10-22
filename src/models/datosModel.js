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

  const fluxQuery = `
  from(bucket: "datos")
  |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  |> filter(fn: (r) => r["_measurement"] == "parametros")
  |> filter(fn: (r) => r["_field"] == "pitch" or r["_field"] == "velocidadAgua" or r["_field"] == "rendimiento")
  |> aggregateWindow(every: ${every}, fn: last, createEmpty: false)
  |> yield(name: "last")
  `;
  //console.log("Consulta Flux enviada:\n", fluxQuery);

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

  const response = await pool.query(SQLquery);
  return response.rows;
};
