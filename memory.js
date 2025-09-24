const cardsArray = [
  { "image": "https://i.pinimg.com/736x/aa/4d/61/aa4d61e08f1935dd223e92bb102029a9.jpg", "name": "image_1" },
  { "image": "https://i.pinimg.com/736x/24/cd/81/24cd81cfe2695426ba0098e06769c2e1.jpg", "name": "image_2" },
  { "image": "https://i.pinimg.com/736x/9e/8e/df/9e8edf941386fae700b72f8d99aea161.jpg", "name": "image_3" },
  { "image": "https://i.pinimg.com/736x/2e/99/31/2e99317d3c81cb277d88f9be49b711a8.jpg", "name": "image_4" },
  { "image": "https://i.pinimg.com/736x/e8/a6/f4/e8a6f42f22d85aa1580e8bf08bfc0e2b.jpg", "name": "image_5" },
  { "image": "https://i.pinimg.com/1200x/7c/0a/b1/7c0ab1ecde682f4fef56c0e9adf23b88.jpg", "name": "image_6" },
  { "image": "https://i.pinimg.com/736x/02/96/9e/02969e1f159ef270d66fc2bb1d86e052.jpg", "name": "image_7" }
];

const gameBoard = document.querySelector(".game-board");
const timerElement = document.getElementById("timer");
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const starsContainer = document.getElementById("stars");
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");

let firstCard, secondCard;
let lockBoard = false;
let matches = 0;
let timeLeft = 60;
let timerInterval;

function startGame() {
  let gameCards = [...cardsArray, ...cardsArray];
  gameCards.sort(() => 0.5 - Math.random());
  gameBoard.innerHTML = "";

  gameCards.forEach(card => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back"><img src="${card.image}" alt="${card.name}"></div>
      </div>
    `;
    cardElement.addEventListener("click", () => flipCard(cardElement));
    gameBoard.appendChild(cardElement);
  });

  matches = 0;
  timeLeft = 60;
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function flipCard(cardElement) {
  if (lockBoard) return;
  if (cardElement === firstCard) return;

  cardElement.classList.add("flipped");

  if (!firstCard) {
    firstCard = cardElement;
    return;
  }

  secondCard = cardElement;
  checkForMatch();
}

function checkForMatch() {
  const firstImage = firstCard.querySelector(".card-back img").src;
  const secondImage = secondCard.querySelector(".card-back img").src;

  if (firstImage === secondImage) {
    matches++;
    resetBoard();

    if (matches === cardsArray.length) {
      clearInterval(timerInterval);
      showModal("🌟يابطـلـه! 🇸🇦", true);
      winSound.play();
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function updateTimer() {
  timeLeft--;
  timerElement.textContent = `⏱️ الوقت: ${timeLeft} ثانية`;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    showModal("⏰ انتهى الوقت! المهم إنك سعودي 🇸🇦", false);
    loseSound.play();
  }
}

function showModal(message, win) {
  modalMessage.textContent = message;
  starsContainer.innerHTML = "";

  if (win) {
    for (let i = 0; i < 10; i++) {
      const star = document.createElement("span");
      star.textContent = "⭐";
      star.classList.add("star");
      starsContainer.appendChild(star);
    }
  }

  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
  restartGame();
}

function restartGame() {
  startGame();
}

function goHome() {
  window.location.href = "index.html";
}

startGame();
