/**
 * @file Main file — ECG Axis Trainer
 * @author David Schaack (original); ID language & UI enhancements added
 */

import { drawEcg } from './ecgDrawing.js'
import { mouseAngle } from './circleCalculations.js';
import { calculateEcg, lagetyp } from './ecgCalculations.js';
import { langDe, langEn, langEs, langId } from './languages.js';

// ── State ─────────────────────────────────────────────────────────────────────
let international = true;
let currentLanguage = langEn;
let currentSection = 'cabrera';
let mouseDown = false;
let angle = 45;
let answersCorrect = 0;
let answersWrong = 0;
let sideBySide = false;
let dpr = window.devicePixelRatio;
let firstMove = true;

// ── DOM Elements ──────────────────────────────────────────────────────────────
const line        = document.getElementById('line');
const lineright   = document.getElementById('lineright');
const bigCircle   = document.getElementById('bigCircle');
const containerDivs = document.querySelectorAll("div.containerInner");
const circleDe    = document.getElementById('circleDe');
const circleInt   = document.getElementById('circleInt');
const split       = document.querySelector('div.split');
const ecg         = document.getElementById('ecg');
const cabrera     = document.getElementById('cabrera');
const quiz        = document.getElementById('quiz');
const about       = document.getElementById('about');
const sectionGeneral = document.getElementById('sectionGeneral');
const sectionSources = document.getElementById('sectionSources');

// Canvas
const ecgCanvas = document.getElementById('ecgCanvas');
const ctxEcg    = ecgCanvas.getContext('2d');
const gridCanvas = document.getElementById('gridCanvas');
const ctxGrid   = gridCanvas.getContext('2d');

// Cabrera circle elements
const uelt = document.getElementById('uelt');
const lt   = document.getElementById('lt');
const it   = document.getElementById('it');
const st   = document.getElementById('st');
const rt   = document.getElementById('rt');
const uert = document.getElementById('uert');
const nwt  = document.getElementById('nwt');
const circleParts = [lt, it, st, rt, uert, uelt, nwt];

const enLad    = document.getElementById('enLad');
const enNormal = document.getElementById('enNormal');
const enRad    = document.getElementById('enRad');
const enNwt    = document.getElementById('enNwt');
const circlePartsEn = [enLad, enNormal, enRad, enNwt];

// Navigation buttons
const buttonCabrera = document.getElementById('button_cabrera');
const buttonQuiz    = document.getElementById('button_quiz');
const buttonAbout   = document.getElementById('button_about');
const buttonLangEn  = document.getElementById('button_en');
const buttonLangDe  = document.getElementById('button_de');
const buttonLangEs  = document.getElementById('button_es');
const buttonLangId  = document.getElementById('button_id');

buttonQuiz.addEventListener('click', switchToQuiz);
buttonCabrera.addEventListener('click', switchToCabrera);
buttonAbout.addEventListener('click', switchToAbout);

buttonLangEn.addEventListener('click', (e) => {
  international = true; currentLanguage = langEn;
  switchLanguage(international, currentLanguage);
  styleLanguageButtons(e.target.id); update(angle);
});
buttonLangDe.addEventListener('click', (e) => {
  international = false; currentLanguage = langDe;
  switchLanguage(international, currentLanguage);
  styleLanguageButtons(e.target.id); update(angle);
});
buttonLangEs.addEventListener('click', (e) => {
  international = true; currentLanguage = langEs;
  switchLanguage(international, currentLanguage);
  styleLanguageButtons(e.target.id); update(angle);
});
buttonLangId.addEventListener('click', (e) => {
  international = true; currentLanguage = langId;
  switchLanguage(international, currentLanguage);
  styleLanguageButtons(e.target.id); update(angle);
});

// Quiz buttons
const buttonIt       = document.getElementById('button_it');
const buttonLt       = document.getElementById('button_lt');
const buttonUelt     = document.getElementById('button_uelt');
const buttonSt       = document.getElementById('button_st');
const buttonRt       = document.getElementById('button_rt');
const buttonUert     = document.getElementById('button_uert');
const buttonIntNormal = document.getElementById('button_enNormal');
const buttonIntLad   = document.getElementById('button_enLad');
const buttonIntRad   = document.getElementById('button_enRad');

