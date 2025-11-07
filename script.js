const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const modal = new bootstrap.Modal(document.getElementById("eventModal"));
const selectedDateText = document.getElementById("selectedDateText");
const setDayBtn = document.getElementById("setDay");
const setExamBtn = document.getElementById("setExam");
const clearDayBtn = document.getElementById("clearDay");

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

  // Días vacíos al inicio
  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // Crear días del mes
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${month + 1}-${day}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `<div class="fw-bold">${day}</div>`;

    // Marca visual
    if (date === `${year}-${month + 1}-${now.getDate()}`) {
      div.classList.add("today");
    }

    if (events[date] === "dia") {
      div.classList.add("day-green");
    } else if (events[date] === "examen") {
      div.classList.add("day-red");
    }

    div.addEventListener("click", () => {
      selectedDate = date;
      selectedDateText.textContent = `Día ${day} de ${monthNames[month]}`;
      modal.show();
    });

    calendar.appendChild(div);
  }
}

setDayBtn.addEventListener("click", () => {
  if (selectedDate) {
    events[selectedDate] = "dia";
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    modal.hide();
    renderCalendar();
  }
});

setExamBtn.addEventListener("click", () => {
  if (selectedDate) {
    events[selectedDate] = "examen";
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

renderCalendar();

