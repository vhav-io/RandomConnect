/* =========================
   RANDOM CHAT
========================= */

const matchingScreen = document.getElementById("matching-screen");
const conversation = document.getElementById("conversation");

const chatStatus = document.getElementById("chat-status");
const chatDescription = document.getElementById("chat-description");

const chatActionBtn = document.getElementById("chat-action-btn");

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

const messages = document.getElementById("messages");


if (matchingScreen && conversation) {

    setTimeout(function () {

        matchingScreen.style.display = "none";

        conversation.style.display = "flex";

        chatStatus.textContent = "Connected";

        chatDescription.textContent =
            "You are chatting anonymously.";

        chatActionBtn.textContent = "Leave Chat";

    }, 2000);

}


if (messageForm) {

    messageForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const messageText = messageInput.value.trim();


        if (messageText === "") {
            return;
        }


        const message = document.createElement("div");

        message.classList.add("message", "sent");


        const paragraph = document.createElement("p");

        paragraph.textContent = messageText;


        message.appendChild(paragraph);

        messages.appendChild(message);


        messageInput.value = "";


        messages.scrollTop = messages.scrollHeight;

    });

}


if (chatActionBtn) {

    chatActionBtn.addEventListener("click", function () {

        window.location.href = "index.html";

    });

}


/* =========================
   GROUPS
========================= */

const createGroupForm =
    document.getElementById("create-group-form");

const joinGroupForm =
    document.getElementById("join-group-form");

const groupNameInput =
    document.getElementById("group-name");

const groupCodeInput =
    document.getElementById("group-code");

const groupResult =
    document.getElementById("group-result");


function generateGroupCode() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";


    for (let i = 0; i < 6; i++) {

        const randomIndex =
            Math.floor(
                Math.random() * characters.length
            );

        code += characters[randomIndex];

    }


    return code;

}


/* Create Group */

if (createGroupForm) {

    createGroupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const groupName =
                groupNameInput.value.trim();


            if (groupName === "") {
                return;
            }


            const groupCode =
                generateGroupCode();


            groupResult.style.display = "block";


            groupResult.innerHTML = `
                <h3>Group Created!</h3>

                <p>
                    Your group <strong>${groupName}</strong>
                    is ready.
                </p>

                <p>
                    Share this code with others:
                </p>

                <h2>${groupCode}</h2>
            `;


            groupNameInput.value = "";

        }
    );

}


/* Join Group */

if (joinGroupForm) {

    joinGroupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const groupCode =
                groupCodeInput.value
                    .trim()
                    .toUpperCase();


            if (groupCode === "") {
                return;
            }


            groupResult.style.display = "block";


            groupResult.innerHTML = `
                <h3>Joining Group</h3>

                <p>
                    Attempting to join group:
                </p>

                <h2>${groupCode}</h2>
            `;


            groupCodeInput.value = "";

        }
    );

}