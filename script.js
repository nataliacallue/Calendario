const calendar = document.getElementById("calendar");
const weekdaysDiv = document.getElementById("weekdays");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const modal = new bootstrap.Modal(document.getElementById("eventModal"));
const selectedDateText = document.getElementById("selectedDateText");
const setDayBtn = document.getElementById("setDay");
const setExamBtn = document.getElementById("setExam");
const clearDayBtn = document.getElementById("clearDay");
const examInputContainer = document.getElementById("examInputContainer");
const examNumberInput = document.getElementById("examNumber");
const saveExamNumberBtn = document.getElementById("saveExamNumber");
const examInfo = document.getElementById("examInfo");

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let selectedDate = null;

// === Días de la semana ===
function renderWeekdays() {
  weekdaysDiv.innerHTML = "";
  dayNames.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.classList.add("text-center", "fw-bold");
    weekdaysDiv.appendChild(div);
  });
}

// === Inicializar selectores ===
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

// === Generar calendario ===
function renderCalendar() {
  calendar.innerHTML = "";
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7;

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
    if (event?.type === "dia") div.classList.add("day-green");
    else if (event?.type === "examen") div.classList.add("day-red");

    if (event?.type === "examen") {
      const text = document.createElement("small");
      text.textContent = `Subieron ${event.alumnos}`;
      text.style.textDecoration = "underline";
      text.style.color = "red";
      div.appendChild(text);
    }

    div.addEventListener("click", () => {
      selectedDate = date;
      selectedDateText.textContent = `Día ${day} de ${monthNames[month]} de ${year}`;
      examInputContainer.style.display = "none";
      examNumberInput.value = "";
      modal.show();
    });

    calendar.appendChild(div);
  }
}

// === Acciones del modal ===
setDayBtn.addEventListener("click", () => {
  if (selectedDate) {
    events[selectedDate] = { type: "dia" };
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

setExamBtn.addEventListener("click", () => {
  examInputContainer.style.display = "block";
});

saveExamNumberBtn.addEventListener("click", () => {
  const num = parseInt(examNumberInput.value);
  if (selectedDate && num > 0) {
    events[selectedDate] = { type: "examen", alumnos: num };
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

clearDayBtn.addEventListener("click", () => {
  if (selectedDate) {
    delete events[selectedDate];
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

// === Exportar PDF limpio (sin botones ni selectores) ===
document.getElementById("exportPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape", "mm", "a4");
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);

  // Ocultar selectores, botón y leyenda
  const controls = document.querySelector(".d-flex");
  const exportBtn = document.getElementById("exportPDF");

  if (controls) controls.style.display = "none";
  if (exportBtn) exportBtn.style.display = "none";

  await new Promise(r => setTimeout(r, 250));

  const container = document.querySelector(".container");

  // Forzar altura completa del contenedor (para móvil)
  container.style.height = "auto";
  container.style.overflow = "visible";

  const canvas = await html2canvas(container, { 
    scale: 2, 
    useCORS: true, 
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.scrollHeight 
  });

  const imgData = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.text(`Calendario — ${monthNames[month]} ${year}`, 10, 10);
  pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);
  pdf.save(`Calendario_${monthNames[month]}_${year}.pdf`);

  // Restaurar visibilidad
  if (controls) controls.style.display = "flex";
  if (exportBtn) exportBtn.style.display = "inline-block";
});

// === Inicializar ===
monthSelect.addEventListener("change", renderCalendar);
yearSelect.addEventListener("change", renderCalendar);
initSelectors();
renderWeekdays();
renderCalendar();











