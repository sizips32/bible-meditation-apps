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
  return stored ? JSON.parse(stored) : [];
}

function saveMeditationsToStorage(meditations) {
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
  const calendar = new Calendar();
});

// Navigation Functions
function showHomeView() {
  currentView = 'home';
  meditationContainer.innerHTML = `
    <div class="home-container">
      <div class="server-notice">
        <p>🔔 서버가 포트 7780에서 실행 중입니다. <strong>http://localhost:7780</strong>로 접속하세요.</p>
      </div>
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
      showBookMeditations(bookName);
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
                <button class="bible-book">
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
          <button class="btn-new-meditation" onclick="showMeditationForm('${new Date().toISOString().split('T')[0]}')">
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
  saveMeditationsToStorage(meditations);
  showCalendarView();
}

// Form Functions
function showMeditationForm(date) {
  const existingMeditation = meditations.find(m => m.date === date) || null;
  
  const modal = document.createElement('div');
  modal.className = 'meditation-modal';
  modal.innerHTML = `
    <div class="meditation-form">
      <div class="meditation-form-header">
        <h2>묵상 작성</h2>
        <div class="date-selector">
          <label for="meditationDate">📅 날짜:</label>
          <input type="date" id="meditationDate" value="${date}" required>
        </div>
      </div>

      <div class="form-group">
        <label for="bibleReference">📖 성경 구절</label>
        <input type="text" id="bibleReference" placeholder="예: 요한복음 3:16" 
               value="${existingMeditation ? existingMeditation.bibleReference || '' : ''}" required>
      </div>

      <div class="form-group">
        <label for="title">✏️ 제목</label>
        <input type="text" id="title" placeholder="오늘의 묵상 제목을 입력하세요" 
               value="${existingMeditation ? existingMeditation.title || '' : ''}" required>
      </div>

      <div class="meditation-sections">
        <div class="meditation-section">
          <h3>📝 Capture (포착하기)</h3>
          <p class="section-desc">말씀을 읽으며 마음에 와닿는 구절이나 단어를 포착합니다.</p>
          <textarea id="capture" placeholder="마음에 와닿는 말씀을 적어주세요...">${existingMeditation ? existingMeditation.capture || '' : ''}</textarea>
        </div>

        <div class="meditation-section">
          <h3>🔍 Organize (조직화하기)</h3>
          <p class="section-desc">포착한 말씀의 문맥을 살피고, 관련 구절들을 연결하여 의미를 정리합니다.</p>
          <textarea id="organize" placeholder="말씀의 의미와 문맥을 정리해보세요...">${existingMeditation ? existingMeditation.organize || '' : ''}</textarea>
        </div>

        <div class="meditation-section">
          <h3>💡 Distill (압축하기)</h3>
          <p class="section-desc">말씀을 통해 깨달은 핵심 진리를 한 문장으로 정리합니다.</p>
          <textarea id="distill" placeholder="깨달은 핵심 진리를 정리해보세요...">${existingMeditation ? existingMeditation.distill || '' : ''}</textarea>
        </div>

        <div class="meditation-section">
          <h3>🙏 Express (표현하기)</h3>
          <p class="section-desc">깨달은 진리를 기도로 표현하고, 구체적인 적용점을 찾습니다.</p>
          <textarea id="express" placeholder="기도와 적용점을 작성해보세요...">${existingMeditation ? existingMeditation.express || '' : ''}</textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-save" onclick="saveMeditation()">
          💾 저장하기
        </button>
        <button type="button" class="btn-cancel">
          ❌ 취소하기
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 이벤트 리스너 등록
  const saveBtn = modal.querySelector('.btn-save');
  const cancelBtn = modal.querySelector('.btn-cancel');
  const dateInput = modal.querySelector('#meditationDate');

  // 저장 버튼 클릭 이벤트
  saveBtn.addEventListener('click', () => {
    const meditationData = {
      date: dateInput.value,
      bibleReference: document.getElementById('bibleReference').value,
      title: document.getElementById('title').value,
      capture: document.getElementById('capture').value,
      organize: document.getElementById('organize').value,
      distill: document.getElementById('distill').value,
      express: document.getElementById('express').value
    };

    // 기존 묵상이 있으면 업데이트, 없으면 새로 추가
    const index = meditations.findIndex(m => m.date === meditationData.date);
    if (index !== -1) {
      meditations[index] = meditationData;
    } else {
      meditations.push(meditationData);
    }

    saveMeditationsToStorage(meditations);
    modal.remove();
    calendar.render(); // 달력 다시 렌더링
  });

  // 취소 버튼 클릭 이벤트
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });

  // 모달 외부 클릭시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function closeMeditationForm() {
  meditationFormContainer.style.display = 'none';
  meditationForm.reset();
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
  
  saveMeditationsToStorage(meditations);
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

