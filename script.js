// DOM Elements
const calendar = document.querySelector('.calendar');
const meditationContainer = document.querySelector('.meditation-container');
const currentMonthElement = document.getElementById('current-month');
const meditationFormContainer = document.querySelector('.meditation-form-container');
const meditationForm = document.getElementById('meditationForm');
const navLinks = document.querySelectorAll('.nav-link');

// State
let currentDate = new Date();
let meditations = [];
let currentMeditation = null;
let currentView = 'calendar';
let meditationPrayers = []; // 묵상 기도 목록
let intercessoryPrayers = []; // 중보 기도 목록
let currentPrayer = null; // 현재 편집 중인 기도

// LocalStorage Functions
function loadMeditations() {
  const stored = localStorage.getItem('meditations');
  meditations = stored ? JSON.parse(stored) : [];
  return meditations;
}

function saveMeditationsToStorage() {
  localStorage.setItem('meditations', JSON.stringify(meditations));
}

// 묵상 기도와 중보 기도 로드 및 저장 함수
function loadMeditationPrayers() {
  const stored = localStorage.getItem('meditationPrayers');
  return stored ? JSON.parse(stored) : [];
}

function saveIntercessoryPrayers() {
  localStorage.setItem('intercessoryPrayers', JSON.stringify(intercessoryPrayers));
}

function loadIntercessoryPrayers() {
  const stored = localStorage.getItem('intercessoryPrayers');
  return stored ? JSON.parse(stored) : [];
}

function saveMeditationPrayers() {
  localStorage.setItem('meditationPrayers', JSON.stringify(meditationPrayers));
}

