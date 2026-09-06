import questionsData from "./questions.json";

let state = {
    questions: [],
    currentIndex: 0,
    score: 0,
    selectedAnswer: null,
    answered: false,
    timeLeft: 60,
    totalTime: 60,
    answersLog: []
};

let timerInterval = null;


function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function load10Questions() {
    return questionsData.questions
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
}

function renderOptions(question) {
    const container = document.querySelector("#answers-container");
    container.innerHTML = '';

    question.options.forEach((optionText) => {
        const li = document.createElement("li");
        li.className = "list-none";

        const btn = document.createElement("button");
        btn.textContent = optionText;
        btn.classList.add("option");
        btn.addEventListener("click", () => selectAnswer(optionText));

        li.appendChild(btn);
        container.appendChild(li);
    });
}

function showFeedback(isCorrect, correctAnswer, timedOut) {
    const buttons = document.querySelectorAll("#answers-container .option");

    buttons.forEach((btn) => {
        btn.disabled = true;

        if (btn.textContent === correctAnswer) {
            btn.classList.add("correct-answer");
        } else if (btn.textContent === state.selectedAnswer) {
            btn.classList.add("wrong-answer");
        }
    });

    const statement = document.querySelector("#statement");

    if (isCorrect) {
        statement.textContent = "Correct Answer!";
        statement.classList.add("correct-statement");
    } else if (timedOut) {
        statement.textContent = "Timed out. What were you even doing!?";
        statement.classList.add("wrong-statement");
    } else {
        statement.textContent = "WRONG.";
        statement.classList.add("wrong-statement");
    }

    const nextBtn = document.querySelector("#next-btn");
    nextBtn.classList.remove("hidden");
    nextBtn.textContent = (state.currentIndex + 1 < state.questions.length) ? "Next question" : "See Results";
}


function startTimer() {
    clearInterval(timerInterval);
    state.timeLeft = state.totalTime;
    updateTimerDisplay();

    const bar = document.querySelector("#progress-bar");
    bar.style.setProperty("--duration", `${state.totalTime}s`);
    bar.style.animation = "none";
    bar.offsetHeight;
    bar.style.animation = "";

    timerInterval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();

        if (state.timeLeft <= 0) {
            clearInterval(timerInterval);
            confirmAnswer(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.querySelector("#timer").textContent = formatTime(state.timeLeft);
}


function loadQuestion(index) {
    const question = state.questions[index];

    document.querySelector("#current-question").textContent = question.question;
    renderOptions(question);

    document.querySelector("#next-btn").classList.add("hidden"); 
    document.querySelector("#question-number").textContent = String(index + 1).padStart(2, '0');

    state.selectedAnswer = null;
    state.answered = false;

    startTimer();
}

function selectAnswer(chosenText) {
    if (state.answered) return;
    state.selectedAnswer = chosenText;
    confirmAnswer();
}

function confirmAnswer(timedOut = false) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(timerInterval);

    document.querySelector("#progress-bar").style.animationPlayState = "paused";

    const correctAnswer = state.questions[state.currentIndex].correctAnswer;
    const isCorrect = state.selectedAnswer === correctAnswer;

    if (isCorrect) state.score++;
    else if (timedOut) state.score--;

    state.answersLog.push({
        question: state.questions[state.currentIndex].question,
        wasCorrect: isCorrect,
        timedOut: timedOut
    });

    document.querySelector("#score").textContent = state.score;
    showFeedback(isCorrect, correctAnswer, timedOut);
}

function nextQuestion() {
    if (state.currentIndex + 1 < state.questions.length) {
        state.currentIndex++;
        loadQuestion(state.currentIndex);
        document.querySelector("#statement").textContent = "";
        document.querySelector("#statement").classList.remove("correct-statement");
        document.querySelector("#statement").classList.remove("wrong-statement");
    } else {
        showResults();
    }
}


function showResults() {
    document.querySelector("#question-screen").classList.add("hidden");
    document.querySelector("#result-screen").classList.remove("hidden");
    document.querySelector("#score-text").textContent = `${state.score} / ${state.questions.length}`;

    const list = document.querySelector("#results-list");
    list.innerHTML = '';

    state.answersLog.forEach((entry, i) => {
        const row = document.createElement("li");
        row.className = "w-full list-none flex justify-between border-b border-[#2A2A2E] py-2";

        let statusText, statusClass;
        if (entry.wasCorrect) {
            statusText = "Correct";
            statusClass = "correct-statement";
        } else if (entry.timedOut) {
            statusText = "Timed Out";
            statusClass = "wrong-statement";
        } else {
            statusText = "Incorrect";
            statusClass = "wrong-statement";
        }

        row.innerHTML = `
            <div>
                <span class="text-[#A3A5AB] text-[13px] font-bold">${String(i + 1).padStart(2, '0')}</span>
                <span class="text-[#F2F2F3] text-[14px] ml-5">${entry.question}</span>
            </div>
            <span class="text-[#A3A5AB] text-[15px] font-bold ${statusClass}">${statusText}</span>
        `;

        list.appendChild(row);
    });
}


function startQuiz() {
    state.questions = load10Questions();
    state.currentIndex = 0;
    state.score = 0;
    state.answersLog = [];

    document.querySelector("#start-screen").classList.add("hidden");
    document.querySelector("#question-screen").classList.remove("hidden");

    loadQuestion(state.currentIndex);
}


function restartQuiz() {
    document.querySelector("#result-screen").classList.add("hidden");
    document.querySelector("#start-screen").classList.remove("hidden");
}


document.querySelector("#start-btn").addEventListener("click", startQuiz);
document.querySelector("#next-btn").addEventListener("click", nextQuestion);
document.querySelector("#restart-btn").addEventListener("click", restartQuiz);