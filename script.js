// ======== Selección de elementos ========
const calendar = document.getElementById("calendar");
const weekdaysDiv = document.getElementById("weekdays");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const modal = new bootstrap.Modal(document.getElementById("eventModal"));
const selectedDateText = document.getElementById("selectedDateText");
const setExamBtn = document.getElementById("setExam");
const setExtraBtn = document.getElementById("setExtra");
const setCallBtn = document.getElementById("setCall");
const clearDayBtn = document.getElementById("clearDay");
const examInputContainer = document.getElementById("examInputContainer");
const examNumberInput = document.getElementById("examNumber");
const saveExamNumberBtn = document.getElementById("saveExamNumber");
const extraInputContainer = document.getElementById("extraInputContainer");
const extraNumberInput = document.getElementById("extraNumber");
const saveExtraNumberBtn = document.getElementById("saveExtraNumber");
const examInfo = document.getElementById("examInfo");

// ======== Datos ========
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let selectedDate = null;

// ======== Funciones ========

// Renderiza los días de la semana
function renderWeekdays() {
  weekdaysDiv.innerHTML = "";
  dayNames.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.classList.add("text-center", "fw-bold");
    weekdaysDiv.appendChild(div);
  });
}

// Inicializa los selectores de mes y año
function initSelectors() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  monthNames.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = name;
    if (i === currentMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  });

  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }
}

// Limpia botones activos en el modal
function clearActiveButtons() {
  const buttons = document.querySelectorAll(".modal-body .btn");
  buttons.forEach(btn => btn.classList.remove("active"));
}

// Renderiza el calendario completo
function renderCalendar() {
  calendar.innerHTML = "";
  examInfo.innerHTML = "";

  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7;

  // Espacios vacíos iniciales
  for (let i = 1; i < startDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${month + 1}-${day}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `<div class="fw-bold">${day}</div>`;
    
    const event = events[date];

    if (event) {
  const hasExam = !!event.alumnos;
  const hasExtra = !!event.clases;

  if (hasExam && hasExtra) {
    div.classList.add("split"); // split horizontal
  } else if (hasExam) {
    div.classList.add("day-red");
  } else if (hasExtra) {
    div.classList.add("day-blue");
  }

  if (event.call) div.classList.add("day-call");

  if (hasExtra && hasExam) {
    div.innerHTML += `
      <div style="font-size:0.7rem; margin-bottom:6px;">${event.clases} ext</div>
      <div style="font-size:0.7rem; margin-top:6px;">${event.alumnos} Al.s</div>
    `;
  } else if (hasExtra) {
    div.innerHTML += `<div style="font-size:0.7rem;">${event.clases} ext</div>`;
  } else if (hasExam) {
    div.innerHTML += `<div style="font-size:0.7rem">${event.alumnos} Al.s</div>`;
  }

  if (hasExam) {
    const infoP = document.createElement("p");
    infoP.textContent = `El ${day}/${month + 1}/${year} subieron ${event.alumnos} alumnos a examen.`;
    infoP.style.fontSize = "0.7rem"; 
    examInfo.appendChild(infoP);
  }
}


    // Evento click para modal
    div.addEventListener("click", () => {
      selectedDate = date;
      selectedDateText.textContent = `Día ${day} de ${monthNames[month]} de ${year}`;
      examInputContainer.style.display = "none";
      extraInputContainer.style.display = "none";
      examNumberInput.value = "";
      extraNumberInput.value = "";
      clearActiveButtons();
      modal.show();
    });

    calendar.appendChild(div);
  }
}

// ======== Eventos del modal ========

// Examen
setExamBtn.addEventListener("click", () => {
  examInputContainer.style.display = "block";
  extraInputContainer.style.display = "none";
  clearActiveButtons();
  setExamBtn.classList.add("active");
});

// Guardar examen
saveExamNumberBtn.addEventListener("click", () => {
  const num = parseInt(examNumberInput.value);
  if (selectedDate && num > 0) {
    if (!events[selectedDate]) events[selectedDate] = {};
    events[selectedDate].alumnos = num;

    // Determinar tipo
    if (events[selectedDate].clases) {
      events[selectedDate].type = "split";
    } else {
      events[selectedDate].type = "examen";
    }

    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

// Clases extra
setExtraBtn.addEventListener("click", () => {
  extraInputContainer.style.display = "block";
  examInputContainer.style.display = "none";
  clearActiveButtons();
  setExtraBtn.classList.add("active");
});

// Guardar clases extra
saveExtraNumberBtn.addEventListener("click", () => {
  const num = parseInt(extraNumberInput.value);
  if (selectedDate && num >= 1 && num <= 7) {
    if (!events[selectedDate]) events[selectedDate] = {};
    events[selectedDate].clases = num;

    if (events[selectedDate].alumnos) {
      events[selectedDate].type = "split";
    } else {
      events[selectedDate].type = "extra";
    }

    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

// Llamada post-examen
setCallBtn.addEventListener("click", () => {
  if (selectedDate) {
    if (!events[selectedDate]) events[selectedDate] = {};
    events[selectedDate].call = true;
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    clearActiveButtons();
    setCallBtn.classList.add("active");
    modal.hide();
    renderCalendar();
  }
});

// Borrar día
clearDayBtn.addEventListener("click", () => {
  if (selectedDate) {
    delete events[selectedDate];
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    clearActiveButtons();
    modal.hide();
    renderCalendar();
  }
});

// Exportar PDF con título mes/año y días de la semana + calendario + info
document.getElementById("exportPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "mm", "a4");

  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);

  // Ocultar selectores y botón de exportar
  const controls = document.querySelector(".d-flex");
  const exportBtn = document.getElementById("exportPDF");
  if (controls) controls.style.display = "none";
  if (exportBtn) exportBtn.style.display = "none";

  await new Promise(r => setTimeout(r, 250));

  // Crear contenedor temporal solo con título, días de la semana, calendario y info
  const tempContainer = document.createElement("div");
  tempContainer.style.padding = "0";
  tempContainer.style.background = "white"; // fondo blanco para PDF

  // Título mes/año
  const title = document.createElement("h3");
  title.textContent = `Calendario — ${monthNames[month]} ${year}`;
  title.style.fontSize = "12pt"; // tamaño moderado
  title.style.marginBottom = "5px";
  tempContainer.appendChild(title);

  // Clonar días de la semana
  const weekdaysClone = document.getElementById("weekdays").cloneNode(true);
  weekdaysClone.style.marginBottom = "4px";
  tempContainer.appendChild(weekdaysClone);

  // Clonar calendario y examInfo
  tempContainer.appendChild(document.getElementById("calendar").cloneNode(true));
  tempContainer.appendChild(document.getElementById("examInfo").cloneNode(true));

  document.body.appendChild(tempContainer);

  // Renderizar con html2canvas
  const canvas = await html2canvas(tempContainer, { 
    scale: 2, useCORS: true, scrollY: -window.scrollY,
    windowWidth: tempContainer.offsetWidth,
    windowHeight: tempContainer.offsetHeight
  });

  const imgData = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20; // margen 10mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Añadir imagen del calendario
  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

  pdf.save(`Calendario_${monthNames[month]}_${year}.pdf`);

  // Limpiar contenedor temporal
  document.body.removeChild(tempContainer);

  // Restaurar controles
  if (controls) controls.style.display = "flex";
  if (exportBtn) exportBtn.style.display = "inline-block";
});


// Cambios de mes/año
monthSelect.addEventListener("change", renderCalendar);
yearSelect.addEventListener("change", renderCalendar);

// Inicialización
initSelectors();
renderWeekdays();
renderCalendar();











