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
        async function (event) {

            event.preventDefault();


            const groupName =
                groupNameInput.value.trim();


            if (groupName === "") {
                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/groups",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: groupName
                        })
                    }
                );


                const data = await response.json();


                groupResult.style.display = "block";


                groupResult.innerHTML = `
                    <h3>Group Created!</h3>

                    <p>
                        Your group <strong>${data.name}</strong>
                        is ready.
                    </p>

                    <p>
                        Share this code with others:
                    </p>

                    <h2>${data.code}</h2>
                `;


                groupNameInput.value = "";


            } catch (error) {

                console.error(
                    "Group creation failed:",
                    error
                );

            }

        }
    );

}


/* Join Group */


if (joinGroupForm) {

    joinGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const groupCode =
                groupCodeInput.value
                    .trim()
                    .toUpperCase();


            if (groupCode === "") {
                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/groups/join",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            code: groupCode
                        })
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    groupResult.style.display = "block";


                    groupResult.innerHTML = `
                        <h3>Unable to Join</h3>

                        <p>
                            ${data.detail}
                        </p>
                    `;


                    return;
                }


                groupResult.style.display = "block";


                groupResult.innerHTML = `
                    <h3>Joined Successfully!</h3>

                    <p>
                        You joined <strong>${data.name}</strong>
                    </p>

                    <p>
                        Group code:
                    </p>

                    <h2>${data.code}</h2>
                `;


                groupCodeInput.value = "";


            } catch (error) {

                console.error(
                    "Group join failed:",
                    error
                );


                groupResult.style.display = "block";


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


//BACKEND CONNECTION TEST

async function checkBackend() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/status"
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


checkBackend();

