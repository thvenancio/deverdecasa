const state = {
  assignments: [],
  currentAssignment: null,
  questionSet: [],
  metadata: {},
  currentIndex: 0,
  score: 0,
  answered: false,
};

const elements = {
  homeView: document.getElementById('homeView'),
  quizView: document.getElementById('quizView'),
  assignmentList: document.getElementById('assignmentList'),
  assignmentTemplate: document.getElementById('assignmentTemplate'),
  assignmentMessage: document.getElementById('assignmentMessage'),
  header: document.getElementById('appHeader'),
  headerTitle: document.getElementById('headerTitle'),
  scorePill: document.getElementById('scorePill'),
  progress: document.getElementById('progress'),
  bar: document.getElementById('bar'),
  progressPill: document.getElementById('progressPill'),
  qwrap: document.getElementById('qwrap'),
  question: document.getElementById('question'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  nextBtn: document.getElementById('nextBtn'),
  counter: document.getElementById('counter'),
  end: document.getElementById('end'),
  finalText: document.getElementById('finalText'),
  restartBtn: document.getElementById('restartBtn'),
  shareBtn: document.getElementById('shareBtn'),
  homeBtn: document.getElementById('homeBtn'),
  footerText: document.getElementById('footerText'),
};

document.addEventListener('DOMContentLoaded', () => {
  init();
});

elements.nextBtn.addEventListener('click', handleNext);
elements.restartBtn.addEventListener('click', restartQuiz);
elements.shareBtn.addEventListener('click', shareResult);
elements.homeBtn.addEventListener('click', returnHome);

async function init() {
  renderAssignmentMessage('Carregando deveres…');
  try {
    const assignments = await fetchJSON('data/assignments.json');
    if (!Array.isArray(assignments) || assignments.length === 0) {
      renderAssignmentMessage('Nenhum dever cadastrado ainda. Adicione um arquivo JSON em data/assignments.json.');
      return;
    }

    state.assignments = assignments;
    renderAssignments(assignments);
    renderAssignmentMessage(`${assignments.length} dever(es) disponível(is).`);
  } catch (error) {
    console.error(error);
    renderAssignmentMessage('Não foi possível carregar a lista de deveres. Verifique o arquivo data/assignments.json.');
  }
}

function renderAssignments(assignments) {
  elements.assignmentList.innerHTML = '';
  assignments.forEach((assignment) => {
    const template = elements.assignmentTemplate.content.cloneNode(true);
    const card = template.querySelector('.assignment-card');
    const badgeEl = card.querySelector('.badge');
    const subjectEl = card.querySelector('.assignment-subject');
    const titleEl = card.querySelector('.assignment-title');
    const summaryEl = card.querySelector('.assignment-summary');
    const startBtn = card.querySelector('.assignment-start');

    badgeEl.textContent = assignment.badge ?? 'Conteúdo';
    subjectEl.textContent = assignment.subtitle ?? '';
    titleEl.textContent = assignment.title ?? 'Dever sem título';
    summaryEl.textContent = assignment.summary ?? '';

    startBtn.addEventListener('click', () => startQuiz(assignment, startBtn));
    elements.assignmentList.appendChild(card);
  });
}

async function startQuiz(assignment, triggerButton) {
  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = 'Carregando…';
  }

  try {
    const data = await fetchJSON(assignment.questionsFile);
    if (!data || !Array.isArray(data.questions)) {
      throw new Error('Formato de questões inválido.');
    }

    state.currentAssignment = assignment;
    state.metadata = data;
    state.questionSet = data.questions;
    state.currentIndex = 0;
    state.score = 0;
    state.answered = false;

    prepareQuizHeader();
    switchView('quiz');
    showQuestion();
  } catch (error) {
    console.error(error);
    alert('Não foi possível carregar as questões deste dever. Confira o arquivo JSON.');
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = 'Começar dever';
    }
  } finally {
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = 'Começar dever';
    }
  }
}

function showQuestion() {
  const { questionSet, currentIndex } = state;
  const current = questionSet[currentIndex];
  if (!current) {
    return;
  }

  state.answered = false;
  elements.nextBtn.disabled = true;
  elements.nextBtn.textContent = currentIndex === questionSet.length - 1 ? 'Ver resultado ▶' : 'Próxima ▶';

  elements.question.textContent = current.question;
  elements.options.innerHTML = '';

  current.options.forEach((optionText, index) => {
    const button = document.createElement('button');
    button.className = 'btn';
    button.type = 'button';
    button.textContent = optionText;
    button.dataset.index = String(index);
    button.addEventListener('click', () => handleAnswer(button, index));
    elements.options.appendChild(button);
  });

  elements.feedback.className = 'feedback';
  elements.feedback.textContent = '';
  elements.counter.textContent = `Questão ${currentIndex + 1} de ${questionSet.length}`;
  updateProgress();
  updateScore();
}

function handleAnswer(button, index) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  const current = state.questionSet[state.currentIndex];
  const correctIndex = Number(current.answerIndex);

  const optionButtons = elements.options.querySelectorAll('button');
  optionButtons.forEach((btn) => {
    btn.disabled = true;
  });

  if (index === correctIndex) {
    state.score += 1;
    button.classList.add('correct');
    showFeedback(true, current.explanation);
  } else {
    button.classList.add('wrong');
    showFeedback(false, current.explanation);
    const correctButton = elements.options.querySelector(`button[data-index="${correctIndex}"]`);
    if (correctButton) {
      correctButton.classList.add('correct');
    }
  }

  elements.nextBtn.disabled = false;
  updateScore();
}