// Calendar Functions
class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
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
          <div class="day-name sunday">일</div>
          <div class="day-name">월</div>
          <div class="day-name">화</div>
          <div class="day-name">수</div>
          <div class="day-name">목</div>
          <div class="day-name">금</div>
          <div class="day-name saturday">토</div>
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
      
      const dayOfWeek = new Date(year, month, i).getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      
      // 해당 날짜에 묵상 기록이 있는지 확인
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasMeditation = localStorage.getItem(dateStr) !== null;
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}" 
             data-date="${dateStr}">
          <span class="date-number">${i}</span>
          ${hasMeditation ? '<span class="meditation-indicator">✏️</span>' : ''}
        </div>`;
    }

    // 다음 달의 시작 날짜들
    const remainingDays = 42 - (firstDayIndex + lastDayDate);
    for (let i = 1; i <= remainingDays; i++) {
      const dayOfWeek = new Date(year, month + 1, i).getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      
      html += `
        <div class="calendar-day next-month-day ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}">
          ${i}
        </div>`;
    }

    html += `
        </div>
      </div>
    `;

    document.querySelector('.calendar').innerHTML = html;

    // 이벤트 리스너 추가
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => {
      day.addEventListener('click', () => {
        const date = day.dataset.date;
        showMeditationForm(date);
      });
    });
  }

  // 이전 달로 이동
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
    this.attachEventListeners();
  }

  // 다음 달로 이동
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
    this.attachEventListeners();
  }

  // 이벤트 리스너 설정
  attachEventListeners() {
    document.querySelector('.prev-month').addEventListener('click', () => {
      this.prevMonth();
    });

    document.querySelector('.next-month').addEventListener('click', () => {
      this.nextMonth();
    });

    // 날짜 선택 이벤트
    document.querySelectorAll('.calendar-day:not(.prev-month-day):not(.next-month-day)').forEach(day => {
      day.addEventListener('click', (e) => {
        const date = e.currentTarget.dataset.date;
        if (date) {
          document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          showMeditationForm(date);
        }
      });
    });
  }
}

// 달력 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 기존에 열려있는 모달 제거
  closeMeditationForm();
  
  // 데이터 로드
  loadMeditations();
  
  // 달력 초기화
  const calendar = new Calendar();
  
  // 네비게이션 이벤트 리스너 등록
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      switch(view) {
        case 'home':
          showHomeView();
          break;
        case 'calendar':
          showCalendarView();
          break;
        case 'bible-list':
          showBibleListView();
          break;
        case 'meditation-prayer':
          showMeditationPrayerView();
          break;
        case 'intercessory-prayer':
          showIntercessoryPrayerView();
          break;
        case 'search':
          showSearchView();
          break;
      }
      
      // 네비게이션 활성화 상태 업데이트
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});

// 페이지 새로고침/언로드 시 모달 제거
window.addEventListener('beforeunload', () => {
  closeMeditationForm();
});

// Navigation Functions
function showHomeView() {
  currentView = 'home';
  meditationContainer.innerHTML = `
    <div class="home-container">
      <div class="welcome-section">
        <h2>📖 성경 CODE 묵상법</h2>
        <p class="welcome-text">
          말씀을 더 깊이 이해하고 삶에 적용하기 위한 체계적인 묵상 방법입니다.
        </p>
      </div>

      <div class="code-method-grid">
        <div class="code-card">
          <div class="code-header">
            <span class="code-emoji">📝</span>
            <h3>Capture<br>(포착하기)</h3>
          </div>
          <div class="code-content">
            <p>말씀을 읽으며 마음에 와닿는 구절이나 단어를 포착합니다.</p>
            <div class="code-example">
              <strong>예시</strong>
              <p>"그가 찔림은 우리의 허물을 인함이요" (이사야 53:5)</p>
              <p>→ '찔림'이라는 단어가 마음에 와닿았습니다.</p>
            </div>
          </div>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-emoji">🔍</span>
            <h3>Organize<br>(조직화하기)</h3>
          </div>
          <div class="code-content">
            <p>포착한 말씀의 문맥을 살피고, 관련 구절들을 연결하여 의미를 정리합니다.</p>
            <div class="code-example">
              <strong>예시</strong>
              <p>- 이사야 53장은 메시아의 고난을 예언</p>
              <p>- '찔림'은 십자가에서의 희생을 의미</p>
              <p>- 요한복음 19:34와 연결됨</p>
            </div>
          </div>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-emoji">💡</span>
            <h3>Distill<br>(압축하기)</h3>
          </div>
          <div class="code-content">
            <p>말씀을 통해 깨달은 핵심 진리를 한 문장으로 정리합니다.</p>
            <div class="code-example">
              <strong>예시</strong>
              <p>"예수님의 고난은 나의 죄를 대속하기 위한 사랑의 표현이었다."</p>
            </div>
          </div>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-emoji">🙏</span>
            <h3>Express<br>(표현하기)</h3>
          </div>
          <div class="code-content">
            <p>깨달은 진리를 기도로 표현하고, 구체적인 적용점을 찾습니다.</p>
            <div class="code-example">
              <strong>예시</strong>
              <p>- 감사기도: 주님의 희생에 감사</p>
              <p>- 적용: 오늘 누군가를 위해 희생적 사랑을 실천하기</p>
            </div>
          </div>
        </div>
      </div>

      <div class="action-section">
        <h3>🌟 지금 바로 시작해보세요!</h3>
        <div class="action-buttons">
          <button class="action-btn calendar-btn" onclick="handleCalendarStart()">
            <span>📅</span>
            <span>달력으로 시작하기</span>
          </button>
          <button class="action-btn bible-btn" onclick="handleBibleStart()">
            <span>📚</span>
            <span>성경으로 시작하기</span>
          </button>
          <button class="action-btn meditation-btn" onclick="handleNewMeditation()">
            <span>✏️</span>
            <span>새 묵상 작성하기</span>
          </button>
        </div>
      </div>
    </div>
  `;
  calendar.style.display = 'none';
}

function showCalendarView() {
  currentView = 'calendar';
  meditationContainer.innerHTML = '';
  calendar.style.display = 'grid';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  generateCalendar(year, month);
}

// Bible Data
const bibleStructure = {
  oldTestament: {
    title: '구약',
    info: '(총 929장 23,145절)',
    categories: {
      pentateuch: {
        title: '모세오경',
        books: [
          { name: '창세기', info: '50장 1,533절' },
          { name: '출애굽기', info: '40장 1,213절' },
          { name: '레위기', info: '27장 859절' },
          { name: '민수기', info: '36장 1,288절' },
          { name: '신명기', info: '34장 959절' }
        ]
      },
      historical: {
        title: '역사서',
        books: [
          { name: '여호수아', info: '24장 658절' },
          { name: '사사기', info: '21장 618절' },
          { name: '룻기', info: '4장 85절' },
          { name: '사무엘상', info: '31장 810절' },
          { name: '사무엘하', info: '24장 695절' },
          { name: '열왕기상', info: '22장 816절' },
          { name: '열왕기하', info: '25장 719절' },
          { name: '역대상', info: '29장 942절' },
          { name: '역대하', info: '36장 822절' },
          { name: '에스라', info: '10장 280절' },
          { name: '느헤미야', info: '13장 406절' },
          { name: '에스더', info: '10장 167절' }
        ]
      },
      poetic: {
        title: '시가서',
        books: [
          { name: '욥기', info: '42장 1,070절' },
          { name: '시편', info: '150장 2,461절' },
          { name: '잠언', info: '31장 915절' },
          { name: '전도서', info: '12장 222절' },
          { name: '아가서', info: '8장 117절' }
        ]
      },
      majorProphets: {
        title: '대선지서',
        books: [
          { name: '이사야', info: '66장 1,292절' },
          { name: '예레미야', info: '52장 1,364절' },
          { name: '예레미야애가', info: '5장 154절' },
          { name: '에스겔', info: '48장 1,273절' },
          { name: '다니엘', info: '12장 357절' }
        ]
      },
      minorProphets: {
        title: '소선지서',
        books: [
          { name: '호세아', info: '14장 197절' },
          { name: '요엘', info: '3장 73절' },
          { name: '아모스', info: '9장 146절' },
          { name: '오바댜', info: '1장 21절' },
          { name: '요나', info: '4장 48절' },
          { name: '미가', info: '7장 105절' },
          { name: '나훔', info: '3장 47절' },
          { name: '하박국', info: '3장 56절' },
          { name: '스바냐', info: '3장 53절' },
          { name: '학개', info: '2장 38절' },
          { name: '스가랴', info: '14장 211절' },
          { name: '말라기', info: '4장 55절' }
        ]
      }
    }
  },
  newTestament: {
    title: '신약',
    info: '(총 260장 7,957절)',
    categories: {
      gospels: {
        title: '복음서',
        books: [
          { name: '마태복음', info: '28장 1,071절' },
          { name: '마가복음', info: '16장 678절' },
          { name: '누가복음', info: '24장 1,151절' },
          { name: '요한복음', info: '21장 879절' }
        ]
      },
      acts: {
        title: '역사서',
        books: [
          { name: '사도행전', info: '28장 1,007절' }
        ]
      },
      churchEpistles: {
        title: '교회 서신서',
        books: [
          { name: '로마서', info: '16장 433절' },
          { name: '고린도전서', info: '16장 437절' },
          { name: '고린도후서', info: '13장 257절' },
          { name: '갈라디아서', info: '6장 149절' },
          { name: '에베소서', info: '6장 155절' },
          { name: '빌립보서', info: '4장 104절' },
          { name: '골로새서', info: '4장 95절' },
          { name: '데살로니가전서', info: '5장 89절' },
          { name: '데살로니가후서', info: '3장 47절' }
        ]
      },
      pastoralAndGeneralEpistles: {
        title: '개인/일반 서신서',
        books: [
          { name: '디모데전서', info: '6장 113절' },
          { name: '디모데후서', info: '4장 83절' },
          { name: '디도서', info: '3장 46절' },
          { name: '빌레몬서', info: '1장 25절' },
          { name: '히브리서', info: '13장 303절' },
          { name: '야고보서', info: '5장 108절' },
          { name: '베드로전서', info: '5장 105절' },
          { name: '베드로후서', info: '3장 61절' },
          { name: '요한1서', info: '5장 105절' },
          { name: '요한2서', info: '1장 13절' },
          { name: '요한3서', info: '1장 14절' },
          { name: '유다서', info: '1장 25절' }
        ]
      },
      revelation: {
        title: '예언서',
        books: [
          { name: '요한계시록', info: '22장 404절' }
        ]
      }
    }
  }
};

function showBibleListView() {
  currentView = 'bible-list';
  meditationContainer.innerHTML = `
    <div class="bible-container">
      <div class="testament-section">
        <h2>
          <span style="font-size: 2.8rem;">📖</span> 
          ${bibleStructure.oldTestament.title} (39권)
          <div class="testament-info">${bibleStructure.oldTestament.info}</div>
        </h2>
        ${generateTestamentHTML('oldTestament')}
      </div>
      <div class="testament-section">
        <h2>
          <span style="font-size: 2.8rem;">📖</span> 
          ${bibleStructure.newTestament.title} (27권)
          <div class="testament-info">${bibleStructure.newTestament.info}</div>
        </h2>
        ${generateTestamentHTML('newTestament')}
      </div>
    </div>
  `;
  calendar.style.display = 'none';

  // 성경 책 클릭 이벤트 리스너 추가
  document.querySelectorAll('.bible-book').forEach(book => {
    book.addEventListener('click', () => {
      const bookName = book.textContent;
      handleBookClick(bookName);
    });
  });
}

function generateTestamentHTML(testament) {
  const testamentData = bibleStructure[testament];
  const categoryEmojis = {
    pentateuch: '📚',
    historical: '📜',
    poetic: '🎵',
    majorProphets: '🔮',
    minorProphets: '✨',
    gospels: '✝️',
    acts: '⚡',
    churchEpistles: '✉️',
    pastoralAndGeneralEpistles: '📨',
    revelation: '🌟'
  };
  
  return `
    <div class="bible-categories">
      ${Object.entries(testamentData.categories).map(([key, category]) => `
        <div class="bible-category">
          <h3>
            <span>${categoryEmojis[key]}</span> 
            ${category.title} (${category.books.length}권)
          </h3>
          <div class="bible-books">
            ${category.books.map(book => {
              const bookMeditations = meditations.filter(meditation => 
                meditation.bibleReference.includes(book.name)
              );
              return `
                <button class="bible-book" onclick="handleBookClick('${book.name}')">
                  <div class="book-name">${book.name}</div>
                  <div class="book-info">${book.info}</div>
                  ${bookMeditations.length > 0 ? 
                    `<div class="meditation-count">묵상 ${bookMeditations.length}개</div>` : 
                    ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 성경 책 클릭 핸들러 함수
function handleBookClick(bookName) {
  showMeditationForm(new Date().toISOString().split('T')[0], bookName);
}

function showBookMeditations(bookName) {
  const bookMeditations = meditations.filter(meditation => 
    meditation.bibleReference.includes(bookName.split(' ')[0])
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬

  const container = document.querySelector('.bible-container');
  container.innerHTML = `
    <div class="book-meditations">
      <div class="book-header">
        <button class="btn-back" onclick="showBibleListView()">
          <span>←</span>
          <span>돌아가기</span>
        </button>
        <h2>
          📖 ${bookName.split(' ')[0]} 묵상 목록
          ${bookMeditations.length > 0 ? 
            `<span class="meditation-total">(총 ${bookMeditations.length}개)</span>` : 
            ''}
        </h2>
        <button class="btn-new-meditation" onclick="showMeditationFormWithBook('${bookName.split(' ')[0]}')">
          ✏️ 새 묵상 작성하기
        </button>
      </div>
      ${bookMeditations.length > 0 ? `
        <div class="meditation-list">
          ${bookMeditations.map(meditation => `
            <div class="meditation-list-item" onclick="displayMeditation(${JSON.stringify(meditation).replace(/"/g, '&quot;')})">
              <div class="meditation-list-date">${formatDate(meditation.date)}</div>
              <div class="meditation-list-content">
                <div class="meditation-list-title">${meditation.title}</div>
                <div class="meditation-list-bible">📖 ${meditation.bibleReference}</div>
                <div class="meditation-list-preview">
                  <strong>포착하기:</strong> ${truncateText(meditation.capture, 100)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="no-results">
          <p>📝 ${bookName.split(' ')[0]}에 대한 묵상이 아직 없습니다.</p>
          <button class="btn-new-meditation" onclick="showMeditationFormWithBook('${bookName.split(' ')[0]}')">
            ✏️ 새로운 묵상 작성하기
          </button>
        </div>
      `}
    </div>
  `;
}

function showSearchView() {
  currentView = 'search';
  meditationContainer.innerHTML = `
    <div class="search-container">
      <div class="search-form">
        <input type="text" id="searchInput" placeholder="묵상 내용이나 성경 구절을 검색하세요...">
        <button onclick="performSearch()">🔍 검색</button>
      </div>
      <div id="searchResults"></div>
      
      <div class="recent-meditations">
        <h3>📝 최근 묵상</h3>
        <div id="recentMeditations"></div>
        <div class="pagination" id="meditationPagination"></div>
      </div>
    </div>
  `;
  calendar.style.display = 'none';
  
  // 최근 묵상 표시
  displayRecentMeditations(1); // 첫 페이지 표시
  
  // 검색 입력창 엔터 키 이벤트 처리
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// Display Functions
function displayMeditation(meditation) {
  const container = document.querySelector('.meditation-container');
  container.innerHTML = `
    <div class="meditation-card">
      <div class="meditation-header">
        <h3>${meditation.title}</h3>
        <p class="bible-reference">📖 ${meditation.bibleReference}</p>
        <p class="meditation-date">📅 ${meditation.date}</p>
      </div>
      
      <div class="meditation-section">
        <h4>📝 Capture (포착하기)</h4>
        <p>${meditation.capture}</p>
      </div>
      
      <div class="meditation-section">
        <h4>🔍 Organize (조직화하기)</h4>
        <p>${meditation.organize}</p>
      </div>
      
      <div class="meditation-section">
        <h4>💡 Distill (압축하기)</h4>
        <p>${meditation.distill}</p>
      </div>
      
      <div class="meditation-section">
        <h4>🙏 Express (표현하기)</h4>
        <p>${meditation.express}</p>
      </div>
      
      <div class="meditation-actions">
        <button class="btn-edit" onclick="editMeditation('${meditation.date}')">
          ✏️ 수정하기
        </button>
        <button class="btn-delete" onclick="deleteMeditation('${meditation.date}')">
          🗑️ 삭제하기
        </button>
      </div>
    </div>
  `;
  
  calendar.style.display = 'none';
  container.style.display = 'block';
}

function editMeditation(date) {
  currentMeditation = meditations.find(m => m.date === date);
  if (!currentMeditation) return;
  
  document.getElementById('meditationDate').value = currentMeditation.date;
  document.getElementById('bibleReference').value = currentMeditation.bibleReference;
  document.getElementById('title').value = currentMeditation.title;
  document.getElementById('capture').value = currentMeditation.capture;
  document.getElementById('organize').value = currentMeditation.organize;
  document.getElementById('distill').value = currentMeditation.distill;
  document.getElementById('express').value = currentMeditation.express;
  
  meditationFormContainer.style.display = 'flex';
}

function deleteMeditation(date) {
  if (!confirm('이 묵상을 삭제하시겠습니까?')) return;
  
  meditations = meditations.filter(m => m.date !== date);
  saveMeditationsToStorage();
  showCalendarView();
}

// Form Functions
function showMeditationForm(date = null, bookName = null) {
  // 기존 모달이 있다면 제거
  closeMeditationForm();
  
  const modal = document.createElement('div');
  modal.className = 'meditation-modal';
  modal.innerHTML = `
    <div class="meditation-form">
      <div class="meditation-form-header">
        <h2>✏️ CODE 묵상 작성</h2>
        <div class="date-selector">
          <label for="meditationDate">📅 날짜:</label>
          <input type="date" id="meditationDate" value="${date || new Date().toISOString().split('T')[0]}" required>
        </div>
      </div>

      <div class="form-group">
        <label for="bibleReference">📖 성경 구절</label>
        <input type="text" id="bibleReference" placeholder="예: 요한복음 3:16" value="${bookName ? bookName + ' ' : ''}" required>
      </div>

      <div class="form-group">
        <label for="title">✨ 제목</label>
        <input type="text" id="title" placeholder="오늘의 묵상 제목을 입력하세요" required>
      </div>

      <div class="meditation-sections">
        <div class="meditation-section">
          <h3>📝 Capture (포착하기)</h3>
          <p class="section-desc">말씀을 처음 읽었을 때 마음에 와닿는 부분이나 특별히 눈에 띄는 단어, 구절을 적어보세요.</p>
          <textarea id="capture" required></textarea>
        </div>

        <div class="meditation-section">
          <h3>🔍 Organize (조직화하기)</h3>
          <p class="section-desc">말씀의 배경, 문맥, 구조를 파악하고 정리해보세요.</p>
          <textarea id="organize" required></textarea>
        </div>

        <div class="meditation-section">
          <h3>💡 Distill (압축하기)</h3>
          <p class="section-desc">말씀을 통해 전달하고자 하는 핵심 메시지가 무엇인지 정리해보세요.</p>
          <textarea id="distill" required></textarea>
        </div>

        <div class="meditation-section">
          <h3>🙏 Express (표현하기)</h3>
          <p class="section-desc">말씀을 통해 깨달은 것을 실천하기 위한 구체적인 계획과 결단을 적어보세요.</p>
          <textarea id="express" required></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-save" onclick="saveMeditation()">
          <i class="fas fa-save"></i> 저장하기
        </button>
        <button type="button" class="btn-cancel" onclick="closeMeditationForm()">
          <i class="fas fa-times"></i> 취소하기
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 이벤트 리스너 등록
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeMeditationForm();
    }
  });

  // 수정 모드인 경우 기존 데이터 채우기
  if (currentMeditation) {
    document.getElementById('meditationDate').value = currentMeditation.date;
    document.getElementById('bibleReference').value = currentMeditation.bibleReference;
    document.getElementById('title').value = currentMeditation.title;
    document.getElementById('capture').value = currentMeditation.capture;
    document.getElementById('organize').value = currentMeditation.organize;
    document.getElementById('distill').value = currentMeditation.distill;
    document.getElementById('express').value = currentMeditation.express;
  }
}

// 명상 폼 닫기
function closeMeditationForm() {
  const modal = document.querySelector('.meditation-modal');
  if (modal) {
    modal.remove();
  }
  currentMeditation = null;
}

// Event Handlers
function handleSubmit(event) {
  event.preventDefault();
  
  const formData = {
    date: document.getElementById('meditationDate').value,
    bibleReference: document.getElementById('bibleReference').value,
    title: document.getElementById('title').value,
    capture: document.getElementById('capture').value,
    organize: document.getElementById('organize').value,
    distill: document.getElementById('distill').value,
    express: document.getElementById('express').value,
  };

  if (currentMeditation) {
    // 수정 모드
    const index = meditations.findIndex(m => m.date === formData.date);
    if (index !== -1) {
      meditations[index] = formData;
    }
  } else {
    // 새로운 묵상 작성 모드
    meditations.push(formData);
  }
  
  saveMeditationsToStorage();
  closeMeditationForm();
  showCalendarView();
}

function performSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const searchResults = meditations.filter(meditation => 
    meditation.title.toLowerCase().includes(searchTerm) ||
    meditation.bibleReference.toLowerCase().includes(searchTerm) ||
    meditation.capture.toLowerCase().includes(searchTerm) ||
    meditation.organize.toLowerCase().includes(searchTerm) ||
    meditation.distill.toLowerCase().includes(searchTerm) ||
    meditation.express.toLowerCase().includes(searchTerm)
  ).slice(0, 10);  // 최대 10개로 제한

  displaySearchResults(searchResults);
}

function displaySearchResults(results) {
  const resultsContainer = document.getElementById('searchResults');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>검색 결과가 없습니다.</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `
    <h3>검색 결과 (${results.length}개)</h3>
    <div class="meditation-list">
      ${results.map(meditation => `
        <div class="meditation-list-item" onclick="displayMeditation(${JSON.stringify(meditation).replace(/"/g, '&quot;')})">
          <div class="meditation-list-date">${formatDate(meditation.date)}</div>
          <div class="meditation-list-content">
            <div class="meditation-list-title">${meditation.title}</div>
            <div class="meditation-list-bible">${meditation.bibleReference}</div>
            <div class="meditation-list-preview">${truncateText(meditation.capture, 100)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 묵상 기도 화면 표시
function showMeditationPrayerView() {
  currentView = 'meditation-prayer';
  meditationPrayers = loadMeditationPrayers();
  
  meditationContainer.innerHTML = `
    <div class="prayer-container">
      <h2>🙏 묵상 기도</h2>
      <button class="btn-add-prayer" onclick="showMeditationPrayerForm()">
        <i class="fas fa-plus"></i> 새 기도 작성
      </button>
      
      <div class="prayer-list" id="meditationPrayerList">
        ${generateMeditationPrayerList()}
      </div>
    </div>
  `;
}

// 중보 기도 화면 표시
function showIntercessoryPrayerView() {
  currentView = 'intercessory-prayer';
  intercessoryPrayers = loadIntercessoryPrayers();
  
  meditationContainer.innerHTML = `
    <div class="prayer-container">
      <h2>✨ 중보 기도</h2>
      <button class="btn-add-prayer" onclick="showIntercessoryPrayerForm()">
        <i class="fas fa-plus"></i> 새 중보기도 작성
      </button>
      
      <div class="prayer-list" id="intercessoryPrayerList">
        ${generateIntercessoryPrayerList()}
      </div>
    </div>
  `;
}

// 묵상 기도 목록 생성
function generateMeditationPrayerList() {
  if (meditationPrayers.length === 0) {
    return '<p class="no-prayer-message">아직 작성된 묵상 기도가 없습니다.</p>';
  }

  return meditationPrayers.map((prayer, index) => `
    <div class="prayer-card" data-index="${index}">
      <div class="prayer-header">
        <h3>${prayer.title}</h3>
        <span class="prayer-date">${formatDate(prayer.date)}</span>
      </div>
      <p class="prayer-content">${prayer.content}</p>
      <div class="prayer-actions">
        <button onclick="editMeditationPrayer(${index})">
          <i class="fas fa-edit"></i> 수정
        </button>
        <button onclick="deleteMeditationPrayer(${index})">
          <i class="fas fa-trash"></i> 삭제
        </button>
        <button onclick="togglePrayerAnswered(${index}, 'meditation')" 
                class="${prayer.answered ? 'answered' : ''}">
          <i class="fas ${prayer.answered ? 'fa-check-circle' : 'fa-circle'}"></i>
          ${prayer.answered ? '응답됨' : '응답 대기'}
        </button>
      </div>
    </div>
  `).join('');
}

// 중보 기도 목록 생성
function generateIntercessoryPrayerList() {
  if (intercessoryPrayers.length === 0) {
    return '<p class="no-prayer-message">아직 작성된 중보 기도가 없습니다.</p>';
  }

  return intercessoryPrayers.map((prayer, index) => `
    <div class="prayer-card" data-index="${index}">
      <div class="prayer-header">
        <h3>${prayer.title}</h3>
        <span class="prayer-date">${formatDate(prayer.date)}</span>
      </div>
      <p class="prayer-target">중보 대상: ${prayer.target}</p>
      <p class="prayer-content">${prayer.content}</p>
      <div class="prayer-actions">
        <button onclick="editIntercessoryPrayer(${index})">
          <i class="fas fa-edit"></i> 수정
        </button>
        <button onclick="deleteIntercessoryPrayer(${index})">
          <i class="fas fa-trash"></i> 삭제
        </button>
        <button onclick="togglePrayerAnswered(${index}, 'intercessory')"
                class="${prayer.answered ? 'answered' : ''}">
          <i class="fas ${prayer.answered ? 'fa-check-circle' : 'fa-circle'}"></i>
          ${prayer.answered ? '응답됨' : '응답 대기'}
        </button>
      </div>
    </div>
  `).join('');
}

// 묵상 기도 폼 표시
function showMeditationPrayerForm(editIndex = null) {
  const prayer = editIndex !== null ? meditationPrayers[editIndex] : null;
  
  const modal = document.createElement('div');
  modal.className = 'prayer-modal';
  modal.innerHTML = `
    <div class="prayer-form">
      <h3>${editIndex !== null ? '묵상 기도 수정' : '새로운 묵상 기도'}</h3>
      <form id="meditationPrayerForm">
        <input type="hidden" name="index" value="${editIndex}">
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" name="title" required 
                 value="${prayer ? prayer.title : ''}">
        </div>
        <div class="form-group">
          <label for="content">기도 내용</label>
          <textarea id="content" name="content" required>${prayer ? prayer.content : ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-save">저장</button>
          <button type="button" class="btn-cancel" onclick="closePrayerForm()">취소</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('meditationPrayerForm').addEventListener('submit', saveMeditationPrayer);
}

// 중보 기도 폼 표시
function showIntercessoryPrayerForm(editIndex = null) {
  const prayer = editIndex !== null ? intercessoryPrayers[editIndex] : null;
  
  const modal = document.createElement('div');
  modal.className = 'prayer-modal';
  modal.innerHTML = `
    <div class="prayer-form">
      <h3>${editIndex !== null ? '중보 기도 수정' : '새로운 중보 기도'}</h3>
      <form id="intercessoryPrayerForm">
        <input type="hidden" name="index" value="${editIndex}">
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" name="title" required 
                 value="${prayer ? prayer.title : ''}">
        </div>
        <div class="form-group">
          <label for="target">중보 대상</label>
          <input type="text" id="target" name="target" required 
                 value="${prayer ? prayer.target : ''}">
        </div>
        <div class="form-group">
          <label for="content">기도 내용</label>
          <textarea id="content" name="content" required>${prayer ? prayer.content : ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-save">저장</button>
          <button type="button" class="btn-cancel" onclick="closePrayerForm()">취소</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('intercessoryPrayerForm').addEventListener('submit', saveIntercessoryPrayer);
}

// 기도 폼 닫기
function closePrayerForm() {
  const modal = document.querySelector('.prayer-modal');
  if (modal) {
    modal.remove();
  }
}

// 묵상 기도 저장
function saveMeditationPrayer(event) {
  event.preventDefault();
  
  const form = event.target;
  const index = form.querySelector('[name="index"]').value;
  const prayerData = {
    title: form.querySelector('[name="title"]').value,
    content: form.querySelector('[name="content"]').value,
    date: new Date().toISOString(),
    answered: false
  };
  
  if (index !== '') {
    meditationPrayers[parseInt(index)] = { ...meditationPrayers[parseInt(index)], ...prayerData };
  } else {
    meditationPrayers.push(prayerData);
  }
  
  saveMeditationPrayers();
  closePrayerForm();
  showMeditationPrayerView();
  showNotification('묵상 기도가 저장되었습니다.', 'success');
}

// 중보 기도 저장
function saveIntercessoryPrayer(event) {
  event.preventDefault();
  
  const form = event.target;
  const index = form.querySelector('[name="index"]').value;
  const prayerData = {
    title: form.querySelector('[name="title"]').value,
    target: form.querySelector('[name="target"]').value,
    content: form.querySelector('[name="content"]').value,
    date: new Date().toISOString(),
    answered: false
  };
  
  if (index !== '') {
    intercessoryPrayers[parseInt(index)] = { ...intercessoryPrayers[parseInt(index)], ...prayerData };
  } else {
    intercessoryPrayers.push(prayerData);
  }
  
  saveIntercessoryPrayers();
  closePrayerForm();
  showIntercessoryPrayerView();
  showNotification('중보 기도가 저장되었습니다.', 'success');
}

// 기도 응답 상태 토글
function togglePrayerAnswered(index, type) {
  if (type === 'meditation') {
    meditationPrayers[index].answered = !meditationPrayers[index].answered;
    saveMeditationPrayers();
    showMeditationPrayerView();
  } else {
    intercessoryPrayers[index].answered = !intercessoryPrayers[index].answered;
    saveIntercessoryPrayers();
    showIntercessoryPrayerView();
  }
}

// 묵상 기도 수정
function editMeditationPrayer(index) {
  showMeditationPrayerForm(index);
}

// 중보 기도 수정
function editIntercessoryPrayer(index) {
  showIntercessoryPrayerForm(index);
}

// 묵상 기도 삭제
function deleteMeditationPrayer(index) {
  if (confirm('이 묵상 기도를 삭제하시겠습니까?')) {
    meditationPrayers.splice(index, 1);
    saveMeditationPrayers();
    showMeditationPrayerView();
    showNotification('묵상 기도가 삭제되었습니다.', 'info');
  }
}

// 중보 기도 삭제
function deleteIntercessoryPrayer(index) {
  if (confirm('이 중보 기도를 삭제하시겠습니까?')) {
    intercessoryPrayers.splice(index, 1);
    saveIntercessoryPrayers();
    showIntercessoryPrayerView();
    showNotification('중보 기도가 삭제되었습니다.', 'info');
  }
}

// 홈 화면 버튼 클릭 이벤트 핸들러들
function handleCalendarStart() {
  showCalendarView();
  showMeditationForm(new Date().toISOString().split('T')[0]);
}

function handleBibleStart() {
  // 성경 목록 메뉴로 이동
  showBibleListView();
  
  // 네비게이션 메뉴 활성화 상태 업데이트
  navLinks.forEach(link => link.classList.remove('active'));
  const bibleLink = Array.from(navLinks).find(link => link.dataset.view === 'bible-list');
  if (bibleLink) {
    bibleLink.classList.add('active');
  }
}

function handleNewMeditation() {
  // 묵상 기도 메뉴로 이동
  showMeditationPrayerView();
  
  // 네비게이션 메뉴 활성화 상태 업데이트
  navLinks.forEach(link => link.classList.remove('active'));
  const meditationPrayerLink = Array.from(navLinks).find(link => link.dataset.view === 'meditation-prayer');
  if (meditationPrayerLink) {
    meditationPrayerLink.classList.add('active');
  }
  
  // 새 묵상 기도 작성 폼 표시
  showMeditationPrayerForm();
}

// 알림 메시지 표시 함수
function showNotification(message, type = 'info') {
  // 기존 알림 제거
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 새 알림 생성
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // 알림 추가
  document.body.appendChild(notification);

  // 3초 후 알림 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 성경 이름이 미리 입력된 묵상 폼 표시
function showMeditationFormWithBook(bookName) {
  showMeditationForm(new Date().toISOString().split('T')[0], bookName);
}

async function saveMeditation(meditationData) {
  try {
    const { data, error } = await supabase
      .from('meditations')
      .upsert([
        {
          ...meditationData,
          meditation_prayer: document.getElementById('meditationPrayer').value,
          intercessory_prayer: document.getElementById('intercessoryPrayer').value,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    showNotification('묵상이 성공적으로 저장되었습니다.', 'success');
    return data;
  } catch (error) {
    console.error('Error saving meditation:', error);
    showNotification('묵상 저장 중 오류가 발생했습니다.', 'error');
    throw error;
  }
}

async function loadMeditation(date) {
  try {
    const { data, error } = await supabase
      .from('meditations')
      .select('*')
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터가 없는 경우
        return null;
      }
      throw error;
    }

    if (data) {
      // 기존 필드들 설정
      // ... existing code ...
      
      // 새로운 필드들 설정
      document.getElementById('meditationPrayer').value = data.meditation_prayer || '';
      document.getElementById('intercessoryPrayer').value = data.intercessory_prayer || '';
    }

    return data;
  } catch (error) {
    console.error('Error loading meditation:', error);
    showNotification('묵상 불러오기 중 오류가 발생했습니다.', 'error');
    throw error;
  }
}

// 검색 섹션의 최근 묵상 표시 함수 수정
function displayRecentMeditations(page = 1) {
  const itemsPerPage = 5;
  const meditations = JSON.parse(localStorage.getItem('meditations') || '[]');
  
  // 최신순으로 정렬
  meditations.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeditations = meditations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(meditations.length / itemsPerPage);

  const recentMeditationsContainer = document.getElementById('recentMeditations');
  
  if (meditations.length === 0) {
    recentMeditationsContainer.innerHTML = `
      <div class="no-meditations">
        <p>아직 작성된 묵상이 없습니다.</p>
      </div>
    `;
    return;
  }

  recentMeditationsContainer.innerHTML = `
    <table class="recent-meditations-table">
      <thead>
        <tr>
          <th class="date-cell">날짜</th>
          <th class="bible-cell">성경 구절</th>
          <th class="title-cell">제목</th>
          <th class="preview-cell">내용 미리보기</th>
        </tr>
      </thead>
      <tbody>
        ${paginatedMeditations.map(meditation => `
          <tr onclick="displayMeditation(${JSON.stringify(meditation).replace(/"/g, '&quot;')})">
            <td class="date-cell">${formatDate(meditation.date)}</td>
            <td class="bible-cell">${meditation.bibleReference}</td>
            <td class="title-cell">${meditation.title}</td>
            <td class="preview-cell">${truncateText(meditation.capture, 50)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // 페이지네이션 업데이트
  const paginationContainer = document.getElementById('meditationPagination');
  if (totalPages > 1) {
    paginationContainer.innerHTML = `
      <div class="pagination-controls">
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => `
          <button class="${pageNum === page ? 'active' : ''}" 
                  onclick="displayRecentMeditations(${pageNum})">
            ${pageNum}
          </button>
        `).join('')}
      </div>
    `;
  } else {
    paginationContainer.innerHTML = '';
  }
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 텍스트 자르기 함수
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
