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

// LocalStorage Functions
function loadMeditations() {
  const stored = localStorage.getItem('meditations');
  return stored ? JSON.parse(stored) : [];
}

function saveMeditationsToStorage(meditations) {
  localStorage.setItem('meditations', JSON.stringify(meditations));
}

// Calendar Functions
function generateCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = new Date();

  // Update month display
  const monthYear = firstDay.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long'
  });
  currentMonthElement.innerHTML = `📅 ${monthYear}`;

  let calendarHTML = `
    <div class="calendar-header">일</div>
    <div class="calendar-header">월</div>
    <div class="calendar-header">화</div>
    <div class="calendar-header">수</div>
    <div class="calendar-header">목</div>
    <div class="calendar-header">금</div>
    <div class="calendar-header">토</div>
  `;

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }

  // Add days of the month
  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasMeditation = meditations.some(m => m.date === date);
    const isToday = today.getFullYear() === year && 
                    today.getMonth() === month && 
                    today.getDate() === day;
    
    calendarHTML += `
      <div class="calendar-day ${hasMeditation ? 'has-meditation' : ''} ${isToday ? 'today' : ''}" 
           data-date="${date}">
        <span class="date">${day}</span>
        ${hasMeditation ? '<span class="meditation-indicator">✏️</span>' : ''}
      </div>
    `;
  }

  calendar.innerHTML = calendarHTML;
  addCalendarEventListeners();
  calendar.style.display = 'grid';
}

function addCalendarEventListeners() {
  const days = document.querySelectorAll('.calendar-day:not(.empty)');
  days.forEach(day => {
    day.addEventListener('click', () => {
      const date = day.dataset.date;
      const meditation = meditations.find(m => m.date === date);
      
      if (meditation) {
        displayMeditation(meditation);
      } else {
        showMeditationForm(date);
      }
    });
  });
}

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
          <button class="action-btn calendar-btn" onclick="showCalendarView()">
            <span>📅</span>
            <span>달력으로 시작하기</span>
          </button>
          <button class="action-btn bible-btn" onclick="showBibleListView()">
            <span>📚</span>
            <span>성경으로 시작하기</span>
          </button>
          <button class="action-btn meditation-btn" onclick="showMeditationForm('${new Date().toISOString().split('T')[0]}')">
            <span>✏️</span>
            <span>새 묵상 작성하기</span>
          </button>
        </div>
      </div>

      <div class="recent-section">
        <h3>📝 최근 묵상</h3>
        <div id="recentMeditations"></div>
      </div>
    </div>
  `;
  calendar.style.display = 'none';
  displayRecentMeditations();
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
      </div>
    </div>
  `;
  calendar.style.display = 'none';
  
  // 최근 묵상 표시
  displayRecentMeditations();
  
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
  currentMeditation = null;  // 새로운 묵상 작성 모드
  document.getElementById('meditationDate').value = date;
  meditationFormContainer.style.display = 'flex';
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

function displayRecentMeditations() {
  const recentMeditations = [...meditations]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);  // 10개에서 3개로 변경

  const container = document.getElementById('recentMeditations');
  if (!container) return;

  if (recentMeditations.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>아직 작성된 묵상이 없습니다.</p>
      </div>
    `;
    return;
  }

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
        ${recentMeditations.map(meditation => `
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
    
    // 네비게이션 이벤트 리스너 등록
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const text = link.textContent.trim();
        if (text.includes('홈')) showHomeView();
        else if (text.includes('달력')) showCalendarView();
        else if (text.includes('성경 목록')) showBibleListView();
        else if (text.includes('검색')) showSearchView();
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
