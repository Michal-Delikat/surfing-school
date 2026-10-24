export function initBooking() {
  const days = [...document.querySelectorAll("[data-date-start]")];
  const selection = document.getElementById("calendar-selection");
  const dateInput = document.getElementById("booking-date");
  const form = document.getElementById("booking-form");
  const status = document.getElementById("booking-status");
  if (!days.length || !selection || !dateInput || !form || !status) return;

  const labels = {
    10: "10–11 lipca 2027",
    17: "17–18 lipca 2027",
    24: "24–25 lipca 2027",
  };

  let selectedStart = "";

  selection.setAttribute("aria-live", "polite");

  const select = (start) => {
    selectedStart = start;
    const label = labels[start] || "";
    dateInput.value = label;
    selection.textContent = label
      ? `Wybrany termin: ${label} · sobota–niedziela`
      : "Nie wybrano jeszcze terminu.";

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
      showStatus("Najpierw wybierz termin w kalendarzu. To tylko makieta, ale kolejność ma sens.", true);
      document.querySelector(".calendar")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus("Uzupełnij wymagane pola i zaakceptuj regulamin (demo).", true);
      return;
    }

    const name = new FormData(form).get("name")?.toString().trim() || "";
    showStatus(
      `Demo: dziękujemy${name ? `, ${name}` : ""}. Wybrany termin to ${labels[selectedStart]}. Nic nie zostało wysłane ani zapisane.`,
    );
  });
}
