function setupTheme() {

    const savedTheme =
        localStorage.getItem(
            "randomconnect_theme"
        );


    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }


    const themeButton =
        document.getElementById(
            "theme-toggle"
        );


    if (!themeButton) {
        return;
    }


    function updateThemeButton() {

        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeButton.textContent =
            dark
                ? "☀️"
                : "🌙";


        themeButton.setAttribute(
            "aria-label",
            dark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );


        themeButton.setAttribute(
            "title",
            dark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );
    }


    updateThemeButton();


    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "randomconnect_theme",
                dark
                    ? "dark"
                    : "light"
            );


            updateThemeButton();

        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupTheme();

        if (typeof checkBackend === "function") {
            checkBackend();
        }

    }
);