buttonIt.addEventListener('click',   () => checkAnswer('Indifferenztyp'));
buttonLt.addEventListener('click',   () => checkAnswer('Linkstyp'));
buttonUelt.addEventListener('click', () => checkAnswer('Ueberdrehter Linkstyp'));
buttonSt.addEventListener('click',   () => checkAnswer('Steiltyp'));
buttonRt.addEventListener('click',   () => checkAnswer('Rechtstyp'));
buttonUert.addEventListener('click', () => checkAnswer('Ueberdrehter Rechtstyp'));
buttonIntNormal.addEventListener('click', () => checkAnswer(currentLanguage.typeNormal, true));
buttonIntLad.addEventListener('click',    () => checkAnswer(currentLanguage.typeLad, true));
buttonIntRad.addEventListener('click',    () => checkAnswer(currentLanguage.typeRad, true));

// Quiz display elements
const displayAnswersCorrect = document.getElementById('answersCorrect');
const displayAnswersWrong   = document.getElementById('answersWrong');
const displayLagetyp        = document.getElementById('lagetyp');
const displayCorrect        = document.getElementById('correct');
const displayWrong          = document.getElementById('wrong');
const labelCorrect          = document.getElementById('labelCorrect');
const labelWrong            = document.getElementById('labelWrong');

// ── Event Listeners ───────────────────────────────────────────────────────────
lineright.addEventListener('mousedown', () => { mouseDown = true; }, true);
document.addEventListener('mouseup',   () => { mouseDown = false; }, true);
document.addEventListener('mousemove', (event) => {
  if (mouseDown) {
    if (firstMove) { deleteRotationAnimation(); firstMove = false; }
    angle = mouseAngle(event, bigCircle);
    update(angle);
  }
}, true);

bigCircle.addEventListener('wheel', (event) => {
  event.preventDefault();
  let newAngle = angle - (event.deltaY / 25);
  if (newAngle > 360) newAngle -= 360;
  else if (newAngle < 0) newAngle += 360;
  angle = newAngle; update(angle);
});

window.addEventListener('resize', resizeDivs);
window.addEventListener('resize', resizeEcg);

window.onload = function () {
  resizeDivs(); resizeEcg();
  const lang = navigator.language;
  if (lang === 'de-DE' || lang === 'de') {
    international = false; currentLanguage = langDe; styleLanguageButtons('button_de');
  } else if (lang === 'es') {
    international = true;  currentLanguage = langEs; styleLanguageButtons('button_es');
  } else if (lang === 'id' || lang === 'id-ID') {
    international = true;  currentLanguage = langId; styleLanguageButtons('button_id');
  } else {
    styleLanguageButtons('button_en');
  }
  switchLanguage(international, currentLanguage);
  buttonCabrera.style.color = 'var(--activeButton)';
};

// Touch events
lineright.addEventListener('touchstart', () => { mouseDown = true; }, true);
document.addEventListener('touchend',   () => { mouseDown = false; }, true);
document.addEventListener('touchmove', (event) => {
  if (mouseDown) {
    event.preventDefault();
    if (firstMove) { deleteRotationAnimation(); firstMove = false; }
    angle = mouseAngle(event, bigCircle); update(angle);
  }
}, { passive: false });

// ── Navigation ────────────────────────────────────────────────────────────────
function switchToCabrera() {
  if (currentSection !== 'cabrera') {
    quiz.style.display = 'none'; cabrera.style.display = '';
    ecg.style.display = ''; about.style.display = 'none';
    buttonCabrera.style.color = 'var(--activeButton)';
    buttonQuiz.style.color = ''; buttonAbout.style.color = '';
    split.style.padding = ''; currentSection = 'cabrera';
    window.dispatchEvent(new Event('resize'));
  }
}

