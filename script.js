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

    // Colores por tipo
    if (event?.type === "examen") div.classList.add("day-red");
    else if (event?.type === "extra") div.classList.add("day-blue");

    // Llamada post-examen
    if (event?.call) div.classList.add("day-call");

    // Texto dentro de la casilla
    if (event?.type === "examen") {
      div.innerHTML += `<div>Examen</div>`;
      const infoP = document.createElement("p");
      infoP.textContent = `El ${day.toString().padStart(2,"0")}/${(month+1).toString().padStart(2,"0")}/${year} subieron ${event.alumnos} alumnos a examen.`;
      infoP.style.color = "black";
      examInfo.appendChild(infoP);
    } else if (event?.type === "extra") {
      div.innerHTML += `<div>${event.clases} clase(s) extra</div>`;
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
    events[selectedDate] = { type: "examen", alumnos: num };
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
    events[selectedDate] = { type: "extra", clases: num };
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

// Exportar PDF
document.getElementById("exportPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape", "mm", "a4");
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);

  const controls = document.querySelector(".d-flex");
  const exportBtn = document.getElementById("exportPDF");
  if (controls) controls.style.display = "none";
  if (exportBtn) exportBtn.style.display = "none";

  await new Promise(r => setTimeout(r, 250));

  const container = document.querySelector(".container");
  container.style.height = "auto";
  container.style.overflow = "visible";

  const canvas = await html2canvas(container, { 
    scale: 2, useCORS: true, scrollY: -window.scrollY,
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.offsetHeight
  });

  const imgData = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.text(`Calendario — ${monthNames[month]} ${year}`, 10, 10);
  pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);
  pdf.save(`Calendario_${monthNames[month]}_${year}.pdf`);

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