function displayRecentMeditations(currentPage = 1) {
  const container = document.getElementById('recentMeditations');
  const paginationContainer = document.getElementById('meditationPagination');
  if (!container || !paginationContainer) return;

  // 페이지당 항목 수
  const itemsPerPage = 10;
  
  // 날짜순으로 정렬된 묵상 목록
  const sortedMeditations = [...meditations].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sortedMeditations.length / itemsPerPage);
  
  // 현재 페이지의 묵상 목록
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeditations = sortedMeditations.slice(startIndex, endIndex);

  if (currentMeditations.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>아직 작성된 묵상이 없습니다.</p>
      </div>
    `;
    paginationContainer.innerHTML = '';
    return;
  }

  // 묵상 목록 표시
  container.innerHTML = `
    <table class="recent-meditations-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>성경 구절</th>
          <th>제목</th>
          <th>묵상 내용</th>
        </tr>
      </thead>
      <tbody>
        ${currentMeditations.map(meditation => `
          <tr onclick="displayMeditation(${JSON.stringify(meditation).replace(/"/g, '&quot;')})">
            <td class="date-cell">${formatDate(meditation.date)}</td>
            <td class="bible-cell">📖 ${meditation.bibleReference}</td>
            <td class="title-cell">${meditation.title}</td>
            <td class="preview-cell">${truncateText(meditation.capture, 50)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // 페이지네이션 표시
  if (totalPages > 1) {
    let paginationHTML = '<div class="pagination-controls">';
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
      paginationHTML += `<button onclick="displayRecentMeditations(${currentPage - 1})">◀</button>`;
    }
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <button class="${i === currentPage ? 'active' : ''}" 
                onclick="displayRecentMeditations(${i})">${i}</button>
      `;
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      paginationHTML += `<button onclick="displayRecentMeditations(${currentPage + 1})">▶</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
  } else {
    paginationContainer.innerHTML = '';
  }
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  try {
    // 로컬 스토리지에서 데이터 로드
    meditations = loadMeditations();
    meditationPrayers = loadMeditationPrayers();
    intercessoryPrayers = loadIntercessoryPrayers();
    
    // 네비게이션 이벤트 리스너 등록
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 이전 활성화된 링크의 클래스 제거
        navLinks.forEach(l => l.classList.remove('active'));
        
        // 클릭된 링크 활성화
        link.classList.add('active');
        
        // 클릭된 링크에 시각적 효과 추가
        const effectElement = document.createElement('span');
        effectElement.classList.add('nav-click-effect');
        link.appendChild(effectElement);
        
        // 효과 요소 일정 시간 후 제거
        setTimeout(() => {
          effectElement.remove();
        }, 500);
        
        // 링크의 data-view 속성으로 뷰 전환 (없으면 텍스트로 판단)
        const viewType = link.dataset.view || getViewFromText(link.textContent.trim());
        
        // 뷰 전환 및 상태 업데이트
        switchView(viewType);
      });
    });
    
    // 폼 제출 이벤트 리스너 등록
    meditationForm.addEventListener('submit', handleSubmit);
    
    // 초기 화면 표시 (홈)
    showHomeView();
    // 홈 메뉴 활성화
    navLinks[0].classList.add('active');
    
  } catch (error) {
    console.error('Error initializing application:', error);
    alert('앱 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
  }
});

/**
 * 텍스트 내용으로 뷰 타입을 추출하는 함수
 */
function getViewFromText(text) {
  if (text.includes('홈')) return 'home';
  if (text.includes('달력')) return 'calendar';
  if (text.includes('성경 목록')) return 'bible-list';
  if (text.includes('묵상 기도')) return 'meditation-prayer';
  if (text.includes('중보 기도')) return 'intercessory-prayer';
  if (text.includes('검색')) return 'search';
  return 'home'; // 기본값
}

/**
 * 뷰 타입에 따라 적절한 뷰를 표시하는 함수
 */
function switchView(viewType) {
  // 이전 뷰 상태 백업
  const previousView = currentView;
  
  // 현재 뷰 업데이트
  currentView = viewType;
  
  // 상태 표시줄 업데이트
  updateStatusIndicator(viewType);
  
  // 뷰 타입에 따라 적절한 함수 호출
  switch(viewType) {
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
    default:
      console.warn(`알 수 없는 뷰 타입: ${viewType}`);
      showHomeView();
  }
  
  // 뷰 전환 이벤트 발생 (커스텀 이벤트)
  const viewChangeEvent = new CustomEvent('viewChanged', {
    detail: { previous: previousView, current: currentView }
  });
  document.dispatchEvent(viewChangeEvent);
}

/**
 * 현재 뷰를 상태 표시줄에 표시하는 함수
 */
function updateStatusIndicator(viewType) {
  let statusText = '';
  
  switch(viewType) {
    case 'home':
      statusText = '홈';
      break;
    case 'calendar':
      statusText = '달력';
      break;
    case 'bible-list':
      statusText = '성경 목록';
      break;
    case 'meditation-prayer':
      statusText = '묵상 기도';
      break;
    case 'intercessory-prayer':
      statusText = '중보 기도';
      break;
    case 'search':
      statusText = '검색';
      break;
    default:
      statusText = '';
  }
  
  // 상태 표시가 있는 경우에만 추가
  if (statusText && document.querySelector('.header h1')) {
    const statusIndicator = document.createElement('span');
    statusIndicator.classList.add('current-view-indicator');
    statusIndicator.textContent = ` - ${statusText}`;
    
    // 이전 상태 표시가 있으면 제거
    const existingIndicator = document.querySelector('.current-view-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    document.querySelector('.header h1').appendChild(statusIndicator);
  }
}

// 묵상 기도 뷰 표시
function showMeditationPrayerView() {
  currentView = 'meditation-prayer';
  calendar.style.display = 'none';
  
  meditationContainer.innerHTML = `
    <div class="prayer-container">
      <div class="prayer-header">
        <h2>🙏 묵상 기도</h2>
        <p class="prayer-description">
          말씀을 통해 받은 은혜와 깨달음을 기도로 표현하고 일기처럼 기록하는 공간입니다.
        </p>
      </div>
      
      <div class="prayer-actions">
        <button class="btn-new-prayer" onclick="showMeditationPrayerForm()">
          <i class="fas fa-plus"></i> 새 묵상 기도 작성
        </button>
      </div>
      
      <div class="prayer-list">
        <h3>나의 묵상 기도 목록</h3>
        <div id="meditationPrayersList"></div>
      </div>
    </div>
  `;
  
  displayMeditationPrayers();
}

// 중보 기도 뷰 표시
function showIntercessoryPrayerView() {
  currentView = 'intercessory-prayer';
  calendar.style.display = 'none';
  
  meditationContainer.innerHTML = `
    <div class="prayer-container">
      <div class="prayer-header">
        <h2>✋ 중보 기도</h2>
        <p class="prayer-description">
          가족, 친구, 교회, 나라와 사회를 위한 중보 기도를 기록하고 응답을 기록하는 공간입니다.
        </p>
      </div>
      
      <div class="prayer-actions">
        <button class="btn-new-prayer" onclick="showIntercessoryPrayerForm()">
          <i class="fas fa-plus"></i> 새 중보 기도 작성
        </button>
      </div>
      
      <div class="prayer-stats">
        <div class="prayer-stat-item">
          <div class="stat-number">${intercessoryPrayers.length}</div>
          <div class="stat-title">전체 기도</div>
        </div>
        <div class="prayer-stat-item">
          <div class="stat-number">${intercessoryPrayers.filter(p => p.answered).length}</div>
          <div class="stat-title">응답 받음</div>
        </div>
        <div class="prayer-stat-item">
          <div class="stat-number">${intercessoryPrayers.filter(p => !p.answered).length}</div>
          <div class="stat-title">기도 중</div>
        </div>
      </div>
      
      <div class="prayer-list">
        <h3>나의 중보 기도 목록</h3>
        <div id="intercessoryPrayersList"></div>
      </div>
    </div>
  `;
  
  displayIntercessoryPrayers();
}

// 묵상 기도 폼 표시
function showMeditationPrayerForm(prayerId = null) {
  currentPrayer = null;
  
  if (prayerId) {
    currentPrayer = meditationPrayers.find(p => p.id === prayerId);
  }
  
  const formContainer = document.createElement('div');
  formContainer.className = 'prayer-form-container';
  
  formContainer.innerHTML = `
    <div class="prayer-form">
      <h2 class="form-title">${currentPrayer ? '묵상 기도 수정하기' : '새 묵상 기도 작성하기'}</h2>
      <form id="meditationPrayerForm">
        <div class="form-group">
          <label for="prayerTitle">제목</label>
          <input type="text" id="prayerTitle" required placeholder="기도의 제목을 입력하세요" 
                 value="${currentPrayer ? currentPrayer.title : ''}">
        </div>
        
        <div class="form-group">
          <label for="prayerScripture">관련 성경 구절 (선택사항)</label>
          <input type="text" id="prayerScripture" placeholder="예: 시편 23:1-3" 
                 value="${currentPrayer ? currentPrayer.scripture || '' : ''}">
        </div>
        
        <div class="form-group">
          <label for="prayerContent">기도 내용</label>
          <textarea id="prayerContent" required placeholder="하나님께 드리는 기도를 적어주세요">${currentPrayer ? currentPrayer.content : ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="prayerReflection">묵상 및 적용점</label>
          <textarea id="prayerReflection" placeholder="기도를 통해 깨달은 점이나 적용점을 적어주세요">${currentPrayer ? currentPrayer.reflection || '' : ''}</textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-save">
            <i class="fas fa-save"></i> 저장하기
          </button>
          <button type="button" class="btn-cancel" onclick="closePrayerForm()">
            <i class="fas fa-times"></i> 취소하기
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(formContainer);
  
  // 폼 제출 이벤트 리스너 등록
  document.getElementById('meditationPrayerForm').addEventListener('submit', handleMeditationPrayerSubmit);
}

// 중보 기도 폼 표시
function showIntercessoryPrayerForm(prayerId = null) {
  currentPrayer = null;
  
  if (prayerId) {
    currentPrayer = intercessoryPrayers.find(p => p.id === prayerId);
  }
  
  const formContainer = document.createElement('div');
  formContainer.className = 'prayer-form-container';
  
  formContainer.innerHTML = `
    <div class="prayer-form">
      <h2 class="form-title">${currentPrayer ? '중보 기도 수정하기' : '새 중보 기도 작성하기'}</h2>
      <form id="intercessoryPrayerForm">
        <div class="form-group">
          <label for="prayerTitle">제목</label>
          <input type="text" id="prayerTitle" required placeholder="기도의 제목을 입력하세요" 
                 value="${currentPrayer ? currentPrayer.title : ''}">
        </div>
        
        <div class="form-group">
          <label for="prayerCategory">카테고리</label>
          <select id="prayerCategory" required>
            <option value="">카테고리 선택</option>
            <option value="가족" ${currentPrayer && currentPrayer.category === '가족' ? 'selected' : ''}>가족</option>
            <option value="친구/지인" ${currentPrayer && currentPrayer.category === '친구/지인' ? 'selected' : ''}>친구/지인</option>
            <option value="교회" ${currentPrayer && currentPrayer.category === '교회' ? 'selected' : ''}>교회</option>
            <option value="나라와 사회" ${currentPrayer && currentPrayer.category === '나라와 사회' ? 'selected' : ''}>나라와 사회</option>
            <option value="선교" ${currentPrayer && currentPrayer.category === '선교' ? 'selected' : ''}>선교</option>
            <option value="기타" ${currentPrayer && currentPrayer.category === '기타' ? 'selected' : ''}>기타</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="prayerContent">기도 내용</label>
          <textarea id="prayerContent" required placeholder="중보 기도 내용을 적어주세요">${currentPrayer ? currentPrayer.content : ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="prayerScripture">관련 성경 구절 (선택사항)</label>
          <input type="text" id="prayerScripture" placeholder="예: 로마서 8:26-27" 
                 value="${currentPrayer ? currentPrayer.scripture || '' : ''}">
        </div>
        
        <div class="form-group checkbox-group">
          <input type="checkbox" id="prayerAnswered" ${currentPrayer && currentPrayer.answered ? 'checked' : ''}>
          <label for="prayerAnswered">기도 응답 받음</label>
        </div>
        
        <div class="form-group" id="answerGroup" style="${currentPrayer && currentPrayer.answered ? '' : 'display: none;'}">
          <label for="prayerAnswer">응답 내용 및 감사</label>
          <textarea id="prayerAnswer" placeholder="기도 응답 내용과 감사를 적어주세요">${currentPrayer && currentPrayer.answer ? currentPrayer.answer : ''}</textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-save">
            <i class="fas fa-save"></i> 저장하기
          </button>
          <button type="button" class="btn-cancel" onclick="closePrayerForm()">
            <i class="fas fa-times"></i> 취소하기
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(formContainer);
  
  // 응답 체크박스 이벤트 리스너
  document.getElementById('prayerAnswered').addEventListener('change', function() {
    document.getElementById('answerGroup').style.display = this.checked ? '' : 'none';
  });
  
  // 폼 제출 이벤트 리스너 등록
  document.getElementById('intercessoryPrayerForm').addEventListener('submit', handleIntercessoryPrayerSubmit);
}

// 기도 폼 닫기
function closePrayerForm() {
  const formContainer = document.querySelector('.prayer-form-container');
  if (formContainer) {
    formContainer.remove();
  }
}

// 묵상 기도 제출 처리
function handleMeditationPrayerSubmit(event) {
  event.preventDefault();
  
  const prayerData = {
    id: currentPrayer ? currentPrayer.id : Date.now().toString(),
    date: new Date().toISOString(),
    title: document.getElementById('prayerTitle').value,
    scripture: document.getElementById('prayerScripture').value,
    content: document.getElementById('prayerContent').value,
    reflection: document.getElementById('prayerReflection').value
  };
  
  if (currentPrayer) {
    // 수정 모드
    const index = meditationPrayers.findIndex(p => p.id === currentPrayer.id);
    if (index !== -1) {
      prayerData.date = currentPrayer.date; // 원래 생성 날짜 유지
      prayerData.updatedAt = new Date().toISOString(); // 수정 날짜 추가
      meditationPrayers[index] = prayerData;
    }
  } else {
    // 새 기도 작성 모드
    meditationPrayers.push(prayerData);
  }
  
  saveMeditationPrayers();
  closePrayerForm();
  showMeditationPrayerView();
}

// 중보 기도 제출 처리
function handleIntercessoryPrayerSubmit(event) {
  event.preventDefault();
  
  const answered = document.getElementById('prayerAnswered').checked;
  
  const prayerData = {
    id: currentPrayer ? currentPrayer.id : Date.now().toString(),
    date: new Date().toISOString(),
    title: document.getElementById('prayerTitle').value,
    category: document.getElementById('prayerCategory').value,
    content: document.getElementById('prayerContent').value,
    scripture: document.getElementById('prayerScripture').value,
    answered: answered,
    answer: answered ? document.getElementById('prayerAnswer').value : ''
  };
  
  if (currentPrayer) {
    // 수정 모드
    const index = intercessoryPrayers.findIndex(p => p.id === currentPrayer.id);
    if (index !== -1) {
      prayerData.date = currentPrayer.date; // 원래 생성 날짜 유지
      prayerData.updatedAt = new Date().toISOString(); // 수정 날짜 추가
      intercessoryPrayers[index] = prayerData;
    }
  } else {
    // 새 기도 작성 모드
    intercessoryPrayers.push(prayerData);
  }
  
  saveIntercessoryPrayers();
  closePrayerForm();
  showIntercessoryPrayerView();
}

// 묵상 기도 목록 표시
function displayMeditationPrayers() {
  const container = document.getElementById('meditationPrayersList');
  if (!container) return;
  
  if (meditationPrayers.length === 0) {
    container.innerHTML = `
      <div class="no-prayers">
        <p>아직 작성된 묵상 기도가 없습니다.</p>
      </div>
    `;
    return;
  }
  
  // 날짜 기준 최신순 정렬
  const sortedPrayers = [...meditationPrayers].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  container.innerHTML = `
    <div class="prayer-items">
      ${sortedPrayers.map(prayer => `
        <div class="prayer-item" data-id="${prayer.id}">
          <div class="prayer-item-header">
            <h4>${prayer.title}</h4>
            <div class="prayer-meta">
              <span class="prayer-date">${formatDate(prayer.date)}</span>
              ${prayer.scripture ? `<span class="prayer-scripture">📖 ${prayer.scripture}</span>` : ''}
            </div>
          </div>
          <div class="prayer-item-content">
            <p>${prayer.content.substring(0, 100)}${prayer.content.length > 100 ? '...' : ''}</p>
          </div>
          <div class="prayer-item-actions">
            <button class="btn-view" onclick="viewMeditationPrayer('${prayer.id}')">
              <i class="fas fa-eye"></i> 보기
            </button>
            <button class="btn-edit" onclick="editMeditationPrayer('${prayer.id}')">
              <i class="fas fa-edit"></i> 수정
            </button>
            <button class="btn-delete" onclick="deleteMeditationPrayer('${prayer.id}')">
              <i class="fas fa-trash"></i> 삭제
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 중보 기도 목록 표시
function displayIntercessoryPrayers() {
  const container = document.getElementById('intercessoryPrayersList');
  if (!container) return;
  
  if (intercessoryPrayers.length === 0) {
    container.innerHTML = `
      <div class="no-prayers">
        <p>아직 작성된 중보 기도가 없습니다.</p>
      </div>
    `;
    return;
  }
  
  // 날짜 기준 최신순 정렬
  const sortedPrayers = [...intercessoryPrayers].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 카테고리별 그룹화
  const groupedPrayers = sortedPrayers.reduce((groups, prayer) => {
    const category = prayer.category || '기타';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(prayer);
    return groups;
  }, {});
  
  container.innerHTML = `
    <div class="prayer-categories">
      ${Object.entries(groupedPrayers).map(([category, prayers]) => `
        <div class="prayer-category">
          <h4 class="category-title">${category} (${prayers.length})</h4>
          <div class="prayer-items">
            ${prayers.map(prayer => `
              <div class="prayer-item ${prayer.answered ? 'prayer-answered' : ''}" data-id="${prayer.id}">
                <div class="prayer-item-header">
                  <h4>${prayer.title}</h4>
                  <div class="prayer-meta">
                    <span class="prayer-date">${formatDate(prayer.date)}</span>
                    ${prayer.answered ? '<span class="prayer-status answered">✅ 응답됨</span>' : '<span class="prayer-status ongoing">🙏 기도 중</span>'}
                  </div>
                </div>
                <div class="prayer-item-content">
                  <p>${prayer.content.substring(0, 100)}${prayer.content.length > 100 ? '...' : ''}</p>
                </div>
                <div class="prayer-item-actions">
                  <button class="btn-view" onclick="viewIntercessoryPrayer('${prayer.id}')">
                    <i class="fas fa-eye"></i> 보기
                  </button>
                  <button class="btn-edit" onclick="editIntercessoryPrayer('${prayer.id}')">
                    <i class="fas fa-edit"></i> 수정
                  </button>
                  <button class="btn-delete" onclick="deleteIntercessoryPrayer('${prayer.id}')">
                    <i class="fas fa-trash"></i> 삭제
                  </button>
                  ${!prayer.answered ? `
                    <button class="btn-answer" onclick="markPrayerAsAnswered('${prayer.id}')">
                      <i class="fas fa-check"></i> 응답 표시
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 묵상 기도 보기
function viewMeditationPrayer(prayerId) {
  const prayer = meditationPrayers.find(p => p.id === prayerId);
  if (!prayer) return;
  
  const viewContainer = document.createElement('div');
  viewContainer.className = 'prayer-view-container';
  
  viewContainer.innerHTML = `
    <div class="prayer-view">
      <div class="prayer-view-close" onclick="closePrayerView()">
        <i class="fas fa-times"></i>
      </div>
      
      <div class="prayer-view-header">
        <h2>${prayer.title}</h2>
        <div class="prayer-meta">
          <p class="prayer-date">${formatDate(prayer.date)}</p>
          ${prayer.scripture ? `<p class="prayer-scripture">📖 ${prayer.scripture}</p>` : ''}
        </div>
      </div>
      
      <div class="prayer-view-section">
        <h3>기도 내용</h3>
        <div class="prayer-content">${prayer.content}</div>
      </div>
      
      ${prayer.reflection ? `
        <div class="prayer-view-section">
          <h3>묵상 및 적용점</h3>
          <div class="prayer-reflection">${prayer.reflection}</div>
        </div>
      ` : ''}
      
      <div class="prayer-view-actions">
        <button class="btn-edit" onclick="editMeditationPrayer('${prayer.id}'); closePrayerView();">
          <i class="fas fa-edit"></i> 수정하기
        </button>
        <button class="btn-close" onclick="closePrayerView()">
          <i class="fas fa-arrow-left"></i> 돌아가기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(viewContainer);
}

// 중보 기도 보기
function viewIntercessoryPrayer(prayerId) {
  const prayer = intercessoryPrayers.find(p => p.id === prayerId);
  if (!prayer) return;
  
  const viewContainer = document.createElement('div');
  viewContainer.className = 'prayer-view-container';
  
  viewContainer.innerHTML = `
    <div class="prayer-view">
      <div class="prayer-view-close" onclick="closePrayerView()">
        <i class="fas fa-times"></i>
      </div>
      
      <div class="prayer-view-header">
        <h2>${prayer.title}</h2>
        <div class="prayer-meta">
          <p class="prayer-category">${prayer.category}</p>
          <p class="prayer-date">${formatDate(prayer.date)}</p>
          ${prayer.scripture ? `<p class="prayer-scripture">📖 ${prayer.scripture}</p>` : ''}
          <p class="prayer-status ${prayer.answered ? 'answered' : 'ongoing'}">
            ${prayer.answered ? '✅ 응답됨' : '🙏 기도 중'}
          </p>
        </div>
      </div>
      
      <div class="prayer-view-section">
        <h3>기도 내용</h3>
        <div class="prayer-content">${prayer.content}</div>
      </div>
      
      ${prayer.answered && prayer.answer ? `
        <div class="prayer-view-section">
          <h3>응답 내용 및 감사</h3>
          <div class="prayer-answer">${prayer.answer}</div>
        </div>
      ` : ''}
      
      <div class="prayer-view-actions">
        <button class="btn-edit" onclick="editIntercessoryPrayer('${prayer.id}'); closePrayerView();">
          <i class="fas fa-edit"></i> 수정하기
        </button>
        ${!prayer.answered ? `
          <button class="btn-answer" onclick="markPrayerAsAnswered('${prayer.id}'); closePrayerView();">
            <i class="fas fa-check"></i> 응답 표시하기
          </button>
        ` : ''}
        <button class="btn-close" onclick="closePrayerView()">
          <i class="fas fa-arrow-left"></i> 돌아가기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(viewContainer);
}

// 기도 보기 닫기
function closePrayerView() {
  const viewContainer = document.querySelector('.prayer-view-container');
  if (viewContainer) {
    viewContainer.remove();
  }
}

// 묵상 기도 수정
function editMeditationPrayer(prayerId) {
  showMeditationPrayerForm(prayerId);
}

// 중보 기도 수정
function editIntercessoryPrayer(prayerId) {
  showIntercessoryPrayerForm(prayerId);
}

// 묵상 기도 삭제
function deleteMeditationPrayer(prayerId) {
  if (!confirm('이 기도를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  
  meditationPrayers = meditationPrayers.filter(p => p.id !== prayerId);
  saveMeditationPrayers();
  showMeditationPrayerView();
}

// 중보 기도 삭제
function deleteIntercessoryPrayer(prayerId) {
  if (!confirm('이 기도를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  
  intercessoryPrayers = intercessoryPrayers.filter(p => p.id !== prayerId);
  saveIntercessoryPrayers();
  showIntercessoryPrayerView();
}

// 중보 기도 응답 표시
function markPrayerAsAnswered(prayerId) {
  const prayer = intercessoryPrayers.find(p => p.id === prayerId);
  if (!prayer) return;
  
  const answerFormContainer = document.createElement('div');
  answerFormContainer.className = 'prayer-form-container';
  
  answerFormContainer.innerHTML = `
    <div class="prayer-form">
      <h2 class="form-title">기도 응답 기록하기</h2>
      <form id="prayerAnswerForm">
        <div class="form-group">
          <label for="prayerAnswer">응답 내용 및 감사</label>
          <textarea id="prayerAnswer" required placeholder="기도 응답 내용과 감사를 적어주세요"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-save">
            <i class="fas fa-save"></i> 저장하기
          </button>
          <button type="button" class="btn-cancel" onclick="closePrayerForm()">
            <i class="fas fa-times"></i> 취소하기
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(answerFormContainer);
  
  // 폼 제출 이벤트 리스너 등록
  document.getElementById('prayerAnswerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const answer = document.getElementById('prayerAnswer').value;
    const index = intercessoryPrayers.findIndex(p => p.id === prayerId);
    
    if (index !== -1) {
      intercessoryPrayers[index].answered = true;
      intercessoryPrayers[index].answer = answer;
      intercessoryPrayers[index].answeredAt = new Date().toISOString();
      
      saveIntercessoryPrayers();
      closePrayerForm();
      showIntercessoryPrayerView();
    }
  });
}

// 데이터베이스 관련 함수들
async function saveMeditationToDatabase(meditationData) {
  try {
    const response = await fetch('http://localhost:7780/api/meditations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meditationData)
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }

    const result = await response.json();
    showNotification('묵상이 성공적으로 저장되었습니다.', 'success');
    return result;
  } catch (error) {
    console.error('서버 저장 실패:', error);
    showNotification('서버 저장에 실패했습니다. 로컬에 저장합니다.', 'error');
    
    // 로컬 스토리지에 저장
    const meditations = JSON.parse(localStorage.getItem('meditations') || '[]');
    meditations.push(meditationData);
    localStorage.setItem('meditations', JSON.stringify(meditations));
    
    throw error;
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

// 묵상 폼 저장 처리 함수
async function saveMeditation() {
  const meditationData = {
    date: document.getElementById('meditationDate').value,
    bibleReference: document.getElementById('bibleReference').value,
    title: document.getElementById('title').value,
    capture: document.getElementById('capture').value,
    organize: document.getElementById('organize').value,
    distill: document.getElementById('distill').value,
    express: document.getElementById('express').value
  };

  try {
    // 데이터베이스에 저장 시도
    await saveMeditationToDatabase(meditationData);
    
    // 모달 닫기
    const modal = document.querySelector('.meditation-modal');
    if (modal) {
      modal.remove();
    }
    
    // 성공 메시지 표시
    showNotification('묵상이 성공적으로 저장되었습니다.', 'success');
  } catch (error) {
    console.error('저장 중 오류 발생:', error);
    showNotification('저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
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
