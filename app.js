// app.js

const OLD_BOM_KEY = "bom-reading-v2";         // keeps your existing BOM data
const BASE_KEY = "scripture-reading-v1";      // new base for other books
const SELECTED_BOOK_KEY = `${BASE_KEY}:selectedBook`;

const BOOKS = [
  { id: "bom", label: "Libro de Mormón" },
  { id: "nt",  label: "Nuevo Testamento" },
  { id: "ot",  label: "Antiguo Testamento" },
  { id: "dc",  label: "Doctrina y Convenios" },
];

const daysEl = document.getElementById("days");
const doneCountEl = document.getElementById("doneCount");
const totalDaysEl = document.getElementById("totalDays");

const yearDoneEl = document.getElementById("yearDone");
const yearTotalEl = document.getElementById("yearTotal");
const yearPctEl = document.getElementById("yearPct");

const monthNameEl = document.getElementById("monthName");
const bookNameEl = document.getElementById("bookName");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const switchBookBtn = document.getElementById("switchBook");

// Month shown on screen (start at current month)
let viewDate = new Date();

// Selected book (remembered)
let currentBook = localStorage.getItem(SELECTED_BOOK_KEY) || "bom";
if (!BOOKS.some(b => b.id === currentBook)) currentBook = "bom";

function daysInMonth(year, monthIndex0based) {
  return new Date(year, monthIndex0based + 1, 0).getDate();
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("es", { month: "long", year: "numeric" })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());
}

function monthKey(date, bookId = currentBook) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");

  // Backwards compatible: BOM continues using your old storage key
  if (bookId === "bom") return `${OLD_BOM_KEY}:${y}-${m}`;

  // New books use a namespaced key
  return `${BASE_KEY}:${bookId}:${y}-${m}`;
}

function loadProgressForMonth(date, bookId = currentBook) {
  try {
    return JSON.parse(localStorage.getItem(monthKey(date, bookId))) || {};
  } catch {
    return {};
  }
}

function saveProgressForMonth(date, progress, bookId = currentBook) {
  localStorage.setItem(monthKey(date, bookId), JSON.stringify(progress));
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function countYearProgress(year, bookId = currentBook) {
  let totalDone = 0;

  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const monthData = loadProgressForMonth(d, bookId);
    totalDone += Object.values(monthData).filter(Boolean).length;
  }

  const totalDaysYear = isLeapYear(year) ? 366 : 365;
  const pct = totalDaysYear ? Math.round((totalDone / totalDaysYear) * 100) : 0;

  return { totalDone, totalDaysYear, pct };
}

function setBookUI() {
  const book = BOOKS.find(b => b.id === currentBook) || BOOKS[0];
  bookNameEl.textContent = book.label;
}

function render() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = daysInMonth(year, month);

  monthNameEl.textContent = monthLabel(viewDate);
  totalDaysEl.textContent = totalDays;

  setBookUI();

  // Year badge for THIS book
  const yearStats = countYearProgress(year, currentBook);
  yearDoneEl.textContent = yearStats.totalDone;
  yearTotalEl.textContent = yearStats.totalDaysYear;
  yearPctEl.textContent = yearStats.pct;

  // Month progress for THIS book
  const progress = loadProgressForMonth(viewDate, currentBook);

  daysEl.innerHTML = "";
  let doneCount = 0;

  for (let day = 1; day <= totalDays; day++) {
    const key = String(day);
    const isDone = Boolean(progress[key]);
    if (isDone) doneCount++;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day" + (isDone ? " done" : "");
    btn.textContent = day;

    btn.addEventListener("click", () => {
      const latest = loadProgressForMonth(viewDate, currentBook);
      latest[key] = !latest[key];
      saveProgressForMonth(viewDate, latest, currentBook);
      render();
    });

    daysEl.appendChild(btn);
  }

  doneCountEl.textContent = doneCount;
}

// Month navigation
prevBtn.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  render();
});

nextBtn.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  render();
});

// Book switching (cycles through list)
switchBookBtn.addEventListener("click", () => {
  const idx = BOOKS.findIndex(b => b.id === currentBook);
  const nextIdx = (idx + 1) % BOOKS.length;
  currentBook = BOOKS[nextIdx].id;
  localStorage.setItem(SELECTED_BOOK_KEY, currentBook);
  render();
});

// First render
render();
