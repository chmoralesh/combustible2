let fechaHoraInicioValue = null;
let fechaHoraFinValue = null;
let verPDF = false;
let stats = {};

const btnVerPDF = document.getElementById("pdfView");

// Función para actualizar la visibilidad del botón
const actualizarBotonPDF = () => {
  if (verPDF) {
    btnVerPDF.style.display = "block";
  } else {
    btnVerPDF.style.display = "none";
  }
};

// Inicializa el estado del botón al cargar la página
actualizarBotonPDF();

window.onload = () => {
  const now = new Date();
  const inicio = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  fechaHoraInicioValue = inicio.toISOString();
  fechaHoraFinValue = now.toISOString();

  const fpInicio = flatpickr("#fechaHoraInicio", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    defaultDate: inicio,
    position: "right",
    onChange: (selectedDates) => {
      fechaHoraInicioValue = selectedDates[0]
        ? selectedDates[0].toISOString()
        : null;
    },
  });
  flatpickr("#fechaHoraFin", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    defaultDate: now,
    position: "right",
    onChange: (selectedDates, dateStr, instance) => {
      fechaHoraFinValue = selectedDates[0]
        ? selectedDates[0].toISOString()
        : null;
    },
  });
};

const form = document.querySelector("form");

//---------------Generar datos y gráfico----------------

form.onsubmit = async (e) => {
  e.preventDefault();
  verPDF = true;
  actualizarBotonPDF(); // Actualiza el DOM para reflejar el cambio

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  // Usa las variables en formato ISO
  const desde = fechaHoraInicioValue;
  const hasta = fechaHoraFinValue;

  // Puedes agregar otros datos del formulario si lo necesitas
  try {
    //Consulta de datos
    const response = await fetch(
      `/parametros?desde=${encodeURIComponent(
        desde
      )}&hasta=${encodeURIComponent(hasta)}`
    );
    if (!response.ok) throw new Error(`Error parámetros: ${response.status}`);

    const result = await response.json();

    console.log("Datos recibidos:", result[0]);

    //Generación de gráfico
    const resultArray = Array.isArray(result) ? result : [result];

    const resGrafico = await fetch("/grafico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultArray),
    });

    // const resGrafico = await fetch("/grafico", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(result),
    // });

    if (!resGrafico.ok) throw new Error(`Error gráfico: ${resGrafico.status}`);
    //Consulta de estadisticas

    const resEstadisticas = await fetch(
      `/statistics?desde=${encodeURIComponent(
        desde
      )}&hasta=${encodeURIComponent(hasta)}`
    );

    if (!resEstadisticas.ok)
      throw new Error(`Error estadísticas: ${resEstadisticas.status}`);

    stats = await resEstadisticas.json();

    //console.log("Pasé por aquí");
    console.log("Estadísticas recibidas:", stats);
  } catch (error) {
    console.error("Error al consultar:", error);
  }
};

//---------------Generar PDF----------------

const comentario = document.getElementById("comentario");
const nombre = document.getElementById("nombre");

btnVerPDF.onclick = async () => {
  if (verPDF) {
    try {
      const response = await fetch("/invoice/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaInicio: fechaHoraInicioValue,
          fechaFin: fechaHoraFinValue,
          operador: nombre.value,
          comentario: comentario.value,
          stats: stats,
        }),
      });
      if (response.ok) {
        console.log("Esto era--->", response.body);
      }

      if (!response.ok) throw new Error("Error al generar PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  }
};
