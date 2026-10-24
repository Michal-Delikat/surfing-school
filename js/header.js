export function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  let ticking = false;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener("scroll", onScroll, { passive: true });

  const dialog = document.getElementById("mobile-menu");
  const openButton = document.querySelector("[data-menu-open]");
  if (!dialog || !openButton) return;

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  openButton.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("is-locked");
    openButton.setAttribute("aria-expanded", "true");
    const closeButton = dialog.querySelector("[data-menu-close]");
    if (closeButton) closeButton.focus({ preventScroll: true });
  });

  for (const closeTrigger of dialog.querySelectorAll("[data-menu-close]")) {
    closeTrigger.addEventListener("click", closeDialog);
  }

  for (const link of dialog.querySelectorAll("[data-menu-link]")) {
    link.addEventListener("click", closeDialog);
  }

  dialog.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus({ preventScroll: true });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth >= 900) closeDialog();
    },
    { passive: true },
  );
}
