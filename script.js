let data = JSON.parse(localStorage.getItem("pmData")) || { projects: {} };
let currentProject = null;

function save() {
  localStorage.setItem("pmData", JSON.stringify(data));
}

function addProject() {
  const name = document.getElementById("projectName").value.trim();
  if (!name || data.projects[name]) return;

  data.projects[name] = { opened: [], processing: [], waiting: [], completed: [] };
  currentProject = name;
  save();
  renderProjects();
}

function switchProject() {
  currentProject = document.getElementById("projectSelect").value;
  renderBoard();
}

function renderProjects() {
  const select = document.getElementById("projectSelect");
  select.innerHTML = "";

  for (let project in data.projects) {
    const option = document.createElement("option");
    option.value = project;
    option.textContent = project;
    select.appendChild(option);
  }

  if (!currentProject) currentProject = Object.keys(data.projects)[0];
  select.value = currentProject;
  renderBoard();
}

function addTask() {
  if (!currentProject) return;

  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;

  const task = {
    title,
    due: document.getElementById("dueDate").value,
    priority: document.getElementById("priority").value,
    desc: document.getElementById("description").value
  };

  data.projects[currentProject].opened.push(task);
  save();
  renderBoard();
}

function renderBoard() {
  ["opened","processing","waiting","completed"].forEach(status => {
    const column = document.getElementById(status);
    column.innerHTML = "";

    data.projects[currentProject][status].forEach((task, index) => {
      const div = document.createElement("div");
      div.className = `task ${task.priority.toLowerCase()}`;
      div.draggable = true;

      div.ondragstart = e => {
        e.dataTransfer.setData("text", JSON.stringify({status, index}));
      };

      div.innerHTML = `
        <button class="delete-btn" onclick="deleteTask('${status}', ${index})">✖</button>
        <strong>${task.title}</strong>
        <small>Due: ${task.due || "N/A"}</small>
        <small>Priority: ${task.priority}</small>
        <small>${task.desc}</small>
        <div class="actions">
          <button onclick="moveTask('${status}', ${index}, 'opened')">Opened</button>
          <button onclick="moveTask('${status}', ${index}, 'processing')">Processing</button>
          <button onclick="moveTask('${status}', ${index}, 'waiting')">Waiting</button>
          <button onclick="moveTask('${status}', ${index}, 'completed')">Completed</button>
        </div>
      `;

      column.appendChild(div);
    });
  });
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const {status, index} = JSON.parse(e.dataTransfer.getData("text"));
  const target = e.currentTarget.dataset.status;

  const task = data.projects[currentProject][status].splice(index, 1)[0];
  data.projects[currentProject][target].push(task);

  save();
  renderBoard();
}

function moveTask(fromStatus, index, toStatus) {
  if (fromStatus === toStatus) return;

  const task = data.projects[currentProject][fromStatus].splice(index, 1)[0];
  data.projects[currentProject][toStatus].push(task);

  save();
  renderBoard();
}

function deleteTask(status, index) {
  data.projects[currentProject][status].splice(index, 1);
  save();
  renderBoard();
}

renderProjects();
