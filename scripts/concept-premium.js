const revealTargets = document.querySelectorAll(".service-card, .workflow-grid article");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

revealTargets.forEach((target) => revealObserver.observe(target));

const tabs = document.querySelectorAll(".segment-tab");
const panels = document.querySelectorAll(".segment-panel");

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.segment;
        tabs.forEach((item) => {
            const active = item === tab;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        panels.forEach((panel) => {
            panel.classList.toggle("is-active", panel.dataset.panel === target);
        });
    });
});

const modal = document.getElementById("reelModal");
const openButton = document.querySelector("[data-open-reel]");
const closeButton = document.querySelector("[data-close-reel]");

if (modal && openButton && closeButton) {
    openButton.addEventListener("click", () => modal.showModal());
    closeButton.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
        const bounds = modal.getBoundingClientRect();
        const inside =
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom;
        if (!inside) {
            modal.close();
        }
    });
}
