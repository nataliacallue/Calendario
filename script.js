const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
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

let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let selectedDate = null;

function renderCalendar() {
  calendar.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  monthTitle.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${month + 1}-${day}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `<div class="fw-bold">${day}</div>`;

    if (date === `${year}-${month + 1}-${now.getDate()}`) {
      div.classList.add("today");
    }

    const event = events[date];
    if (event?.type === "dia") {
      div.classList.add("day-green");
    } else if (event?.type === "examen") {
      div.classList.add("day-red");
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
      return `El día ${d} de ${monthNames[m - 1]} de ${y} subieron a examen ${e.alumnos} alumno${e.alumnos > 1 ? "s" : ""}`;
    });

  examInfo.innerHTML = examDays.join("<br>") || "";
}

renderCalendar();
