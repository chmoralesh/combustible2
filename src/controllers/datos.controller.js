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

    res.json([[rendimiento, pitch, velocidadAgua, time], arrayDeArrays]);
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
    const dato0 = [];
    const dato1 = [];
    const dato2 = [];
    const dato3 = [];
    const time = [];
    const arrayDeArrays = [];

    rows.forEach((item, index) => {
      const dato0Val = item.pitch !== null ? parseFloat(item.pitch) : null;
      const dato1Val =
        item.velocidadagua !== null ? parseFloat(item.velocidadagua) : null;
      const dato2Val =
        item.rendimiento !== null ? parseFloat(item.rendimiento) : null;
      const dato3Val =
        item.presionturbo !== null ? parseFloat(item.presionturbo) : null;

      dato0.push(dato0Val);
      dato1.push(dato1Val);
      dato2.push(dato2Val);
      dato3.push(dato3Val);
      time.push(item.timestamp);

      arrayDeArrays.push([
        index,
        item.timestamp,
        dato0Val,
        dato1Val,
        dato2Val,
        dato3Val,
      ]);
    });
    // rows.forEach((item, index) => {
    //   const fechaUtc = new Date(item.timestamp);

    //   // Convierte a hora chilena (America/Santiago)
    //   const fechaChilena = new Date(
    //     fechaUtc.toLocaleString("en-US", { timeZone: "America/Santiago" })
    //   );

    //   // Si quieres devolver el string ya en formato legible:
    //   const fechaFormateada = fechaChilena.toISOString(); // o lo que necesites

    //   const dato0Val = item.pitch !== null ? parseFloat(item.pitch) : null;
    //   const dato1Val =
    //     item.velocidadagua !== null ? parseFloat(item.velocidadagua) : null;
    //   const dato2Val =
    //     item.rendimiento !== null ? parseFloat(item.rendimiento) : null;
    //   const dato3Val =
    //     item.presionturbo !== null ? parseFloat(item.presionturbo) : null;

    //   dato0.push(dato0Val);
    //   dato1.push(dato1Val);
    //   dato2.push(dato2Val);
    //   dato3.push(dato3Val);
    //   time.push(fechaFormateada); // ya ajustada a Chile

    //   arrayDeArrays.push([
    //     index,
    //     fechaFormateada,
    //     dato0Val,
    //     dato1Val,
    //     dato2Val,
    //     dato3Val,
    //   ]);
    // });

    // Resultado final igual que tu controlador original
    const result = [[dato0, dato1, dato2, time, dato3], arrayDeArrays];

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
