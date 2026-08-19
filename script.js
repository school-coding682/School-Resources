const dayHeaders = document.querySelectorAll(".day-header");

dayHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;

    // Close all other days
    document.querySelectorAll(".day-content").forEach((day) => {
      if (day !== content) {
        day.classList.remove("open");
      }
    });

    // Toggle the clicked day
    content.classList.toggle("open");
  });
});
function timeToMinutes(time) {
  let [hours, minutes] = time.split(":").map(Number);

  // Your schedule uses 1:00, 2:00, etc. for PM
  if (hours >= 1 && hours <= 2) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

function updateWhatsNext() {
  const currentElement = document.getElementById("current-class");
  const nextElement = document.getElementById("next-class");

  if (!currentElement || !nextElement) return;

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const today = dayNames[new Date().getDay()];

  // Find today's day section
  const dayHeaders = document.querySelectorAll(".day-header");

  let todaySchedule = null;

  dayHeaders.forEach(header => {
    if (header.textContent.trim() === today) {
      todaySchedule = header.parentElement;
    }
  });

  // No school on weekends
  if (!todaySchedule) {
    currentElement.innerHTML = `
      <h3>No School Today</h3>
      <p>Enjoy your day off!</p>
    `;

    nextElement.innerHTML = "";
    return;
  }

  const periods = [];

  // Get all classes for today
  const items = todaySchedule.querySelectorAll(".day-content li");

  items.forEach(item => {
    const text = item.textContent.trim();

    // Find the time range
    const match = text.match(
      /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/
    );

    if (!match) return;

    const startTime = match[1];
    const endTime = match[2];

    // Remove the time from the class name
    const className = text
      .replace(match[0], "")
      .replace(/:\s*$/, "")
      .trim();

    periods.push({
      name: className,
      start: startTime,
      end: endTime,
      startMinutes: timeToMinutes(startTime),
      endMinutes: timeToMinutes(endTime)
    });
  });

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  let currentClass = null;
  let nextClass = null;

  // Find what's happening now and what's next
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];

    if (
      currentMinutes >= period.startMinutes &&
      currentMinutes < period.endMinutes
    ) {
      currentClass = period;
      nextClass = periods[i + 1] || null;
      break;
    }

    if (currentMinutes < period.startMinutes) {
      nextClass = period;
      break;
    }
  }

  // --------------------------------
  // SCHOOL HASN'T STARTED
  // --------------------------------

  if (!currentClass && nextClass) {
    currentElement.innerHTML = `
      <h3>School hasn't started yet</h3>
      <p>First up: ${nextClass.name}</p>
    `;

    nextElement.innerHTML = `
      <h3>➡️ Next: ${nextClass.name}</h3>
      <p>${nextClass.start} - ${nextClass.end}</p>
    `;

    return;
  }

  // --------------------------------
  // SCHOOL IS OVER
  // --------------------------------

  if (!currentClass && !nextClass) {
    currentElement.innerHTML = `
      <h3>School is over!</h3>
      <p>See you tomorrow!</p>
    `;

    nextElement.innerHTML = `
      <h3>Dismissal: 2:05</h3>
    `;

    return;
  }

  // --------------------------------
  // CURRENT CLASS
  // --------------------------------

  currentElement.innerHTML = `
    <h3>🟢 Now</h3>
    <strong>${currentClass.name}</strong>
    <p>${currentClass.start} - ${currentClass.end}</p>
  `;

  // --------------------------------
  // NEXT CLASS
  // --------------------------------

  if (nextClass) {
    nextElement.innerHTML = `
      <h3>➡️ Next</h3>
      <strong>${nextClass.name}</strong>
      <p>${nextClass.start} - ${nextClass.end}</p>
    `;
  } else {
    nextElement.innerHTML = `
      <h3>Next: Dismissal</h3>
      <p>2:05 PM</p>
    `;
  }
}

// Run when page loads
updateWhatsNext();

// Update every 30 seconds
setInterval(updateWhatsNext, 30000);
