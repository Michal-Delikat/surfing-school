export function initBooking() {
  const days = [...document.querySelectorAll(".calendar__grid button.calendar__day")];
  for (const day of days) {
    if (!day.dataset.dateStart) {
      day.dataset.dateStart = day.textContent.trim();
      day.dataset.fullyBooked = "true";
    }
  }

  const selection = document.getElementById("calendar-selection");
  const dateInput = document.getElementById("booking-date");
  const timeInput = document.getElementById("booking-time");
  const times = document.getElementById("calendar-times");
  const timeList = document.getElementById("calendar-time-list");
  const course = document.getElementById("course");
  const form = document.getElementById("booking-form");
  const status = document.getElementById("booking-status");
  if (
    !days.length ||
    !selection ||
    !dateInput ||
    !timeInput ||
    !times ||
    !timeList ||
    !course ||
    !form ||
    !status
  ) {
    return;
  }

  const labelFor = (start) => (start ? `July ${start}, 2027` : "");
  const SESSION_RULES = {
    "first-wave": {
      days: [0, 1, 2, 3, 4, 5, 6],
      times: ["06:30", "08:00", "09:30", "11:00"],
    },
    "next-step": {
      days: [1, 3, 5, 6],
      times: ["09:30", "11:00", "12:30", "14:00"],
    },
    private: {
      days: [0, 2, 4, 6],
      times: ["06:30", "09:30", "12:30", "14:00"],
    },
  };

  let selectedStart = "";
  let selectedTime = "";

  selection.setAttribute("aria-live", "polite");

  const rulesFor = () => SESSION_RULES[course.value] || SESSION_RULES["first-wave"];
  const dayOfWeek = (start) => new Date(2027, 6, Number(start)).getDay();

  const slotsFor = (start) => {
    const day = Number(start);
    const { times: pool } = rulesFor();
    const count = Math.min(day % 2 === 0 ? 4 : 3, pool.length);
    const offset = day % pool.length;
    return Array.from(
      { length: count },
      (_, index) => pool[(offset + index) % pool.length],
    ).sort();
  };

  const updateSummary = () => {
    selection.textContent = selectedStart
      ? `Selected date: ${labelFor(selectedStart)}${selectedTime ? ` at ${selectedTime}` : ""}`
      : "No date selected yet.";
  };

  const renderTimes = (start) => {
    timeList.replaceChildren();
    selectedTime = "";
    timeInput.value = "";
    times.hidden = !start;
    if (!start) return;

    for (const slot of slotsFor(start)) {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "time-pill";
      pill.textContent = slot;
      pill.setAttribute("aria-pressed", "false");
      pill.addEventListener("click", () => {
        selectedTime = selectedTime === slot ? "" : slot;
        timeInput.value = selectedTime;
        for (const item of timeList.children) {
          item.setAttribute("aria-pressed", String(item.textContent === selectedTime));
        }
        updateSummary();
      });
      timeList.append(pill);
    }
  };

  const select = (start) => {
    selectedStart = start;
    dateInput.value = labelFor(start);

    for (const day of days) {
      day.setAttribute("aria-pressed", String(day.dataset.dateStart === start));
    }

    renderTimes(start);
    updateSummary();
  };

  const updateDayAvailability = () => {
    const rules = rulesFor();

    for (const day of days) {
      const start = day.dataset.dateStart;
      const fullyBooked = day.dataset.fullyBooked === "true";
      const offered = rules.days.includes(dayOfWeek(start));
      const available = offered && !fullyBooked;
      const stateLabel = fullyBooked
        ? "fully booked"
        : offered
          ? "available"
          : "not available for this session";

      day.disabled = !available;
      day.classList.toggle("is-available", available);
      day.classList.toggle("is-full", !available);
      day.setAttribute("aria-label", `${labelFor(start)}, ${stateLabel}`);
    }

    if (selectedStart) {
      const selectedDay = days.find((day) => day.dataset.dateStart === selectedStart);
      if (!selectedDay || selectedDay.disabled) select("");
    }
  };

  for (const day of days) {
    day.addEventListener("click", () => {
      const start = day.dataset.dateStart;
      select(start === selectedStart ? "" : start);
    });
  }

  course.addEventListener("change", () => {
    updateDayAvailability();
    if (selectedStart) {
      renderTimes(selectedStart);
      updateSummary();
    }
  });

  updateDayAvailability();

  const showStatus = (message, isError = false) => {
    status.hidden = false;
    status.classList.toggle("is-error", isError);
    status.textContent = message;
    status.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedStart) {
      showStatus("Pick a date in the calendar first. This is only a mock-up, but the order makes sense.", true);
      document.querySelector(".calendar")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    if (!selectedTime) {
      showStatus("Pick an available time for your session.", true);
      times.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus("Complete the required fields and accept the terms (demo).", true);
      return;
    }

    const name = new FormData(form).get("name")?.toString().trim() || "";
    showStatus(
      `Demo: thank you${name ? `, ${name}` : ""}. Your selected date is ${labelFor(selectedStart)} at ${selectedTime}. Nothing was sent or saved.`,
    );
  });
}
