const pointerGlow = document.querySelector(".pointer-glow");

if (pointerGlow) {
    window.addEventListener("pointermove", (event) => {
        pointerGlow.style.transform = `translate(${event.clientX - 288}px, ${event.clientY - 288}px)`;
    });
}

const tiltCards = document.querySelectorAll(".tilt-card");

tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
        card.style.transform = "";
    });
});

const journeyTabs = document.querySelectorAll(".journey-tab");
const journeyPanels = document.querySelectorAll(".journey-panel");

journeyTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.journey;
        journeyTabs.forEach((button) => {
            const active = button === tab;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        journeyPanels.forEach((panel) => {
            panel.classList.toggle("is-active", panel.dataset.panel === target);
        });
    });
});

const overlayModal = document.getElementById("overlayModal");
const openOverlayButtons = document.querySelectorAll("[data-open-overlay]");
const closeOverlayButton = document.querySelector("[data-close-overlay]");

if (overlayModal && closeOverlayButton) {
    openOverlayButtons.forEach((button) => {
        button.addEventListener("click", () => overlayModal.showModal());
    });

    closeOverlayButton.addEventListener("click", () => overlayModal.close());

    overlayModal.addEventListener("click", (event) => {
        const rect = overlayModal.getBoundingClientRect();
        const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
        if (!inside) {
            overlayModal.close();
        }
    });
}
