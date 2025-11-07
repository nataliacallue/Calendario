const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');

let events = JSON.parse(localStorage.getItem('events')) || [];

function renderEvents() {
  list.innerHTML = '';
  events.forEach((ev, index) => {
    const li = document.createElement('li');
    li.textContent = `${ev.date}: ${ev.text}`;
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.onclick = () => {
      events.splice(index, 1);
      saveEvents();
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents();
}

form.onsubmit = (e) => {
  e.preventDefault();
  const date = document.getElementById('eventDate').value;
  const text = document.getElementById('eventText').value;
  events.push({ date, text });
  saveEvents();
  form.reset();
};

renderEvents();
