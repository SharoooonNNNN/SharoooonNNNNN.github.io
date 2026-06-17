const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".panel");
const introJumpTags = document.querySelectorAll("[data-jump-card]");
const dataGrid = document.querySelector("#dataGrid");
const infoCards = document.querySelectorAll(".info-card");
const stage = document.querySelector("#messageStage");
const form = document.querySelector("#messageForm");
const input = document.querySelector("#messageInput");
const storageKey = "sharon-homepage-messages";

const laneCount = 7;
const defaultMessages = [
  "Sharon，今天也要保持好奇心！",
  "欢迎来到故事、旅行和美食的交叉口。",
  "ENTP 能量加载中...",
];

let replayTimer = null;

function activateTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabName);
  });

  if (tabName === "with") {
    startReplay();
  } else {
    stopReplay();
  }
}

function expandCard(cardName) {
  dataGrid?.classList.add("has-expanded");
  infoCards.forEach((card) => {
    const isActive = card.dataset.card === cardName;
    card.classList.toggle("expanded", isActive);
    card.setAttribute("aria-expanded", String(isActive));
  });
}

function openDataCard(cardName) {
  activateTab("data");
  expandCard(cardName);
}

function readMessages() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return defaultMessages;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultMessages;
  } catch {
    return defaultMessages;
  }
}

function saveMessage(message) {
  const messages = readMessages().filter((item) => !defaultMessages.includes(item));
  messages.push(message);
  localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
}

function createDanmaku(message, options = {}) {
  if (!stage) return;

  const item = document.createElement("span");
  const lane = options.lane ?? Math.floor(Math.random() * laneCount);
  const duration = options.duration ?? 9 + Math.random() * 5;
  const delay = options.delay ?? 0;

  item.className = "danmaku";
  item.textContent = message;
  item.style.top = `${10 + lane * 12}%`;
  item.style.animationDuration = `${duration}s`;
  item.style.animationDelay = `${delay}s`;

  stage.appendChild(item);

  window.setTimeout(() => {
    item.remove();
  }, (duration + delay) * 1000 + 400);
}

function startReplay() {
  stopReplay();
  const messages = readMessages();

  messages.slice(0, 8).forEach((message, index) => {
    createDanmaku(message, {
      lane: index % laneCount,
      duration: 11 + (index % 4),
      delay: index * 0.7,
    });
  });

  replayTimer = window.setInterval(() => {
    const current = readMessages();
    const message = current[Math.floor(Math.random() * current.length)];
    createDanmaku(message);
  }, 2300);
}

function stopReplay() {
  if (replayTimer) {
    window.clearInterval(replayTimer);
    replayTimer = null;
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

introJumpTags.forEach((tag) => {
  tag.addEventListener("click", () => openDataCard(tag.dataset.jumpCard));
});

infoCards.forEach((card) => {
  card.setAttribute("role", "button");
  card.setAttribute("aria-expanded", "false");
  card.addEventListener("click", () => expandCard(card.dataset.card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      expandCard(card.dataset.card);
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value.trim();

  if (!message) {
    return;
  }

  saveMessage(message);
  createDanmaku(message, {
    lane: Math.floor(Math.random() * laneCount),
    duration: 10,
  });
  input.value = "";
  input.focus();
});
