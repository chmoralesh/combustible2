import { InfluxDB } from "@influxdata/influxdb-client";
import "dotenv/config";

const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } = process.env;

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const queryApi = influxDB.getQueryApi(INFLUX_ORG);

// Prueba de conexión corregida
const testConnection = async () => {
  const fluxQuery = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -15m)
      |> limit(n: 1)
  `;

  try {
    const rows = await queryApi.collectRows(fluxQuery); // ✅ forma correcta
    console.log("🔋 InfluxDB conectado");
    if (rows.length > 0) {
      console.log("Último dato:", rows[0]);
    } else {
      console.log("⚠️ No hay datos en los últimos 15 minutos.");
    }
  } catch (err) {
    console.error("❌ Error al probar conexión:", err);
  }
};

testConnection();

export { influxDB, queryApi };
