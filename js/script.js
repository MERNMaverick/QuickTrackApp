var timer = null;
var startTime = null;
var elapsedTime = 0;

function startTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  document.getElementById("timerDisplay").textContent = "00:00:00";
  const taskNameInput = document.getElementById("activityName");
  document.getElementById("popupTaskName").querySelector("span").textContent =
    taskNameInput.value || "Unnamed Task";
  document.getElementById("taskPopup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  document.body.classList.add("no-scroll");
  startTime = new Date();
  elapsedTime = 0;
  timer = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  const endTime = new Date();
  const taskName =
    document.getElementById("activityName").value || "Unnamed Task";
  logEvent(taskName, startTime, endTime);
  updateLogsDisplay();
  closePopup();
}

function resetManualTaskForm() {
  document.getElementById("manualActivityName").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
}

function closePopup() {
  document.getElementById("taskPopup").style.display = "none";
  document.getElementById("manualTaskPopup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.body.classList.remove("no-scroll");
  resetManualTaskForm();
}


function logManualEvent() {
  document.getElementById("manualTaskPopup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  document.body.classList.add("no-scroll");
  const activityName = document.getElementById("manualActivityName").value;
  const start = new Date(document.getElementById("startTime").value);
  const end = new Date(document.getElementById("endTime").value);
  logEvent(activityName, start, end);
  updateLogsDisplay();
  closePopup();
}

function logEvent(activityName, start, end) {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.push({ activityName, startTime: start, endTime: end });
  localStorage.setItem("logs", JSON.stringify(logs));
}

function updateTimerDisplay() {
  const now = new Date();
  elapsedTime = now - startTime;
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  document.getElementById(
    "timerDisplay"
  ).textContent = `${hours}:${minutes}:${seconds}`;
}

function logEvent(activityName, start, end) {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const duration = end - start;
  const durationFormatted = new Date(duration).toISOString().substr(11, 8);
  logs.push({
    activityName,
    startTime: start.toLocaleTimeString(),
    endTime: end.toLocaleTimeString(),
    duration: durationFormatted,
  });
  localStorage.setItem("logs", JSON.stringify(logs));
}

function updateLogsDisplay() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const taskContainer = document.getElementById("tasksContainer");
  taskContainer.innerHTML = "";

  logs.forEach((log, index) => {
    const div = document.createElement("div");
    div.className = "taskItem";
    div.innerHTML = `
          <h3 class="taskName">${log.activityName}</h3>
          <p class="taskStartEnd">${log.startTime} - ${log.endTime}</p>
          <p class="duration">${log.duration}</p>
          <div class="actions">
              <span class="material-symbols-outlined delete" onclick="deleteLog(${index})">delete</span>
          </div>
      `;
    taskContainer.appendChild(div);
  });
}

function deleteLog(index) {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.splice(index, 1);
  localStorage.setItem("logs", JSON.stringify(logs));
  updateLogsDisplay();
}

function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning!";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon!";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening!";
  } else {
    greeting = "Good night!";
  }

  document.getElementById("userGreeting").innerText = greeting;
}
updateGreeting();

function calculateStatistics() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const duration = logs.duration;
  let initialDuration = 0;

  const totalTasks = logs.length;

  const totalDurationSeconds = logs.reduce((total, log) => {
    const [hours, minutes, seconds] = log.duration.split(":").map(Number);
    return total + hours * 3600 + minutes * 60 + seconds;
  }, 0);

  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const totalSeconds = totalDurationSeconds % 60;
  const totalDuration = [
    totalHours.toString().padStart(2, "0"),
    totalMinutes.toString().padStart(2, "0"),
    totalSeconds.toString().padStart(2, "0"),
  ].join(":");

  document.querySelector(".totalTime h2").textContent = totalDuration;

  function avgTime(logs) {
    if (!logs.length) return "00:00:00";
    const avgSeconds = Math.floor(
      logs
        .map((log) => {
          const [h, m, s] = log.duration.split(":").map(Number);
          return h * 3600 + m * 60 + s;
        })
        .reduce((total, seconds) => total + seconds, 0) / totalTasks
    );

    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);
    const seconds = avgSeconds % 60;

    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");
  }

  document.querySelector(".avgTime h2").textContent = avgTime(logs);

  document.querySelector(".totalTasks h2").textContent = totalTasks;
}

document.addEventListener("DOMContentLoaded", function () {
  updateLogsDisplay();
  calculateStatistics();
  setInterval(updateLogsDisplay, 1000);
  setInterval(calculateStatistics, 1000);
});
