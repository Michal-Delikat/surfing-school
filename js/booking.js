export function initBooking() {
  const days = [...document.querySelectorAll("[data-date-start]")];
  const selection = document.getElementById("calendar-selection");
  const dateInput = document.getElementById("booking-date");
  const form = document.getElementById("booking-form");
  const status = document.getElementById("booking-status");
  if (!days.length || !selection || !dateInput || !form || !status) return;

  const labels = {
    10: "July 10, 2027",
    17: "July 17, 2027",
    24: "July 24, 2027",
  };

  let selectedStart = "";

  selection.setAttribute("aria-live", "polite");

  const select = (start) => {
    selectedStart = start;
    const label = labels[start] || "";
    dateInput.value = label;
    selection.textContent = label
      ? `Selected date: ${label}`
      : "No date selected yet.";

    for (const day of days) {
      day.setAttribute("aria-pressed", String(day.dataset.dateStart === start));
    }
  };

  for (const day of days) {
    day.addEventListener("click", () => select(day.dataset.dateStart));
  }

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

    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus("Complete the required fields and accept the terms (demo).", true);
      return;
    }

    const name = new FormData(form).get("name")?.toString().trim() || "";
    showStatus(
      `Demo: thank you${name ? `, ${name}` : ""}. Your selected date is ${labels[selectedStart]}. Nothing was sent or saved.`,
    );
  });
}
