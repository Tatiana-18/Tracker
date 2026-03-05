document.addEventListener('DOMContentLoaded', function () {
  // === Вспомогательные функции ===
  function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.${date.getFullYear()}`;
  }

  function getTodayLabel() {
    const now = new Date();
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${now.getDate()} ${months[now.getMonth()]}`;
  }

  // === Инициализация ===
  document.getElementById('today-date').textContent = getTodayLabel();

  // === Тема ===
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  // === Навигация ===
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // === Фото профиля ===
  const photoUpload = document.getElementById('photo-upload');
  const profilePhoto = document.getElementById('profile-photo');
  const photoPlaceholder = document.getElementById('photo-placeholder');

  if (photoUpload) {
    photoUpload.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          profilePhoto.src = ev.target.result;
          profilePhoto.style.display = 'block';
          photoPlaceholder.style.display = 'none';
          localStorage.setItem('profilePhoto', ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const savedPhoto = localStorage.getItem('profilePhoto');
  if (savedPhoto) {
    profilePhoto.src = savedPhoto;
    profilePhoto.style.display = 'block';
    photoPlaceholder.style.display = 'none';
  }

  // === Маска даты ===
  const dobInput = document.getElementById('dob');
  if (dobInput) {
    dobInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      let f = '';
      if (v.length >= 1) f += v[0];
      if (v.length >= 2) f += v[1] + '.';
      if (v.length >= 3) f += v[2];
      if (v.length >= 4) f += v[3] + '.';
      if (v.length >= 5) f += v[4];
      if (v.length >= 6) f += v[5];
      if (v.length >= 7) f += v[6];
      if (v.length >= 8) f += v[7];
      e.target.value = f;
    });
  }

  // === Тип заметки ===
  let noteType = 'bullet';
  const bulletBtn = document.getElementById('type-bullet');
  const numberBtn = document.getElementById('type-number');

  if (bulletBtn) bulletBtn.addEventListener('click', () => {
    noteType = 'bullet';
    bulletBtn.classList.add('active');
    numberBtn.classList.remove('active');
  });
  if (numberBtn) numberBtn.addEventListener('click', () => {
    noteType = 'number';
    numberBtn.classList.add('active');
    bulletBtn.classList.remove('active');
  });

  // === Быстрое добавление ===
  const quickBtn = document.getElementById('quick-add-btn');
  const quickModal = document.getElementById('quick-modal');
  if (quickBtn && quickModal) {
    quickBtn.addEventListener('click', () => {
      document.getElementById('quick-title').value = '';
      document.getElementById('quick-text').value = '';
      quickModal.style.display = 'flex';
    });
    document.getElementById('quick-cancel').addEventListener('click', () => {
      quickModal.style.display = 'none';
    });
    document.getElementById('quick-save').addEventListener('click', () => {
      const title = document.getElementById('quick-title').value.trim() || 'Без заголовка';
      const text = document.getElementById('quick-text').value.trim();
      if (text) {
        saveNote(title, text, noteType);
        quickModal.style.display = 'none';
        alert('Заметка добавлена!');
      }
    });
  }

  // === Основное добавление ===
  const addNoteBtn = document.getElementById('add-note');
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
      const title = document.getElementById('note-title').value.trim() || 'Без заголовка';
      const text = document.getElementById('note-text').value.trim();
      if (text) {
        saveNote(title, text, noteType);
        document.getElementById('note-title').value = '';
        document.getElementById('note-text').value = '';
        alert('Заметка добавлена!');
      }
    });
  }

  // === Сохранение заметки ===
  function saveNote(title, text, type) {
    const note = { id: Date.now(), title, text, date: formatDate(new Date()), type };
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    updateStats();
  }

  // === Рендер заметки ===
  function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = 'card';
    const lines = note.text.split('\n').map(l => l.trim()).filter(l => l);
    let listHTML = '';
    if (lines.length > 0) {
      if (note.type === 'number') {
        listHTML = '<ol>' + lines.map(l => `<li>${l}</li>`).join('') + '</ol>';
      } else {
        listHTML = '<ul>' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>';
      }
    }
    div.innerHTML = `
      <div class="note-title">${note.title}</div>
      <div class="note-date">${note.date}</div>
      ${listHTML}
    `;
    return div;
  }

  function renderNotes() {
    const container = document.getElementById('notes-list');
    const daily = document.getElementById('daily-notes-list');
    const today = formatDate(new Date());
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (container) container.innerHTML = '';
    if (daily) daily.innerHTML = '';
    notes.forEach(note => {
      const el = createNoteElement(note);
      if (container) container.appendChild(el);
      if (note.date === today && daily) daily.appendChild(createNoteElement(note));
    });
  }

  // === Привычки (5 штук) ===
  const habitKeys = ['water', 'sport', 'read', 'sleep', 'walk'];
  const units = { water: ' л', sport: ' мин', read: ' мин', sleep: ' ч', walk: ' мин' };

  habitKeys.forEach(key => {
    const btn = document.getElementById(`${key}-plus`);
    if (btn) {
      btn.addEventListener('click', () => {
        const input = document.getElementById(`${key}-input`);
        const sumEl = document.getElementById(`${key}-sum`);
        const totalEl = document.getElementById(`${key}-total`);
        if (!input || !sumEl || !totalEl) return;
        const cur = parseFloat(sumEl.textContent) || 0;
        const add = parseFloat(input.value) || 0;
        const newVal = cur + add;
        sumEl.textContent = newVal + units[key];
        totalEl.textContent = newVal + units[key];
        input.value = key === 'water' ? '0.5' : '1';
      });
    }
  });

  const saveHabits = document.getElementById('save-habits');
  if (saveHabits) {
    saveHabits.addEventListener('click', () => {
      const habits = {};
      habitKeys.forEach(key => {
        habits[key] = {
          value: parseFloat(document.getElementById(`${key}-sum`)?.textContent?.replace(/[^\d.]/g, '') || '0') || 0,
          done: !!document.getElementById(`${key}-done`)?.checked
        };
      });
      habits.date = formatDate(new Date());
      const log = JSON.parse(localStorage.getItem('habitsLog') || '[]');
      log.unshift(habits);
      localStorage.setItem('habitsLog', JSON.stringify(log));
      updateStats();
      alert('Прогресс сохранён!');
    });
  }

  // === Профиль ===
  const saveProfile = document.getElementById('save-profile');
  if (saveProfile) {
    saveProfile.addEventListener('click', () => {
      localStorage.setItem('profile', JSON.stringify({
        name: document.getElementById('name')?.value.trim() || 'Ваша фамилия и имя',
        about: document.getElementById('about')?.value.trim() || 'Чем вы занимаетесь',
        dob: document.getElementById('dob')?.value.trim() || 'Дата рождения'
      }));
      alert('Профиль сохранён!');
    });
  }

  // === Загрузка данных ===
  function loadProfile() {
    const p = JSON.parse(localStorage.getItem('profile') || '{}');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('name', p.name || '');
    set('about', p.about || '');
    set('dob', p.dob || '');
  }

  function loadHabits() {
    const log = JSON.parse(localStorage.getItem('habitsLog') || '[]');
    const today = formatDate(new Date());
    const h = log.find(x => x.date === today);
    if (h) {
      habitKeys.forEach(key => {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val + units[key]; };
        set(`${key}-sum`, h[key].value);
        set(`${key}-total`, h[key].value);
        const chk = document.getElementById(`${key}-done`);
        if (chk) chk.checked = h[key].done;
      });
    }
  }

  function updateStats() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const habits = JSON.parse(localStorage.getItem('habitsLog') || '[]');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('streak', habits.length);
    set('notes-count', notes.length);
    set('water-stats', habits.reduce((s, h) => s + h.water.value, 0).toFixed(1) + ' л');
    set('sport-stats', Math.round(habits.reduce((s, h) => s + h.sport.value, 0)) + ' мин');
    set('read-stats', Math.round(habits.reduce((s, h) => s + h.read.value, 0)) + ' мин');
    set('sleep-stats', Math.round(habits.reduce((s, h) => s + h.sleep.value, 0)) + ' ч');
    set('walk-stats', Math.round(habits.reduce((s, h) => s + h.walk.value, 0)) + ' мин');
    set('actions-total', habits.length * 5);
  }

  // === Инициализация ===
  loadProfile();
  loadHabits();
  renderNotes();
  updateStats();
});