function switchToQuiz() {
  if (currentSection !== 'quiz') {
    displayCorrect.classList.remove('animateCorrect');
    displayWrong.classList.remove('animateWrong');
    quiz.style.display = 'flex'; cabrera.style.display = 'none';
    ecg.style.display = ''; about.style.display = 'none';
    newEcg();
    buttonCabrera.style.color = ''; buttonQuiz.style.color = 'var(--activeButton)';
    buttonAbout.style.color = ''; split.style.padding = '';
    currentSection = 'quiz'; window.dispatchEvent(new Event('resize'));
  }
}

function switchToAbout() {
  if (currentSection !== 'about') {
    quiz.style.display = 'none'; cabrera.style.display = 'none';
    ecg.style.display = 'none'; about.style.display = 'block';
    buttonCabrera.style.color = ''; buttonQuiz.style.color = '';
    buttonAbout.style.color = 'var(--activeButton)';
    split.style.padding = '1rem 1rem'; currentSection = 'about';
    window.dispatchEvent(new Event('resize'));
  }
}

// ── Core Update ───────────────────────────────────────────────────────────────
const update = (angle) => {
  line.style.transform = 'rotate(' + angle + 'deg)';
  updateDropShadow(line, angle);
  if (international) { stylecircleInt(angle); } else { styleCircle(angle); }
  displayLagetyp.innerHTML = lagetyp(angle, international, currentLanguage) + '&nbsp;' + angle.toFixed(1) + '&deg;';
  const ecgAmplitudes = calculateEcg(angle);
  const ecgLeads = ["I", "II", "III", "aVR", "aVL", "aVF"];
  drawEcg(ctxEcg, ctxGrid, ecgLeads, ecgAmplitudes, ecgCanvas.width, ecgCanvas.height, sideBySide, dpr);
};

function deleteRotationAnimation() {
  lineright.style.backgroundImage = 'none';
  lineright.style.animationIterationCount = 0;
}

function resizeDivs() { containerDivs.forEach(e => resizeProportionally(e)); }

function resizeEcg() {
  const width = document.getElementById('ecg').clientWidth;
  dpr = Math.ceil(window.devicePixelRatio);
  ecgCanvas.width = dpr * width;   gridCanvas.width = dpr * width;
  ecgCanvas.height = dpr * width;  gridCanvas.height = dpr * width;
  ecgCanvas.style.width = `${width}px`;  ecgCanvas.style.height = `${width}px`;
  gridCanvas.style.width = `${width}px`; gridCanvas.style.height = `${width}px`;
  sideBySide = width < 300;
  update(angle);
}

const resizeProportionally = (e) => { e.style.height = e.offsetWidth + 'px'; };

const updateDropShadow = (e, angle) => {
  const distance = 0.3, shadowAngle = 45;
  const offsetY = Math.sin(degToRad(shadowAngle - angle)) * distance;
  const offsetX = Math.cos(degToRad(shadowAngle - angle)) * distance;
  e.style.filter = 'drop-shadow(' + offsetX + 'rem ' + offsetY + 'rem 0.1rem rgba(0,0,0,0.5))';
};

const degToRad = (deg) => deg * Math.PI / 180;

// ── Circle Styling ────────────────────────────────────────────────────────────
const styleCircle = (degree) => {
  if (degree > 360 || degree < 0) return;
  if      (degree >= 30  && degree < 60)  { styleCircleParts(it,   circleParts); displayLagetyp.style.backgroundColor = 'var(--it)'; }
  else if (degree >= 60  && degree < 90)  { styleCircleParts(st,   circleParts); displayLagetyp.style.backgroundColor = 'var(--st)'; }
  else if (degree >= 90  && degree < 120) { styleCircleParts(rt,   circleParts); displayLagetyp.style.backgroundColor = 'var(--rt)'; }
  else if (degree >= 120 && degree < 180) { styleCircleParts(uert, circleParts); displayLagetyp.style.backgroundColor = 'var(--uert)'; }
  else if (degree >= 180 && degree < 270) { styleCircleParts(nwt,  circleParts); displayLagetyp.style.backgroundColor = 'var(--nwt)'; }
  else if (degree >= 270 && degree < 330) { styleCircleParts(uelt, circleParts); displayLagetyp.style.backgroundColor = 'var(--uelt)'; }
  else if (degree >= 330 || degree < 30)  { styleCircleParts(lt,   circleParts); displayLagetyp.style.backgroundColor = 'var(--lt)'; }
};

