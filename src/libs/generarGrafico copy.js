import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs";
import path from "path";

// Tamaño del gráfico en píxeles
const width = 1600;
const height = 800;

// Instancia de ChartJSNodeCanvas
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  devicePixelRatio: 2,
});

export async function generarGrafico(datos) {
  if (!datos) {
    throw new Error("No se recibieron datos para generar gráfico");
  }
  //Formatear tiempo
  const formatearTiempo = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dd = String(fecha.getUTCDate()).padStart(2, "0");
    const mm = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // los meses van de 0-11
    const hh = String(fecha.getUTCHours()).padStart(2, "0");
    const min = String(fecha.getUTCMinutes()).padStart(2, "0");
    const ss = String(fecha.getUTCSeconds()).padStart(2, "0");

    return `${dd}-${mm}  ${hh}:${min}:${ss}`;
  };
  const fechasISO = datos[3];
  const fechasFormateadas = fechasISO.map(formatearTiempo);

  // Extraemos los arrays según su posición

  const consumo = datos[0];
  const rpm = datos[1];
  const velocidad = datos[2];
  const _time = fechasFormateadas;

  const COLORS = [
    "rgb(75, 192, 192)", // Consumo
    "rgba(192, 130, 75, 1)", // RPM
    "rgba(89, 192, 75, 1)", // Velocidad
  ];

  const TEXTSIZE = 18; // Tamaño de letra para ejes y leyenda
  const TITLESIZE = 24; // Tamaño de letra para ejes y leyenda
  const LINEWIDTH = 2; // Grosor de las líneas

  // Configuración de Chart.js
  const configuration = {
    type: "line",
    data: {
      labels: _time,
      datasets: [
        {
          label: "Consumo",
          data: consumo,
          fill: false,
          borderColor: COLORS[0],
          tension: 0.1,
          yAxisID: "yConsumo",
        },
        {
          label: "RPM",
          data: rpm,
          fill: false,
          borderColor: COLORS[1],
          tension: 0.1,
          yAxisID: "yRpm",
        },
        {
          label: "Velocidad",
          data: velocidad,
          fill: false,
          borderColor: COLORS[2],
          tension: 0.1,
          yAxisID: "yVelocidad",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            font: {
              size: TEXTSIZE,
            },
          },
        },
        title: {
          display: true,
          text: "", // el título
          font: {
            size: TITLESIZE, // tamaño de letra
            weight: "bold", // grosor
          },
          color: "#333", // color del título
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
            maxTicksLimit: 20, // solo se mostrarán como máximo 10 etiquetas
            maxRotation: 45, // ángulo máximo de rotación (grados)
            minRotation: 45, // ángulo mínimo de rotación
          },
        },
        yConsumo: {
          type: "linear",
          position: "left", // eje a la izquierda
          title: {
            display: true,
            text: "Consumo (L/s)",
            color: COLORS[0],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          ticks: {
            color: COLORS[0],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
        },
        yRpm: {
          type: "linear",
          position: "left", // eje a la derecha
          title: {
            display: true,
            text: "RPM",
            color: COLORS[1],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          ticks: {
            color: COLORS[1],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          grid: {
            drawOnChartArea: false, // evita dibujar la cuadrícula sobre la otra escala
          },
          offset: true,
        },
        yVelocidad: {
          type: "linear",
          position: "left", // eje a la derecha
          title: {
            display: true,
            text: "Velocidad (km/h)",
            color: COLORS[2],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          ticks: {
            color: COLORS[2],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          grid: { drawOnChartArea: false }, // evita superposición
          offset: true,
        },
      },
      responsive: true,

      // ⚙️ Configuración global de puntos (aplica si no se define en el dataset)
      elements: {
        point: {
          radius: 0, // Radio por defecto
          hoverRadius: 1, // Radio al hover
          borderWidth: 1, // Grosor del borde
          borderColor: "black", // Color del borde
          backgroundColor: "blue", // Color interno
          hitRadius: 10, // Área de detección
          style: "circle", // Estilo del punto
        },
        line: {
          borderWidth: LINEWIDTH, // Grosor de la línea
          //borderColor: 'black',  // Color de la línea
          // backgroundColor: 'rgba(0,0,0,0.05)', // Relleno bajo la línea
          fill: false, // Relleno bajo la línea (true/false)
          //tension: 0,            // Suavizado (0 recto, 1 curva máxima)
          //stepped: false,        // Estilo de línea escalonada
          //borderDash: [],        // Guiones (ej: [5,5])
          //borderDashOffset: 0,   // Desfase de los guiones
          //capBezierPoints: true, // Ajusta los puntos de las curvas (bezier)
        },
      },
    },
  };

  // Generar imagen como buffer PNG
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

  // Guardar en ruta del servidor
  const outputPath = path.join(process.cwd(), "public", "grafico.png");
  fs.writeFileSync(outputPath, imageBuffer);

  console.log(`Gráfico guardado en ${outputPath}`);

  return imageBuffer; // Por si quieres insertarlo directamente en un PDF
}
