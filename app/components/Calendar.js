class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  // 달력 렌더링
  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    
    let html = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="prev-month">&lt;</button>
          <h2>${year}년 ${month + 1}월</h2>
          <button class="next-month">&gt;</button>
        </div>
        <div class="calendar-days">
          <div class="day-name">일</div>
          <div class="day-name">월</div>
          <div class="day-name">화</div>
          <div class="day-name">수</div>
          <div class="day-name">목</div>
          <div class="day-name">금</div>
          <div class="day-name">토</div>
    `;

    // 이전 달의 마지막 날짜들
    for (let i = firstDayIndex; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1);
      html += `<div class="calendar-day prev-month-day">${prevDate.getDate()}</div>`;
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDayDate; i++) {
      const today = new Date();
      const isToday = i === today.getDate() && 
                      month === today.getMonth() && 
                      year === today.getFullYear();
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${year}-${month + 1}-${i}">
          ${i}
        </div>`;
    }

    // 다음 달의 시작 날짜들
    const remainingDays = 42 - (firstDayIndex + lastDayDate);
    for (let i = 1; i <= remainingDays; i++) {
      html += `<div class="calendar-day next-month-day">${i}</div>`;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // 이전 달로 이동
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    return this.render();
  }

  // 다음 달로 이동
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    return this.render();
  }

  // 이벤트 리스너 설정
  attachEventListeners() {
    document.querySelector('.prev-month').addEventListener('click', () => {
      document.querySelector('.calendar').outerHTML = this.prevMonth();
      this.attachEventListeners();
    });

    document.querySelector('.next-month').addEventListener('click', () => {
      document.querySelector('.calendar').outerHTML = this.nextMonth();
      this.attachEventListeners();
    });

    // 날짜 선택 이벤트
    document.querySelectorAll('.calendar-day:not(.prev-month-day):not(.next-month-day)').forEach(day => {
      day.addEventListener('click', (e) => {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        e.target.classList.add('selected');
        const date = e.target.dataset.date;
        this.selectedDate = new Date(date);
        // 여기에 날짜 선택 시 실행할 콜백 함수를 추가할 수 있습니다.
      });
    });
  }
}

export default Calendar; 
