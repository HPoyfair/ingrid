document.addEventListener("DOMContentLoaded", () => {
  const BASE_KEY = "bom-reading-v2";

  const daysEl = document.getElementById("days");
  const doneCountEl = document.getElementById("doneCount");
  const totalDaysEl = document.getElementById("totalDays");

  const yearDoneEl = document.getElementById("yearDone");
  const yearTotalEl = document.getElementById("yearTotal");
  const yearPctEl = document.getElementById("yearPct");

  const monthNameEl = document.getElementById("monthName");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  // Month shown on screen (start at current month)
  let viewDate = new Date();

  function daysInMonth(year, monthIndex0based) {
    return new Date(year, monthIndex0based + 1, 0).getDate();
  }

  function monthLabel(date) {
    return new Intl.DateTimeFormat("es", { month: "long", year: "numeric" })
      .format(date)
      .replace(/^./, (c) => c.toUpperCase());
  }

  function monthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${BASE_KEY}:${y}-${m}`;
  }

  function loadProgressForMonth(date) {
    const key = monthKey(date);
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  }

  function saveProgressForMonth(date, progress) {
    localStorage.setItem(monthKey(date), JSON.stringify(progress));
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function countYearProgress(year) {
    let totalDone = 0;

    for (let m = 0; m < 12; m++) {
      const d = new Date(year, m, 1);
      const monthData = loadProgressForMonth(d);
      totalDone += Object.values(monthData).filter(Boolean).length;
    }

    const totalDaysYear = isLeapYear(year) ? 366 : 365;
    const pct = totalDaysYear ? Math.round((totalDone / totalDaysYear) * 100) : 0;

    return { totalDone, totalDaysYear, pct };
  }

  function render() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);

    // Year badge
    const yearStats = countYearProgress(year);
    yearDoneEl.textContent = yearStats.totalDone;
    yearTotalEl.textContent = yearStats.totalDaysYear;
    yearPctEl.textContent = yearStats.pct;

    // Month header + totals
    monthNameEl.textContent = monthLabel(viewDate);
    totalDaysEl.textContent = totalDays;

    const progress = loadProgressForMonth(viewDate);

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
        const latest = loadProgressForMonth(viewDate);
        latest[key] = !latest[key];
        saveProgressForMonth(viewDate, latest);
        render();
      });

      daysEl.appendChild(btn);
    }

    doneCountEl.textContent = doneCount;
  }

  prevBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    render();
  });

  nextBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    render();
  });

  // first render
  render();
});
