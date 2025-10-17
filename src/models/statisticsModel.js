import { queryApi } from "../../db/config.js";
import "dotenv/config";

const { POINTS } = process.env;

export const getStaticticsModel = async (fechaInicio, fechaFin) => {
  const startISO = fechaInicio.toISOString();
  const endISO = fechaFin.toISOString();

  const start = new Date(startISO);
  const end = new Date(endISO);
  const duracionEnSegundos = (end - start) / 1000;

  const puntosDeseados = POINTS;

  let intervaloEnSegundos = Math.floor(duracionEnSegundos / puntosDeseados);
  if (intervaloEnSegundos < 1) intervaloEnSegundos = 1; // seguridad extra

  const convertirASufijoFlux = (segundos) => {
    if (segundos < 1) return "1s";
    if (segundos < 60) return `${segundos}s`; // menos de 1 minuto
    if (segundos < 3600) return `${Math.ceil(segundos / 60)}m`; // menos de 1 hora
    return `${Math.ceil(segundos / 3600)}h`; // más de 1 hora
  };

  const every = convertirASufijoFlux(intervaloEnSegundos);

  //   const fluxQuery = `import "math"

  // from(bucket: "datos")
  //   |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  //   |> filter(fn: (r) => r["_measurement"] == "parametros")
  //   |> filter(fn: (r) => r["_field"] == "consumo" or r["_field"] == "rpm" or r["_field"] == "velocidad")
  //   |> keep(columns: ["_field", "_value"])
  //   |> group(columns: ["_field"])
  //   // 2. Se cambia el nombre del argumento 'acc' a 'accumulator', que es el nombre requerido por la función 'reduce'.
  //   |> reduce(
  //       fn: (r, accumulator) => ({
  //           min: if r._value < accumulator.min then r._value else accumulator.min,
  //           max: if r._value > accumulator.max then r._value else accumulator.max,
  //           sum: accumulator.sum + r._value,
  //           sumsq: accumulator.sumsq + r._value * r._value,
  //           count: accumulator.count + 1,
  //           _field: r._field
  //       }),
  //       identity: {min: 9999999999.0, max: -9999999999.0, sum: 0.0, sumsq: 0.0, count: 0, _field: ""}
  //   )
  //   |> map(fn: (r) => {
  //       mean = r.sum / float(v: r.count)
  //       variance = (r.sumsq / float(v: r.count)) - (mean * mean)
  //       // 3. Se llama a la función sqrt a través del paquete 'math'
  //       stddev = math.sqrt(x: if variance > 0.0 then variance else 0.0)
  //       return {
  //           _field: r._field,
  //           min: r.min,
  //           max: r.max,
  //           mean: mean,
  //           var: variance,
  //           stddev: stddev,
  //           CV: if mean != 0.0 then stddev / mean else 0.0,
  //           count: r.count
  //       }
  //   })
  // `;

  const fluxQuery = `import "math"

fieldsToProcess = ["consumo", "rpm", "velocidad"]

from(bucket: "datos")
    |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
    |> filter(fn: (r) => r["_measurement"] == "parametros")
    |> filter(fn: (r) => contains(value: r._field, set: fieldsToProcess))
    
    // 1. Pre-agregar los datos en ventanas (ej. cada 1 hora).
    |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
    
    // 2. Ahora, calculamos las estadísticas finales sobre los datos ya reducidos.
    |> group(columns: ["_field"])
    |> reduce(
        identity: {
            min: 1.0/0.0,
            max: -1.0/0.0,
            sum: 0.0,
            count: 0
        },
        // --- INICIO DE LA CORRECCIÓN ---
        // El segundo argumento DEBE llamarse 'accumulator'.
        fn: (r, accumulator) => ({
            min: if r._value < accumulator.min then r._value else accumulator.min,
            max: if r._value > accumulator.max then r._value else accumulator.max,
            sum: accumulator.sum + r._value,
            count: accumulator.count + 1
        })
        // --- FIN DE LA CORRECCIÓN ---
    )
    |> map(fn: (r) => ({
        _field: r._field,
        min: r.min,
        max: r.max,
        // Recuerda: es un promedio de promedios, una aproximación muy rápida.
        mean: r.sum / float(v: r.count),
        count: r.count
    }))
`;

  try {
    const resultado = await queryApi.collectRows(fluxQuery);
    console.log("resultado stats:", resultado);
    return resultado;
  } catch (error) {
    console.error("Error al consultar InfluxDB:", error);
    throw error;
  }
};
