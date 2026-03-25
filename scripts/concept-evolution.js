const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

revealItems.forEach((item) => revealObserver.observe(item));

const tabs = document.querySelectorAll(".journey-tab");
const panels = document.querySelectorAll(".journey-panel");

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const intent = tab.dataset.intent;
        tabs.forEach((button) => {
            const active = button === tab;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        panels.forEach((panel) => {
            panel.classList.toggle("is-active", panel.dataset.panel === intent);
        });
    });
});
