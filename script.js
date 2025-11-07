const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const modal = new bootstrap.Modal(document.getElementById("taskModal"));
const taskDateInput = document.getElementById("taskDate");
const taskTextInput = document.getElementById("taskText");
const saveTaskBtn = document.getElementById("saveTaskBtn");

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

function renderCalendar() {
  calendar.innerHTML = ""; // limpia los días
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  monthTitle.innerText = `${monthNames[month]} ${year}`; // actualiza el título

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Espacios vacíos antes del primer día
  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${month + 1}-${day}`;
    const div = document.createElement("div");
    div.className = "day border";

    const dayTasks = tasks[date] || [];

    div.innerHTML = `
      <div class="fw-bold">${day}</div>
      <div class="tasks text-muted small">${dayTasks.join(", ")}</div>
    `;

    if (day === now.getDate()) div.classList.add("today");
    if (dayTasks.length > 0) div.classList.add("has-task");

    div.addEventListener("click", () => {
      taskDateInput.value = date;
      taskTextInput.value = "";
      modal.show();
    });

    calendar.appendChild(div);
  }
}

saveTaskBtn.addEventListener("click", () => {
  const date = taskDateInput.value;
  const text = taskTextInput.value.trim();
  if (!text) return;

  if (!tasks[date]) tasks[date] = [];
  tasks[date].push(text);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  modal.hide();
  renderCalendar();
});

renderCalendar();


renderCalendar();