const stylecircleInt = (degree) => {
  if (degree > 360 || degree < 0) return;
  if      (degree >= 90  && degree < 180) { styleCircleParts(enRad,    circlePartsEn); displayLagetyp.style.backgroundColor = 'var(--st)'; }
  else if (degree >= 180 && degree < 270) { styleCircleParts(enNwt,    circlePartsEn); displayLagetyp.style.backgroundColor = 'var(--uert)'; }
  else if (degree >= 270 && degree < 330) { styleCircleParts(enLad,    circlePartsEn); displayLagetyp.style.backgroundColor = 'var(--lt)'; }
  else if (degree >= 330 || degree < 90)  { styleCircleParts(enNormal, circlePartsEn); displayLagetyp.style.backgroundColor = 'var(--it)'; }
};

const styleCircleParts = (e, parts) => {
  parts.forEach(part => (e === part) ? emphasizeCirclePart(e) : resetCirclePart(part));
};

const emphasizeCirclePart = (e) => { e.style.filter = 'saturate(5)'; };
const resetCirclePart     = (e) => { e.style.filter = 'saturate(1)'; };

// ── Quiz ──────────────────────────────────────────────────────────────────────
const checkAnswer = (answer, isInternational = false) => {
  if (lagetyp(angle, isInternational, currentLanguage) === answer) {
    answersCorrect++;
    displayCorrect.classList.remove('animateCorrect');
    void displayCorrect.offsetWidth;
    displayCorrect.classList.add('animateCorrect');
    displayAnswersCorrect.innerHTML = answersCorrect;
    newEcg();
  } else {
    answersWrong++;
    displayWrong.classList.remove('animateWrong');
    void displayWrong.offsetWidth;
    displayWrong.classList.add('animateWrong');
    displayAnswersWrong.innerHTML = answersWrong;
  }
};

const newEcg = () => { angle = getRandomAxis(); update(angle); };

const getRandomAxis = () => {
  let degree;
  do {
    degree = Math.floor(Math.random() * 360);
  } while (
    (degree >= 170 && degree < 280) || (degree > 320 && degree < 340) ||
    (degree > 20 && degree < 35) || (degree > 55 && degree < 65) ||
    (degree > 85 && degree < 95) || (degree > 115 && degree < 130)
  );
  return degree;
};

// ── Language ──────────────────────────────────────────────────────────────────
function switchLanguage(international, language) {
  langButtons(international); langCabrera(international); langFillContent(language);
}

function styleLanguageButtons(id) {
  [buttonLangDe, buttonLangEn, buttonLangEs, buttonLangId].forEach(b => b.classList.remove('langButtonActive'));
  document.getElementById(id).classList.add('langButtonActive');
}

const langButtons = (international) => {
  document.querySelectorAll("button.answer.de").forEach(el => el.style.display = international ? 'none' : 'block');
  document.querySelectorAll("button.answer.en").forEach(el => el.style.display = international ? 'block' : 'none');
};

const langCabrera = (international) => {
  circleDe.style.display  = international ? 'none' : 'block';
  circleInt.style.display = international ? 'block' : 'none';
};

const langFillContent = (language) => {
  document.querySelector('h1').innerHTML = language.title;
  buttonCabrera.innerHTML   = language.navCabrera;
  buttonQuiz.innerHTML      = language.navQuiz;
  buttonAbout.innerHTML     = language.navAbout;
  labelCorrect.innerHTML    = language.quizCorrect;
  labelWrong.innerHTML      = language.quizWrong;
  sectionGeneral.innerHTML  = language.aboutGeneral;
  sectionSources.innerHTML  = language.aboutSources;
  buttonIntNormal.innerHTML = language.typeNormal;
  buttonIntLad.innerHTML    = language.typeLad;
  buttonIntRad.innerHTML    = language.typeRad;
};
