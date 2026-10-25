import { initHeader } from "./header.js";
import { initHeroVideo } from "./hero-video.js";
import { initReveal } from "./reveal.js";
import { initBooking } from "./booking.js";
import { initStickyCta } from "./sticky-cta.js";

initHeader();
initHeroVideo();
initReveal();
initBooking();
initStickyCta();

for (const link of document.querySelectorAll('a[aria-disabled="true"]')) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
