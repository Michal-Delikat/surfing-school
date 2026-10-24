export function initGallery() {
  const items = [...document.querySelectorAll("[data-gallery-item]")];
  const dialog = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const counter = document.getElementById("lightbox-counter");
  if (!items.length || !dialog || !image || !caption || !counter) return;

  const closeButton = dialog.querySelector("[data-lightbox-close]");
  const prevButton = dialog.querySelector("[data-lightbox-prev]");
  const nextButton = dialog.querySelector("[data-lightbox-next]");
  let current = 0;

  const update = () => {
    const item = items[current];
    image.src = item.dataset.full;
    image.alt = item.dataset.alt || "";
    caption.textContent = item.dataset.caption || "";
    counter.textContent = `${current + 1} / ${items.length}`;

    if (prevButton) prevButton.disabled = items.length < 2;
    if (nextButton) nextButton.disabled = items.length < 2;
  };

  const open = (index) => {
    current = index;
    update();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("is-locked");
    if (closeButton) closeButton.focus({ preventScroll: true });
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const step = (direction) => {
    current = (current + direction + items.length) % items.length;
    update();
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => open(index));
  });

  if (closeButton) closeButton.addEventListener("click", close);
  if (prevButton) prevButton.addEventListener("click", () => step(-1));
  if (nextButton) nextButton.addEventListener("click", () => step(1));

  dialog.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.classList.contains("lightbox__stage")) {
      close();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });
}
