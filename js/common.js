/* =========================
   ANONYMOUS USER ID
========================= */

function getAnonymousId() {
    let id = localStorage.getItem("randomconnect_id");

    if (!id) {
        if (
            typeof crypto !== "undefined" &&
            crypto.randomUUID
        ) {
            id = crypto.randomUUID();
        } else {
            id =
                "user-" +
                Date.now() +
                "-" +
                Math.random().toString(36).slice(2);
        }

        localStorage.setItem("randomconnect_id", id);
    }

    return id;
}

/* =========================
   BACKEND CONNECTION TEST
========================= */

async function checkBackend() {
    try {
        const response = await fetch(
            `${API_URL}/api/status`
        );

        const data = await response.json();

        console.log("Backend connected:", data);
    } catch (error) {
        console.error(
            "Backend connection failed:",
            error
        );
    }
}
