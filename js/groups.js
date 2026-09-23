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

const groupFormTitle =
    document.getElementById("group-form-title");

const groupFormDescription =
    document.getElementById("group-form-description");

const groupSwitchText =
    document.getElementById("group-switch-text");

const groupSwitchButton =
    document.getElementById("group-switch-btn");


/* =========================
   FORM SWITCHING
========================= */

let showingCreateForm = false;

function switchGroupMode(createMode) {

    const oldForm =
        createMode
            ? joinGroupForm
            : createGroupForm;

    const newForm =
        createMode
            ? createGroupForm
            : joinGroupForm;


    /* Start fade-out */

    oldForm.classList.add("form-changing");

    groupSwitchButton.classList.add(
        "form-changing"
    );


    groupFormTitle.classList.add(
        "changing"
    );

    groupFormDescription.classList.add(
        "changing"
    );

    groupSwitchText.classList.add(
        "changing"
    );


    setTimeout(function () {

        /* Change content */

        if (createMode) {

            groupFormTitle.textContent =
                "Create a Group";

            groupFormDescription.textContent =
                "Choose a name for your temporary group and invite others to join.";

            groupSwitchText.textContent =
                "Already have a group?";

            groupSwitchButton.textContent =
                "Join a Group";

        } else {

            groupFormTitle.textContent =
                "Join a Group";

            groupFormDescription.textContent =
                "Enter the group code shared with you to join the conversation.";

            groupSwitchText.textContent =
                "Don't have a group?";

            groupSwitchButton.textContent =
                "Create a Group";
        }


        /* Switch forms */

        oldForm.style.display = "none";

        newForm.style.display = "flex";


        /*
         * Force browser to register
         * the new state before animation.
         */

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                newForm.classList.remove(
                    "form-changing"
                );

                groupSwitchButton.classList.remove(
                    "form-changing"
                );

                groupFormTitle.classList.remove(
                    "changing"
                );

                groupFormDescription.classList.remove(
                    "changing"
                );

                groupSwitchText.classList.remove(
                    "changing"
                );

            });

        });

    }, 200);
}


groupSwitchButton.addEventListener(
    "click",
    function () {

        showingCreateForm =
            !showingCreateForm;

        switchGroupMode(
            showingCreateForm
        );

    }
);

/* =========================
   GROUP CODE INPUT
========================= */

if (groupCodeInput) {

    groupCodeInput.addEventListener(
        "input",
        function () {

            groupCodeInput.value =
                groupCodeInput.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");

        }
    );
}


/* =========================
   CREATE GROUP
========================= */

if (createGroupForm) {

    createGroupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const groupName =
                groupNameInput
                    ? groupNameInput.value.trim()
                    : "";


            if (!groupName) {
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
                                    name: groupName
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showGroupResult(
                        "Unable to Create Group",
                        data.detail ||
                        "Something went wrong."
                    );

                    return;
                }


                showGroupResult(
                    "✓ Group Created!",
                    `
                        Your group
                        <strong>${data.name}</strong>
                        is ready.

                        <br><br>

                        Group code:
                        <br>

                        <strong class="group-code-result">
                            ${data.code}
                        </strong>

                        <br><br>

                        Opening group chat...
                    `
                );


                if (groupNameInput) {
                    groupNameInput.value = "";
                }


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

                showGroupResult(
                    "Connection Error",
                    "Unable to connect to the server."
                );
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
                groupCodeInput
                    ? groupCodeInput.value
                        .trim()
                        .toUpperCase()
                    : "";


            if (!groupCode) {
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
                                    code: groupCode
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showGroupResult(
                        "Unable to Join",
                        data.detail ||
                        "Group not found."
                    );

                    return;
                }


                showGroupResult(
                    "✓ Joined Successfully!",
                    `
                        You joined
                        <strong>${data.name}</strong>.

                        <br><br>

                        Opening group chat...
                    `
                );


                if (groupCodeInput) {
                    groupCodeInput.value = "";
                }


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

                showGroupResult(
                    "Connection Error",
                    "Unable to connect to the server."
                );
            }

        }
    );
}


/* =========================
   RESULT DISPLAY
========================= */

function showGroupResult(
    title,
    message
) {

    if (!groupResult) {
        return;
    }


    groupResult.style.display =
        "block";


    groupResult.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
}