import {
  getParametrosModel,
  getParametrosModelPsql,
} from "../models/datosModel.js";

export const getParametros = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    const datos = await getParametrosModel(fechaInicio, fechaFin);

    // Agrupamiento por tiempo
    const groupData = (dataFromDB) => {
      const agrupado = {};

      dataFromDB.forEach((item) => {
        const tiempo = item._time;
        if (!agrupado[tiempo]) {
          agrupado[tiempo] = { _time: tiempo };
        }
        agrupado[tiempo][item._field] = item._value;
      });

      return Object.values(agrupado);
    };

    const datosAgrupados = groupData(datos);

    // Transformar a array de arrays
    const arrayDeArrays = Object.entries(datosAgrupados).map(
      ([clave, valor]) => [
        clave,
        valor._time,
        valor.consumo,
        valor.rpm,
        valor.velocidad,
      ]
    );

    //console.log(arrayDeArrays);

    // Crear arrays separados
    const consumo = [];
    const rpm = [];
    const velocidad = [];
    const time = [];

    datosAgrupados.forEach((data) => {
      consumo.push(data.consumo ?? null);
      rpm.push(data.rpm ?? null);
      velocidad.push(data.velocidad ?? null);
      time.push(data._time ?? null);
    });

    // Devuelve un array con los 4 arrays
    res.json([[consumo, rpm, velocidad, time], arrayDeArrays]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//GET
export const getParametrosControllerSql = async (req, res) => {
  const { desde, hasta } = req.body;

  if (!desde || !hasta) {
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    const datos = await getParametrosModelPsql(fechaInicio, fechaFin);

    // Devuelve un array con los 4 arrays
    res.json([datos]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
