/* =========================
   BACKEND
========================= */

const API_URL =
    "http://127.0.0.1:8000";


/* =========================
   DARK MODE
========================= */

function setupTheme() {

    const savedTheme =
        localStorage.getItem(
            "randomconnect_theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }


    let themeButton =
        document.getElementById(
            "theme-toggle"
        );


    /*
        If the HTML page does not already
        have a theme button, create one.
    */

    if (!themeButton) {

        themeButton =
            document.createElement(
                "button"
            );

        themeButton.id =
            "theme-toggle";

        themeButton.className =
            "theme-toggle";

        themeButton.type =
            "button";


        const nav =
            document.querySelector(
                "nav"
            );


        const header =
            document.querySelector(
                "header"
            );


        if (nav) {

            nav.appendChild(
                themeButton
            );

        }

        else if (header) {

            header.appendChild(
                themeButton
            );

        }

    }


    if (!themeButton) {
        return;
    }


    function updateThemeButton() {

        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeButton.innerHTML =
            dark
                ? "☀️ Light"
                : "🌙 Dark";

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


setupTheme();


/* =========================
   RANDOM CHAT
========================= */

const matchingScreen =
    document.getElementById(
        "matching-screen"
    );


const conversation =
    document.getElementById(
        "conversation"
    );


const chatStatus =
    document.getElementById(
        "chat-status"
    );


const chatDescription =
    document.getElementById(
        "chat-description"
    );


const chatActionBtn =
    document.getElementById(
        "chat-action-btn"
    );


const messageForm =
    document.getElementById(
        "message-form"
    );


const messageInput =
    document.getElementById(
        "message-input"
    );


const messages =
    document.getElementById(
        "messages"
    );


if (
    matchingScreen &&
    conversation
) {

    setTimeout(
        function () {

            matchingScreen.style.display =
                "none";


            conversation.style.display =
                "flex";


            if (chatStatus) {

                chatStatus.textContent =
                    "Connected";

            }


            if (chatDescription) {

                chatDescription.textContent =
                    "You are chatting anonymously.";

            }


            if (chatActionBtn) {

                chatActionBtn.textContent =
                    "Leave Chat";

            }

        },
        2000
    );

}


if (
    messageForm &&
    messageInput &&
    messages
) {

    messageForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const messageText =
                messageInput.value.trim();


            if (
                messageText === ""
            ) {

                return;

            }


            const message =
                document.createElement(
                    "div"
                );


            message.classList.add(
                "message",
                "sent"
            );


            const paragraph =
                document.createElement(
                    "p"
                );


            paragraph.textContent =
                messageText;


            message.appendChild(
                paragraph
            );


            messages.appendChild(
                message
            );


            messageInput.value =
                "";


            messages.scrollTop =
                messages.scrollHeight;

        }
    );

}


if (chatActionBtn) {

    chatActionBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


/* =========================
   GROUP PAGE
========================= */

const createGroupForm =
    document.getElementById(
        "create-group-form"
    );


const joinGroupForm =
    document.getElementById(
        "join-group-form"
    );


const groupNameInput =
    document.getElementById(
        "group-name"
    );


const groupCodeInput =
    document.getElementById(
        "group-code"
    );


const groupResult =
    document.getElementById(
        "group-result"
    );


/* =========================
   CREATE GROUP
========================= */

if (createGroupForm) {

    createGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const groupName =
                groupNameInput.value.trim();


            if (
                groupName === ""
            ) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/groups`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name:
                                        groupName
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    groupResult.style.display =
                        "block";


                    groupResult.innerHTML = `
                        <h3>Unable to Create Group</h3>
                        <p>
                            ${data.detail ||
                            "Something went wrong."}
                        </p>
                    `;

                    return;

                }


                groupResult.style.display =
                    "block";


                groupResult.innerHTML = `
                    <h3>✓ Group Created!</h3>

                    <p>
                        Your group
                        <strong>${data.name}</strong>
                        is ready.
                    </p>

                    <p>
                        Group code:
                    </p>

                    <h2>${data.code}</h2>

                    <p>
                        Opening group chat...
                    </p>
                `;


                groupNameInput.value =
                    "";


                setTimeout(
                    function () {

                        window.location.href =
                            `group-chat.html?code=${
                                encodeURIComponent(
                                    data.code
                                )
                            }`;

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Group creation failed:",
                    error
                );


                groupResult.style.display =
                    "block";


                groupResult.innerHTML = `
                    <h3>Connection Error</h3>

                    <p>
                        Unable to connect to the server.
                    </p>
                `;

            }

        }
    );

}


/* =========================
   JOIN GROUP
========================= */

if (joinGroupForm) {

    joinGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const groupCode =
                groupCodeInput.value
                    .trim()
                    .toUpperCase();


            if (
                groupCode === ""
            ) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/groups/join`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    code:
                                        groupCode
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    groupResult.style.display =
                        "block";


                    groupResult.innerHTML = `
                        <h3>Unable to Join</h3>

                        <p>
                            ${data.detail ||
                            "Group not found."}
                        </p>
                    `;

                    return;

                }


                groupResult.style.display =
                    "block";


                groupResult.innerHTML = `
                    <h3>✓ Joined Successfully!</h3>

                    <p>
                        You joined
                        <strong>${data.name}</strong>
                    </p>

                    <p>
                        Opening group chat...
                    </p>
                `;


                groupCodeInput.value =
                    "";


                setTimeout(
                    function () {

                        window.location.href =
                            `group-chat.html?code=${
                                encodeURIComponent(
                                    data.code
                                )
                            }`;

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Group join failed:",
                    error
                );


                groupResult.style.display =
                    "block";


                groupResult.innerHTML = `
                    <h3>Connection Error</h3>

                    <p>
                        Unable to connect to the server.
                    </p>
                `;

            }

        }
    );

}


