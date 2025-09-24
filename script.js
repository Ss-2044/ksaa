let time = 40;
let timerInterval;
let firstCard, secondCard, lockBoard = false;
let cards = [];
let score = 0;

// تشغيل المؤقت
function startTimer(callback) {
  time = 40;
  document.getElementById("timer").textContent = `⏳ ${time}`;
  timerInterval = setInterval(() => {
    time--;
    let timerEl = document.getElementById("timer");
    if (!timerEl) return;
    timerEl.textContent = `⏳ ${time}`;
    if (time <= 10) timerEl.style.color = "red";
    if (time <= 0) {
      clearInterval(timerInterval);
      callback(false); // خسارة
    }
  }, 1000);
}

// ===== لعبة مطابقة الصور =====
if (document.body.id === "memory-bg") {
  fetch("./data.json")
    .then(res => res.json())
    .then(data => {
      cards = [...data, ...data];
      shuffle(cards);
      generateCards();
      startTimer(endMemoryGame);
    });
}

function shuffle(array) {
  array.sort(() => 0.5 - Math.random());
}

function generateCards() {
  const grid = document.querySelector(".grid-container");
  grid.innerHTML = "";
  cards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("data-name", card.name);
    cardEl.innerHTML = `<img src="${card.image}" style="display:none;">`;
    grid.appendChild(cardEl);
    cardEl.addEventListener("click", flipCard);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.querySelector("img").style.display = "block";
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }
  secondCard = this;
  lockBoard = true;

  let match = firstCard.dataset.name === secondCard.dataset.name;
  match ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();
  if (document.querySelectorAll(".card:not(.flipped)").length === 0) {
    endMemoryGame(true);
  }
}

function unflipCards() {
  setTimeout(() => {
    firstCard.querySelector("img").style.display = "none";
    secondCard.querySelector("img").style.display = "none";
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 800);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function endMemoryGame(win) {
  clearInterval(timerInterval);
  let res = document.getElementById("result");
  res.innerHTML = win ? "👏 يابطله 👑🎉⭐" : "🇸🇦 المهم انك سعودي 🇸🇦";
}

// ===== لعبة الرياكشن =====
function checkAnswer(btn, correct) {
  if (correct) {
    btn.style.background = "limegreen";
  } else {
    btn.style.background = "red";
  }
  btn.disabled = true;

  let allAnswered = document.querySelectorAll(".question button:disabled").length;
  let total = document.querySelectorAll(".question button").length;
  if (allAnswered === total) {
    endReactionGame(true);
  }
}

function endReactionGame(win) {
  clearInterval(timerInterval);
  let res = document.getElementById("result");
  res.innerHTML = win ? "👏 يابطله 👑🎉⭐" : "🇸🇦 المهم انك سعودي 🇸🇦";
}
