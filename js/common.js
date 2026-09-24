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

// formated chat
// 
//
//
//
//
//

/* =========================
   MESSAGE FORMATTING
========================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function renderMessageContent(content) {

    let text = escapeHtml(content);

    const tokens = [];


    function storeToken(html) {

        const index =
            tokens.push(html) - 1;

        return `\uE000${index}\uE001`;
    }


    /* =====================
       CODE BLOCKS
    ===================== */

    text = text.replace(
        /```(?:[a-zA-Z0-9_+#.-]*)?\n?([\s\S]*?)```/g,
        function (_, code) {

            return storeToken(
                `<pre><code>${code}</code></pre>`
            );
        }
    );


    /* =====================
       INLINE CODE
    ===================== */

    text = text.replace(
        /`([^`\n]+)`/g,
        function (_, code) {

            return storeToken(
                `<code>${code}</code>`
            );
        }
    );


    /* =====================
       BOLD
    ===================== */

    text = text.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );


    /* =====================
       ITALIC
    ===================== */

    text = text.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    /* =====================
       STRIKETHROUGH
    ===================== */

    text = text.replace(
        /~~(.+?)~~/g,
        "<del>$1</del>"
    );


    /* =====================
       LINKS
    ===================== */

    text = text.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );


    /* =====================
       LINE BREAKS
    ===================== */

    text = text.replace(
        /\n/g,
        "<br>"
    );


    /* =====================
       RESTORE CODE
    ===================== */

    text = text.replace(
        /\uE000(\d+)\uE001/g,
        function (_, index) {

            return tokens[
                Number(index)
            ];
        }
    );


    return text;
}