/* =========================
   GROUP CHAT
========================= */

const groupTitle =
    document.getElementById(
        "group-title"
    );


const groupCodeElement =
    document.getElementById(
        "group-code"
    );


const groupMessages =
    document.getElementById(
        "group-messages"
    );


const emptyMessage =
    document.getElementById(
        "empty-message"
    );


const groupMessageForm =
    document.getElementById(
        "group-message-form"
    );


const groupMessageInput =
    document.getElementById(
        "group-message-input"
    );


const groupChatStatus =
    document.getElementById(
        "group-chat-status"
    );


const groupSendButton =
    document.getElementById(
        "send-button"
    );


const groupLeaveButton =
    document.getElementById(
        "group-leave"
    );


if (
    groupTitle &&
    groupMessages &&
    groupMessageForm
) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const groupCode =
        params.get("code");


    const anonymousId =
        getAnonymousId();


    let groupSocket =
        null;


    function getGroupUrl() {

        return `${API_URL}/api/groups/${
            encodeURIComponent(
                groupCode
            )
        }`;

    }


    function getMessagesUrl() {

        return `${getGroupUrl()}/messages`;

    }


    async function loadGroup() {

        const response =
            await fetch(
                getGroupUrl()
            );


        if (!response.ok) {

            throw new Error(
                "Group not found"
            );

        }


        const group =
            await response.json();


        groupTitle.textContent =
            group.name;


        if (groupCodeElement) {

            groupCodeElement.textContent =
                group.code;

        }

    }


    async function loadGroupMessages() {

        const response =
            await fetch(
                getMessagesUrl()
            );


        if (!response.ok) {

            return;

        }


        const oldMessages =
            await response.json();


        oldMessages.forEach(
            addGroupMessage
        );

    }


    function addGroupMessage(
        message
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "none";

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            message.sender_id === anonymousId
                ? "chat-message own"
                : "chat-message";


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "bubble";


        bubble.textContent =
            message.content;


        const meta =
            document.createElement(
                "small"
            );


        meta.className =
            "meta";


        meta.textContent =
            message.sender_id === anonymousId
                ? "You"
                : "Anonymous";


        wrapper.appendChild(
            bubble
        );


        wrapper.appendChild(
            meta
        );


        groupMessages.appendChild(
            wrapper
        );


        groupMessages.scrollTop =
            groupMessages.scrollHeight;

    }


    function connectToGroup() {

        groupSocket =
            new WebSocket(
                `ws://127.0.0.1:8000/ws/groups/${
                    encodeURIComponent(
                        groupCode
                    )
                }`
            );


        groupSocket.addEventListener(
            "open",
            function () {

                if (groupChatStatus) {

                    groupChatStatus.textContent =
                        "Connected";

                    groupChatStatus.classList.add(
                        "connected"
                    );

                    groupChatStatus.classList.remove(
                        "disconnected"
                    );

                }


                if (groupSendButton) {

                    groupSendButton.disabled =
                        false;

                }


                groupMessageInput.focus();

            }
        );


        groupSocket.addEventListener(
            "message",
            function (event) {

                const data =
                    JSON.parse(
                        event.data
                    );


                if (
                    data.type ===
                    "connected"
                ) {

                    if (data.group) {

                        groupTitle.textContent =
                            data.group.name;

                    }

                }


                if (
                    data.type ===
                    "message"
                ) {

                    addGroupMessage(
                        data
                    );

                }


                if (
                    data.type ===
                    "group_deleted"
                ) {

                    if (groupChatStatus) {

                        groupChatStatus.textContent =
                            "Group deleted";

                    }


                    alert(
                        data.reason ||
                        "This group has expired."
                    );


                    window.location.href =
                        "group.html";

                }


                if (
                    data.type ===
                    "error"
                ) {

                    console.error(
                        data.message
                    );

                }

            }
        );


        groupSocket.addEventListener(
            "close",
            function () {

                if (groupChatStatus) {

                    groupChatStatus.textContent =
                        "Disconnected";

                    groupChatStatus.classList.remove(
                        "connected"
                    );

                    groupChatStatus.classList.add(
                        "disconnected"
                    );

                }


                if (groupSendButton) {

                    groupSendButton.disabled =
                        true;

                }

            }
        );


        groupSocket.addEventListener(
            "error",
            function (error) {

                console.error(
                    "WebSocket error:",
                    error
                );


                if (groupChatStatus) {

                    groupChatStatus.textContent =
                        "Connection error";

                }


                if (groupSendButton) {

                    groupSendButton.disabled =
                        true;

                }

            }
        );

    }


    groupMessageForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const content =
                groupMessageInput.value.trim();


            if (!content) {

                return;

            }


            if (
                !groupSocket ||
                groupSocket.readyState !==
                    WebSocket.OPEN
            ) {

                return;

            }


            groupSocket.send(
                JSON.stringify({

                    type:
                        "message",

                    sender_id:
                        anonymousId,

                    content:
                        content

                })
            );


            groupMessageInput.value =
                "";


            groupMessageInput.focus();

        }
    );


    if (groupLeaveButton) {

        groupLeaveButton.addEventListener(
            "click",
            function () {

                if (groupSocket) {

                    groupSocket.close();

                }


                window.location.href =
                    "group.html";

            }
        );

    }


    async function startGroupChat() {

        if (!groupCode) {

            alert(
                "No group code provided."
            );

            return;

        }


        try {

            await loadGroup();

            await loadGroupMessages();

            connectToGroup();

        } catch (error) {

            console.error(
                error
            );


            alert(
                "Group not found."
            );


            window.location.href =
                "group.html";

        }

    }


    startGroupChat();

}


/* =========================
   ANONYMOUS ID
========================= */

function getAnonymousId() {

    let id =
        localStorage.getItem(
            "randomconnect_id"
        );


    if (!id) {

        id =
            crypto.randomUUID();


        localStorage.setItem(
            "randomconnect_id",
            id
        );

    }


    return id;

}


/* =========================
   BACKEND CONNECTION TEST
========================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/status`
            );


        const data =
            await response.json();


        console.log(
            "Backend connected:",
            data
        );


    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

    }

}


checkBackend();