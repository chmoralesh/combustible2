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
  console.log("Estos datos llegan a mi grafico", datos);
  if (!datos) {
    throw new Error("No se recibieron datos para generar gráfico");
  }
  // //Formatear tiempo
  // const formatearTiempo = (fechaISO) => {
  //   const fecha = new Date(fechaISO);
  //   const dd = String(fecha.getUTCDate()).padStart(2, "0");
  //   const mm = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // los meses van de 0-11
  //   const hh = String(fecha.getUTCHours()).padStart(2, "0");
  //   const min = String(fecha.getUTCMinutes()).padStart(2, "0");
  //   const ss = String(fecha.getUTCSeconds()).padStart(2, "0");

  //   return `${dd}-${mm}  ${hh}:${min}:${ss}`;
  // };
  // Formatear tiempo a hora chilena con 00:00 en vez de 24:00
  const formatearTiempo = (fechaISO) => {
    const fecha = new Date(fechaISO);

    // Obtener hora chilena usando Intl.DateTimeFormat
    const opciones = { timeZone: "America/Santiago" };
    const formatter = new Intl.DateTimeFormat("es-CL", {
      ...opciones,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Obtener las partes de la fecha
    const partes = formatter.formatToParts(fecha);
    let dia = partes.find((p) => p.type === "day").value;
    let mes = partes.find((p) => p.type === "month").value;
    let hora = partes.find((p) => p.type === "hour").value;
    let minuto = partes.find((p) => p.type === "minute").value;
    let segundo = partes.find((p) => p.type === "second").value;

    // Ajustar 24:00 → 00:00
    if (hora === "24") hora = "00";

    return `${dia}-${mes} ${hora}:${minuto}:${segundo}`;
  };

  const fechasISO = datos[3];
  const fechasFormateadas = fechasISO.map(formatearTiempo);

  // Extraemos los arrays según su posición

  const dato0 = datos[0]; //Pitch
  const dato1 = datos[1]; //Velocidad
  const dato2 = datos[2]; //Rendimiento
  const dato3 = datos[4]; //Presion Turbo
  const _time = fechasFormateadas;
  // const Pitch = datos[0].slice().reverse();
  // const Velocidad = datos[1].slice().reverse();
  // const Rendimiento = datos[2].slice().reverse();
  // const _time = fechasFormateadas.slice().reverse();

  const COLORS = [
    "rgb(75, 192, 192)", // Pitch
    "rgba(192, 130, 75, 1)", // Velocidad
    "rgba(89, 192, 75, 1)", // Rendimiento
    "rgba(240, 23, 240, 1)", // Rendimiento
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
          label: "Pitch",
          data: dato0,
          fill: false,
          borderColor: COLORS[0],
          tension: 0.1,
          yAxisID: "yDato0",
        },
        {
          label: "Velocidad",
          data: dato1,
          fill: false,
          borderColor: COLORS[1],
          tension: 0.1,
          yAxisID: "yDato1",
        },
        {
          label: "Rendimiento",
          data: dato2,
          fill: false,
          borderColor: COLORS[2],
          tension: 0.1,
          yAxisID: "yDato2",
        },
        {
          label: "Presión Turbo",
          data: dato3,
          fill: false,
          borderColor: COLORS[3],
          tension: 0.1,
          yAxisID: "yDato3",
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
        yDato0: {
          type: "linear",
          position: "left", // eje a la izquierda
          min: -100,
          max: 100,
          title: {
            display: true,
            text: "Pitch (%)",
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
        yDato1: {
          type: "linear",
          position: "left", // eje a la derecha
          min: 0,
          max: 20,
          title: {
            display: true,
            text: "Velocidad (kn)",
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
        yDato2: {
          type: "linear",
          position: "left", // eje a la derecha
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Rendimiento (l/Nm)",
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
        yDato3: {
          type: "linear",
          position: "left", // eje a la derecha
          min: 0,
          max: 3,
          title: {
            display: true,
            text: "Presión Turbo (bar)",
            color: COLORS[3],
            font: {
              size: TEXTSIZE, // tamaño de letra en px
            },
          },
          ticks: {
            color: COLORS[3],
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
