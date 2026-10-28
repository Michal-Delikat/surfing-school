export function initStickyCta() {
  const cta = document.getElementById("mobile-cta");
  const hero = document.querySelector(".hero");
  if (!cta || !hero) return;

  const blockers = [
    document.getElementById("terminy"),
    document.querySelector(".site-footer"),
  ].filter(Boolean);

  const intersecting = new Set();
  let ticking = false;

  const update = () => {
    const pastHero = hero.getBoundingClientRect().bottom < window.innerHeight * 0.35;
    cta.classList.toggle("is-visible", pastHero && intersecting.size === 0);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }
        requestUpdate();
      },
      { threshold: 0.08 },
    );
    for (const blocker of blockers) observer.observe(blocker);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}
