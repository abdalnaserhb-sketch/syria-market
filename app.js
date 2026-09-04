// Syria Market
// Main application entry point

const SyriaMarket = {
    name: "Syria Market",
    version: "1.0.0",

    config: {
        currency: "SYP",
        language: "ar",
        country: "SY"
    },

    init() {
        console.log("Syria Market initialized");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    SyriaMarket.init();
});
