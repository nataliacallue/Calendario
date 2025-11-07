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
const exportPDF = document.getElementById("exportPDF");
const calendarTitle = document.getElementById("calendarTitle");

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let selectedDate = null;

function renderWeekdays() {
  weekdaysDiv.innerHTML = "";
  dayNames.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    weekdaysDiv.appendChild(div);
  });
}

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
  calendarTitle.textContent = `📅 Calendario Escolar — ${monthNames[month]} ${year}`;

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
      return `<p>El ${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y} subieron ${e.alumnos} alumno${e.alumnos > 1 ? "s" : ""} a examen</p>`;
    });

  examInfo.innerHTML = examDays.join("") || "";
}

// Exportar a PDF
exportPDF.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  let yPos = 20;

  pdf.setFontSize(16);
  pdf.text(`Calendario ${monthNames[month]} ${year}`, 10, yPos);
  yPos += 10;

  const exámenes = Object.entries(events)
    .filter(([date, e]) => {
      const [y, m] = date.split("-");
      return parseInt(y) === year && parseInt(m) === month + 1 && e.type === "examen";
    })
    .map(([date, e]) => {
      const [y, m, d] = date.split("-");
      return `El ${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y} subieron ${e.alumnos} alumno${e.alumnos > 1 ? "s" : ""} a examen.`;
    });

  if (exámenes.length === 0) {
    pdf.setFontSize(12);
    pdf.text("No hay exámenes registrados este mes.", 10, yPos + 5);
  } else {
    pdf.setFontSize(12);
    exámenes.forEach((line) => {
      pdf.text(line, 10, yPos);
      yPos += 8;
    });
  }

  pdf.save(`Calendario_${monthNames[month]}_${year}.pdf`);
});

monthSelect.addEventListener("change", renderCalendar);
yearSelect.addEventListener("change", renderCalendar);

initSelectors();
renderWeekdays();
renderCalendar();




