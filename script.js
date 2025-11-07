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

// Mostramos de lunes a domingo
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let selectedDate = null;

// Renderiza encabezado con nombres de días
function renderWeekdays() {
  weekdaysDiv.innerHTML = "";
  dayNames.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    weekdaysDiv.appendChild(div);
  });
}

// Inicializa selects
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

function renderCalendar() {
  calendar.innerHTML = "";

  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Calculamos qué día empieza el mes (1 = lunes, 7 = domingo)
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7; // domingo → 7

  // Espacios vacíos hasta el primer lunes
  for (let i = 1; i < startDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${month + 1}-${day}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `<div class="fw-bold">${day}</div>`;

    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      div.classList.add("today");
    }

    const event = events[date];
    if (event?.type === "dia") div.classList.add("day-green");
    else if (event?.type === "examen") div.classList.add("day-red");

    div.addEventListener("click", () => {
      selectedDate = date;
      selectedDateText.textContent = `Día ${day} de ${monthNames[month]} de ${year}`;
      examInputContainer.style.display = "none";
      examNumberInput.value = "";
      modal.show();
    });

    calendar.appendChild(div);
  }

  updateExamInfo();
}

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

function updateExamInfo() {
  const examDays = Object.entries(events)
    .filter(([_, e]) => e.type === "examen")
    .map(([date, e]) => {
      const [y, m, d] = date.split("-");
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y} subieron ${e.alumnos} alumno${e.alumnos > 1 ? "s" : ""} a examen`;
    });

  examInfo.innerHTML = examDays.join("<br>") || "";
}

monthSelect.addEventListener("change", renderCalendar);
yearSelect.addEventListener("change", renderCalendar);

// Inicialización
initSelectors();
renderWeekdays();
renderCalendar();




