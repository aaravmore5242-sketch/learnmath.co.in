let operation = "";
let level = 1;
let totalQuestions = 0;
let currentQuestion = 0;
let correct = 0;
let answerValue = 0;
let timeLimit = 0;
let timeLeft = 0;
let timerInterval;

const wrongSound = new Audio("sounds/wrong.mp3");
wrongSound.preload = "auto";
function playBeep(duration = 0.12, frequency = 440, volume = 0.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = frequency;
    g.gain.value = volume;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, duration * 1000);
  } catch (e) {
    console.warn('WebAudio not available for beep fallback', e);
  }
}
wrongSound.addEventListener("error", () => {
  console.warn("Failed to load sounds/wrong.mp3 — falling back to beep");
});
const timeUpSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3");

function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return `Time: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function selectOperation(op) {
  operation = op;
  showScreen("levels");
}

function startGame(lv) {
  level = lv;
  showScreen("game");

  if (operation === "add" || operation === "sub") {
    if (level === 1) { totalQuestions = 20; timeLimit = 120; }
    if (level === 2) { totalQuestions = 40; timeLimit = 300; }
    if (level === 3) { totalQuestions = 80; timeLimit = 600; }
  }

  if (operation === "mul") {
    if (level === 1) { totalQuestions = 15; timeLimit = 300; }
    if (level === 2) { totalQuestions = 25; timeLimit = 600; }
    if (level === 3) { totalQuestions = 40; timeLimit = 1200; }
  }

  if (operation === "div") {
    if (level === 1) { totalQuestions = 10; timeLimit = 600; }
    if (level === 2) { totalQuestions = 20; timeLimit = 1200; }
    if (level === 3) { totalQuestions = 30; timeLimit = 1500; }
  }

  currentQuestion = 0;
  correct = 0;
  timeLeft = timeLimit;

  startTimer();
  nextQuestion();
}

function startTimer() {
  document.getElementById("timer").innerText = formatTime(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = formatTime(timeLeft);
    if (timeLeft <= 0) timeUp();
  }, 1000);
}

function nextQuestion() {
  if (currentQuestion >= totalQuestions) return endGame();

  currentQuestion++;
  document.getElementById("counter").innerText = `Q: ${currentQuestion}/${totalQuestions}`;
  document.getElementById("status").innerText = "";

  let a = rand(1, 20);
  let b = rand(1, 20);

  if (operation === "add") { answerValue = a + b; document.getElementById("question").innerText = `${a} + ${b}`; }
  if (operation === "sub") { if (b > a) [a, b] = [b, a]; answerValue = a - b; document.getElementById("question").innerText = `${a} - ${b}`; }
  if (operation === "mul") { answerValue = a * b; document.getElementById("question").innerText = `${a} × ${b}`; }
  if (operation === "div") { answerValue = a; document.getElementById("question").innerText = `${a * b} ÷ ${b}`; }

  let opts = [answerValue];
  while (opts.length < 4) {
    let wrong = answerValue + rand(-10, 10);
    if (wrong >= 0 && wrong !== answerValue && !opts.includes(wrong)) {
      opts.push(wrong);
    }
  }
  opts.sort(() => Math.random() - Math.random());

  const btns = document.querySelectorAll("#options button");
  btns.forEach((b, i) => {
    b.innerText = opts[i];
    b.disabled = false;
    b.style.background = "#fff";
  });
}

function checkOption(btn) {
  let selected = Number(btn.innerText);

  if (selected === answerValue) {
    btn.style.background = "lightgreen";
    document.getElementById("status").style.color = "green";
    document.getElementById("status").innerText = "✔ Correct";
    correct++;
  } else {
    btn.style.background = "salmon";
    document.getElementById("status").style.color = "red";
    document.getElementById("status").innerText = "✖ Wrong";
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  document.querySelectorAll("#options button").forEach(b => b.disabled = true);
  setTimeout(nextQuestion, 800);
}

function timeUp() {
  clearInterval(timerInterval);
  timeUpSound.play();
  alert("⏰ Time Over!");
  endGame();
}

function endGame() {
  clearInterval(timerInterval);
  showScreen("result");

  let percent = Math.round((correct / totalQuestions) * 100);
  document.getElementById("finalMsg").innerText = "🎉 Result";
  document.getElementById("finalScore").innerText = `${correct}/${totalQuestions}`;
  document.getElementById("finalPercent").innerText = `Percentage: ${percent}%`;

  let rank = (percent >= 90) ? "🏆 Excellent!" :
             (percent >= 70) ? "🥇 Very Good!" :
             (percent >= 50) ? "🙂 Good" :
             "😟 Try Again";
  
  document.getElementById("finalRank").innerText = rank;

  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 }
  });
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
