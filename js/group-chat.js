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


/* =========================
   GROUP CHAT
========================= */

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
        (
            params.get("code") ||
            ""
        ).toUpperCase();

    const groupUserId =
        getAnonymousId();

    let groupSocket = null;


    /* =====================
       GROUP URLS
    ===================== */

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


    /* =====================
       GROUP STATUS
    ===================== */

    function setGroupStatus(
        text,
        connected = false
    ) {

        if (!groupChatStatus) {
            return;
        }

        groupChatStatus.textContent =
            text;

        groupChatStatus.classList.toggle(
            "connected",
            connected
        );

        groupChatStatus.classList.toggle(
            "disconnected",
            !connected
        );
    }


    /* =====================
       LOAD GROUP
    ===================== */

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


    /* =====================
       LOAD GROUP MESSAGES
    ===================== */

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

        if (
            oldMessages.length > 0 &&
            emptyMessage
        ) {

            emptyMessage.style.display =
                "none";
        }

        oldMessages.forEach(
            function (message) {

                addGroupMessage(
                    message
                );
            }
        );
    }


    /* =====================
       ADD GROUP MESSAGE
    ===================== */

    function addGroupMessage(
        message
    ) {

        if (!groupMessages) {
            return;
        }

        if (emptyMessage) {

            emptyMessage.style.display =
                "none";
        }

        const isMine =
            message.sender_id ===
            groupUserId;

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            isMine
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
            isMine
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


    /* =====================
       CONNECT GROUP
    ===================== */

    function connectToGroup() {

        const protocol =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";

        groupSocket =
            new WebSocket(
                `${WS_URL}/ws/groups/${
                    encodeURIComponent(
                        groupCode
                    )
                }`
            );

        groupSocket.addEventListener(
            "open",
            function () {

                console.log(
                    "Group chat connected"
                );

                setGroupStatus(
                    "Connected",
                    true
                );

                if (groupSendButton) {

                    groupSendButton.disabled =
                        false;
                }

                if (groupMessageInput) {

                    groupMessageInput.focus();
                }
            }
        );


        groupSocket.addEventListener(
            "message",
            function (event) {

                let data;

                try {

                    data =
                        JSON.parse(
                            event.data
                        );

                } catch (error) {

                    console.error(
                        "Invalid group chat data:",
                        error
                    );

                    return;
                }

                console.log(
                    "GROUP EVENT:",
                    data
                );


                /* CONNECTED */

                if (
                    data.type ===
                    "connected"
                ) {

                    setGroupStatus(
                        "Connected",
                        true
                    );

                    if (data.group) {

                        groupTitle.textContent =
                            data.group.name;

                        if (groupCodeElement) {

                            groupCodeElement.textContent =
                                data.group.code;
                        }
                    }
                }


                /* MESSAGE */

                else if (
                    data.type ===
                    "message"
                ) {

                    addGroupMessage(
                        data
                    );
                }


                /* GROUP DELETED */

                else if (
                    data.type ===
                    "group_deleted"
                ) {

                    setGroupStatus(
                        "Group deleted",
                        false
                    );

                    alert(
                        data.reason ||
                        "This group has expired."
                    );

                    window.location.href =
                        "group.html";
                }


                /* ERROR */

                else if (
                    data.type ===
                    "error"
                ) {

                    console.error(
                        "Group chat error:",
                        data.message
                    );
                }
            }
        );


        groupSocket.addEventListener(
            "close",
            function () {

                console.log(
                    "Group chat disconnected"
                );

                setGroupStatus(
                    "Disconnected",
                    false
                );

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
                    "Group WebSocket error:",
                    error
                );

                setGroupStatus(
                    "Connection error",
                    false
                );

                if (groupSendButton) {

                    groupSendButton.disabled =
                        true;
                }
            }
        );
    }


    /* =====================
       SEND GROUP MESSAGE
    ===================== */

    groupMessageForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const content =
                groupMessageInput
                    ? groupMessageInput.value.trim()
                    : "";

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
                    type: "message",
                    sender_id: groupUserId,
                    content: content
                })
            );

            groupMessageInput.value = "";

            groupMessageInput.focus();
        }
    );


    /* =====================
       LEAVE GROUP
    ===================== */

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


    /* =====================
       START GROUP CHAT
    ===================== */

    async function startGroupChat() {

        if (!groupCode) {

            alert(
                "No group code provided."
            );

            window.location.href =
                "group.html";

            return;
        }

        try {

            await loadGroup();

            await loadGroupMessages();

            connectToGroup();

        } catch (error) {

            console.error(
                "Group loading failed:",
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

