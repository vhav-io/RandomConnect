/* =========================
   BACKEND CONFIGURATION
========================= */

const API_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000"
        : "https://randomconnect-api.onrender.com";

const WS_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "ws://127.0.0.1:8000"
        : "wss://randomconnect-api.onrender.com";