function handleNext() {
  const { currentIndex, questionSet } = state;
  if (currentIndex >= questionSet.length - 1) {
    showEndScreen();
    return;
  }

  state.currentIndex += 1;
  showQuestion();
}

function showEndScreen() {
  elements.qwrap.setAttribute('hidden', 'hidden');
  elements.end.removeAttribute('hidden');

  const total = state.questionSet.length;
  const score = state.score;
  const percentage = Math.round((score / total) * 100);

  elements.finalText.textContent = `Você acertou ${score} de ${total} questões (${percentage}%).`;

  elements.bar.style.width = '100%';
  elements.progressPill.textContent = `${total} / ${total}`;
  elements.nextBtn.disabled = true;
}

function restartQuiz() {
  if (!state.questionSet.length) {
    return;
  }

  state.currentIndex = 0;
  state.score = 0;
  state.answered = false;
  elements.end.setAttribute('hidden', 'hidden');
  elements.qwrap.removeAttribute('hidden');
  showQuestion();
}

function returnHome() {
  switchView('home');
}

function switchView(view) {
  if (view === 'home') {
    elements.homeView.classList.add('view-active');
    elements.homeView.removeAttribute('hidden');
    elements.quizView.classList.remove('view-active');
    elements.quizView.setAttribute('hidden', 'hidden');
    setHeaderHome();
  } else {
    elements.quizView.classList.add('view-active');
    elements.quizView.removeAttribute('hidden');
    elements.homeView.classList.remove('view-active');
    elements.homeView.setAttribute('hidden', 'hidden');
    elements.end.setAttribute('hidden', 'hidden');
    elements.qwrap.removeAttribute('hidden');
  }
}

function prepareQuizHeader() {
  const title = state.metadata.title ?? state.currentAssignment.title ?? 'Quiz';
  const badgeText = state.metadata.badge ?? state.currentAssignment.badge ?? '';

  elements.header.classList.remove('header-home');
  elements.header.classList.add('header-quiz');
  elements.headerTitle.innerHTML = `<span aria-hidden="true">🎯</span><span>${title}</span>${badgeText ? `<span class="badge">${badgeText}</span>` : ''}`;
  elements.progress.removeAttribute('hidden');
  elements.scorePill.removeAttribute('hidden');
  elements.progressPill.removeAttribute('hidden');
  elements.footerText.textContent = state.metadata.topics ?? state.currentAssignment.summary ?? '';
  elements.progressPill.textContent = `1 / ${state.questionSet.length}`;
  elements.bar.style.width = '0%';
}

function setHeaderHome() {
  elements.header.classList.add('header-home');
  elements.header.classList.remove('header-quiz');
  elements.headerTitle.innerHTML = '<span aria-hidden="true">📚</span><span>Dever de Casa</span>';
  elements.progress.setAttribute('hidden', 'hidden');
  elements.scorePill.setAttribute('hidden', 'hidden');
  elements.progressPill.setAttribute('hidden', 'hidden');
  elements.footerText.textContent = 'Carregue um dever para praticar conteúdos diferentes.';
  if (elements.assignmentList.childElementCount === 0) {
    renderAssignmentMessage('Nenhum dever cadastrado ainda. Adicione um arquivo JSON em data/assignments.json.');
  }
}

function updateProgress() {
  const total = state.questionSet.length;
  const current = state.currentIndex + 1;
  const percent = Math.round((current / total) * 100);
  elements.bar.style.width = `${percent}%`;
  elements.progressPill.textContent = `${current} / ${total}`;
}

function updateScore() {
  const total = state.questionSet.length;
  const score = state.score;
  elements.scorePill.textContent = `${score} acerto${score === 1 ? '' : 's'} • ${(total ? Math.round((score / total) * 100) : 0)}%`;
}

function showFeedback(isCorrect, explanation) {
  elements.feedback.className = `feedback show ${isCorrect ? 'ok' : 'no'}`;
  const prefix = isCorrect ? 'Resposta correta!' : 'Resposta incorreta.';
  const explanationText = explanation ? ` ${explanation}` : '';
  elements.feedback.textContent = `${prefix}${explanationText}`;
}

async function shareResult() {
  if (!state.questionSet.length) {
    return;
  }

  const total = state.questionSet.length;
  const score = state.score;
  const title = state.metadata.title ?? state.currentAssignment?.title ?? 'Dever de Casa';
  const text = `Acabei o dever "${title}" e acertei ${score} de ${total} questões!`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: window.location.href,
      });
    } catch (error) {
      if (error?.name !== 'AbortError') {
        alert('Não foi possível compartilhar automaticamente. Copie seu resultado e envie manualmente!');
      }
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Resultado copiado! Cole onde quiser compartilhar.');
    } catch (error) {
      alert(text);
    }
  } else {
    alert(text);
  }
}

function renderAssignmentMessage(message) {
  elements.assignmentMessage.textContent = message;
}

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Erro ao carregar ${path}: ${response.status}`);
  }
  return response.json();
}
