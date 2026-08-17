const messagesEl = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const welcome = document.getElementById("welcome");

const newChatBtn = document.getElementById("newChatBtn");
const headerNewChat = document.getElementById("headerNewChat");

const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

const historyList = document.getElementById("historyList");

let conversation = [];

let isLoading = false;


/* =========================
   LOCAL STORAGE
========================= */

function saveChat() {

    localStorage.setItem(
        "novaChat",
        JSON.stringify(conversation)
    );
}


function loadChat() {

    const saved = localStorage.getItem("novaChat");

    if (!saved) return;

    try {

        conversation = JSON.parse(saved);

        conversation.forEach(item => {

            addMessageToUI(
                item.role,
                item.content,
                false
            );

        });

        if (conversation.length > 0) {
            welcome.style.display = "none";
        }

    } catch (error) {

        console.error(error);

        conversation = [];
    }
}


/* =========================
   ADD MESSAGE
========================= */

function addMessageToUI(
    role,
    text,
    scroll = true
) {

    welcome.style.display = "none";

    const row = document.createElement("div");

    row.className =
        `message-row ${role === "user" ? "user" : "assistant"}`;


    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.innerHTML =
        role === "user"
            ? '<i class="fa-solid fa-user"></i>'
            : '<i class="fa-solid fa-wand-magic-sparkles"></i>';


    const content = document.createElement("div");

    content.className = "message-content";


    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent =
        role === "user"
            ? "You"
            : "Lexi AI";


    const message = document.createElement("div");

    message.className = "message";

    message.textContent = text;


    content.appendChild(name);
    content.appendChild(message);


    if (role === "assistant") {

        const actions = document.createElement("div");

        actions.className = "message-actions";

        const copyBtn = document.createElement("button");

        copyBtn.innerHTML =
            '<i class="fa-regular fa-copy"></i> Copy';

        copyBtn.onclick = () => {

            navigator.clipboard.writeText(text);

            copyBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> Copied';

            setTimeout(() => {

                copyBtn.innerHTML =
                    '<i class="fa-regular fa-copy"></i> Copy';

            }, 1500);
        };

        actions.appendChild(copyBtn);

        content.appendChild(actions);
    }


    row.appendChild(avatar);
    row.appendChild(content);

    messagesEl.appendChild(row);


    if (scroll) {

        scrollToBottom();

    }

    return row;
}


/* =========================
   TYPING
========================= */

function showTyping() {

    const row = document.createElement("div");

    row.className = "message-row assistant";

    row.id = "typingIndicator";


    row.innerHTML = `

        <div class="avatar">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>

        <div class="message-content">

            <div class="message-name">
                Lexi AI
            </div>

            <div class="message">

                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>

        </div>
    `;

    messagesEl.appendChild(row);

    scrollToBottom();
}


function removeTyping() {

    const typing =
        document.getElementById("typingIndicator");

    if (typing) {
        typing.remove();
    }
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const text = input.value.trim();

    if (!text || isLoading) return;


    isLoading = true;

    sendBtn.disabled = true;


    addMessageToUI(
        "user",
        text
    );


    conversation.push({
        role: "user",
        content: text
    });


    saveChat();


    input.value = "";

    autoResize();


    showTyping();


    try {

        const response = await fetch(
            "/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    messages: conversation
                })
            }
        );


        const data = await response.json();


        removeTyping();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Something went wrong"
            );

        }


        addMessageToUI(
            "assistant",
            data.reply
        );


        conversation.push({
            role: "assistant",
            content: data.reply
        });


        saveChat();

        updateHistory();


    } catch (error) {

        removeTyping();

        console.error(error);

        addMessageToUI(
            "assistant",
            "You have no credits remaining. Please check OpenAI account."
        );

    } finally {

        isLoading = false;

        sendBtn.disabled = false;

        input.focus();
    }
}


/* =========================
   ENTER KEY
========================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =========================
   AUTO RESIZE
========================= */

input.addEventListener(
    "input",
    autoResize
);


function autoResize() {

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 130) + "px";
}


/* =========================
   BUTTON
========================= */

sendBtn.addEventListener(
    "click",
    sendMessage
);


/* =========================
   NEW CHAT
========================= */

function newChat() {

    conversation = [];

    messagesEl.innerHTML = "";

    welcome.style.display = "block";

    localStorage.removeItem("novaChat");

    updateHistory();

    input.focus();
}


newChatBtn.addEventListener(
    "click",
    newChat
);


headerNewChat.addEventListener(
    "click",
    newChat
);


/* =========================
   CLEAR CHAT
========================= */

clearBtn.addEventListener(
    "click",
    () => {

        if (!conversation.length) return;

        const confirmDelete =
            confirm(
                "Are you sure you want to clear this chat?"
            );

        if (confirmDelete) {

            newChat();
        }
    }
);


/* =========================
   SUGGESTIONS
========================= */

document
    .querySelectorAll(".suggestion")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                input.value =
                    button.dataset.prompt;

                autoResize();

                sendMessage();
            }
        );
    });


/* =========================
   DARK MODE
========================= */

const savedTheme =
    localStorage.getItem("novaTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    updateThemeButton();
}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "novaTheme",
            isDark ? "dark" : "light"
        );

        updateThemeButton();
    }
);


function updateThemeButton() {

    const icon =
        themeBtn.querySelector("i");

    const text =
        themeBtn.querySelector("span");


    if (document.body.classList.contains("dark")) {

        icon.className =
            "fa-solid fa-sun";

        text.textContent =
            "Light Mode";

    } else {

        icon.className =
            "fa-solid fa-moon";

        text.textContent =
            "Dark Mode";
    }
}


/* =========================
   MOBILE SIDEBAR
========================= */

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle("open");

    }
);


/* =========================
   HISTORY
========================= */

function updateHistory() {

    historyList.innerHTML = "";

    const userMessages =
        conversation.filter(
            item => item.role === "user"
        );


    userMessages
        .slice(-8)
        .reverse()
        .forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "history-item";

            div.textContent =
                item.content;

            historyList.appendChild(div);

        });
}


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    const container =
        document.getElementById("chatContainer");

    setTimeout(() => {

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth"
        });

    }, 50);
}


/* =========================
   START
========================= */

loadChat();

updateHistory();

input.focus();