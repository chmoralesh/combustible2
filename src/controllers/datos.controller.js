import {
  getParametrosModel,
  getParametrosModelPsql,
} from "../models/datosModel.js";

export const getParametros = async (req, res) => {
  //console.log("entró al controller");
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    //console.log("No hay datos");
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    const datos = await getParametrosModel(fechaInicio, fechaFin);
    //console.log("Estos datos vienen", datos);

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
    const arrayDeArrays = Object.entries(datosAgrupados).map(
      ([clave, valor]) => [
        clave,
        valor._time,
        valor.rendimiento,
        valor.pitch,
        valor.velocidadAgua,
      ]
    );

    const rendimiento = [];
    const pitch = [];
    const velocidadAgua = [];
    const time = [];

    datosAgrupados.forEach((data) => {
      rendimiento.push(data.rendimiento ?? null);
      pitch.push(data.pitch ?? null);
      velocidadAgua.push(data.velocidadAgua ?? null);
      time.push(data._time ?? null);
    });

    // console.log("Esto imprimía influx:", [
    //   [rendimiento, pitch, velocidadAgua, time],
    //   arrayDeArrays,
    // ]);

    res.json([[rendimiento, pitch, velocidadAgua, time], arrayDeArrays]);

    // // Transformar a array de arrays
    // const arrayDeArrays = Object.entries(datosAgrupados).map(
    //   ([clave, valor]) => [
    //     clave,
    //     valor._time,
    //     valor.consumo,
    //     valor.rpm,
    //     valor.velocidad,
    //   ]
    // );

    // //console.log("Estos son los valores",arrayDeArrays);

    // // Crear arrays separados
    // const consumo = [];
    // const rpm = [];
    // const velocidad = [];
    // const time = [];

    // datosAgrupados.forEach((data) => {
    //   consumo.push(data.consumo ?? null);
    //   rpm.push(data.rpm ?? null);
    //   velocidad.push(data.velocidad ?? null);
    //   time.push(data._time ?? null);
    // });

    // console.log("Esto imprimia influx: ", [
    //   [consumo, rpm, velocidad, time],
    //   arrayDeArrays,
    // ]);

    // // Devuelve un array con los 4 arrays
    // res.json([[consumo, rpm, velocidad, time], arrayDeArrays]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET
export const getParametrosControllerSql = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res
      .status(400)
      .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
  }

  try {
    const fechaInicio = new Date(desde);
    const fechaFin = new Date(hasta);

    // Llamada a tu modelo que ejecuta la consulta SQL
    const rows = await getParametrosModelPsql(fechaInicio, fechaFin);

    // Arrays separados
    const consumo = [];
    const rpm = [];
    const velocidad = [];
    const time = [];
    const arrayDeArrays = [];

    rows.forEach((item, index) => {
      const consumoVal = item.pitch !== null ? parseFloat(item.pitch) : null;
      const rpmVal =
        item.velocidadagua !== null ? parseFloat(item.velocidadagua) : null;
      const velocidadVal =
        item.rendimiento !== null ? parseFloat(item.rendimiento) : null;

      consumo.push(consumoVal);
      rpm.push(rpmVal);
      velocidad.push(velocidadVal);
      time.push(item.timestamp);

      arrayDeArrays.push([
        index,
        item.timestamp,
        consumoVal,
        rpmVal,
        velocidadVal,
      ]);
    });

    // Resultado final igual que tu controlador original
    const result = [[consumo, rpm, velocidad, time], arrayDeArrays];

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//GET
// export const getParametrosControllerSql = async (req, res) => {
//   const { desde, hasta } = req.body;

//   if (!desde || !hasta) {
//     return res
//       .status(400)
//       .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
//   }

//   try {
//     const fechaInicio = new Date(desde);
//     const fechaFin = new Date(hasta);

//     const datos = await getParametrosModelPsql(fechaInicio, fechaFin);

//     // Devuelve un array con los 4 arrays
//     res.json([datos]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
