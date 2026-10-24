export function initReveal() {
  const elements = [...document.querySelectorAll("[data-reveal]")];
  if (!elements.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    for (const element of elements) element.classList.add("is-visible");
    return;
  }

  document.documentElement.classList.add("reveal-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08,
    },
  );

  for (const element of elements) observer.observe(element);
}
