document.addEventListener('DOMContentLoaded', function () {
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

  document.getElementById('today-date').textContent = getTodayLabel();

  // Тема
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

  // Навигация
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Фото профиля
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

  // Маска даты
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

  // Тип заметки
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

  // Быстрое добавление
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

  // Основное добавление
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

  // Сохранение заметки
  function saveNote(title, text, type) {
    const note = { id: Date.now(), title, text, date: formatDate(new Date()), type };
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    updateStats();
  }

  // Рендер заметки
  function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.id = note.id;

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
      <div class="note-actions">
        <button class="btn-outline edit-note">✏️</button>
        <button class="btn-outline delete-note">🗑️</button>
      </div>
    `;

    div.querySelector('.delete-note').addEventListener('click', () => {
      if (confirm('Удалить заметку?')) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const filtered = notes.filter(n => n.id !== note.id);
        localStorage.setItem('notes', JSON.stringify(filtered));
        renderNotes();
        updateStats();
      }
    });

    div.querySelector('.edit-note').addEventListener('click', () => {
      document.getElementById('edit-id').value = note.id;
      document.getElementById('edit-title').value = note.title;
      document.getElementById('edit-text').value = note.text;
      document.getElementById('edit-modal').style.display = 'flex';
    });

    return div;
  }

  // Редактирование
  document.getElementById('edit-save')?.addEventListener('click', () => {
    const id = parseInt(document.getElementById('edit-id').value);
    const title = document.getElementById('edit-title').value.trim() || 'Без заголовка';
    const text = document.getElementById('edit-text').value.trim();
    if (!text) return;

    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], title, text };
      localStorage.setItem('notes', JSON.stringify(notes));
      renderNotes();
      document.getElementById('edit-modal').style.display = 'none';
      alert('Заметка обновлена!');
    }
  });

  document.getElementById('edit-cancel')?.addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
  });

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

  // Привычки
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
      renderChart();
      alert('Прогресс сохранён!');
    });
  }

  // Профиль
  const saveProfile = document.getElementById('save-profile');
  if (saveProfile) {
    saveProfile.addEventListener('click', () => {
      localStorage.setItem('profile', JSON.stringify({
        name: document.getElementById('name')?.value.trim() || 'Ваше имя и фамилия',
        about: document.getElementById('about')?.value.trim() || 'Чем вы занимаетесь',
        dob: document.getElementById('dob')?.value.trim() || 'День рождения'
      }));
      alert('Профиль сохранён!');
    });
  }

  // Выбор даты
  const datePicker = document.getElementById('date-picker');
  const today = new Date();
  datePicker.valueAsDate = today;

  datePicker.addEventListener('change', renderHabitsForDate);

  function renderHabitsForDate() {
    const selectedDate = datePicker.value;
    const formatted = selectedDate.split('-').reverse().join('.');
    document.getElementById('selected-date-label').textContent = formatted;

    const habitsLog = JSON.parse(localStorage.getItem('habitsLog') || '[]');
    const dayData = habitsLog.find(h => h.date === formatted);

    const container = document.getElementById('habits-detail');
    if (!dayData) {
      container.innerHTML = '<p>Нет данных за этот день</p>';
      return;
    }

    const habitNames = {
      water: '💧 Вода',
      sport: '🏃 Спорт',
      read: '📚 Чтение',
      sleep: '😴 Сон',
      walk: '🚶 Прогулка'
    };

    let html = '';
    for (const key of habitKeys) {
      const value = dayData[key].value;
      const unit = units[key];
      const done = dayData[key].done ? '✅' : '❌';
      html += `<div class="habit-row"><strong>${habitNames[key]}</strong>: ${value}${unit} ${done}</div>`;
    }
    container.innerHTML = html;
  }

  // График
  function renderChart() {
    const canvas = document.getElementById('habits-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const habitsLog = JSON.parse(localStorage.getItem('habitsLog') || []);
    const last7 = habitsLog.slice(0, 7).reverse();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (last7.length === 0) {
      ctx.fillStyle = '#777';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
      return;
    }

    const labels = last7.map(h => h.date);
    const waterData = last7.map(h => h.water.value);
    const sportData = last7.map(h => h.sport.value);

    const barWidth = Math.max(10, (canvas.width - 40) / labels.length - 4);
    const maxWater = Math.max(...waterData, 1);
    const maxSport = Math.max(...sportData, 1);
    const chartHeight = canvas.height - 40;

    for (let i = 0; i < labels.length; i++) {
      const x = 20 + i * (barWidth + 4);
      const waterHeight = (waterData[i] / maxWater) * chartHeight;
      const sportHeight = (sportData[i] / maxSport) * chartHeight;

      ctx.fillStyle = '#ff9eb5';
      ctx.fillRect(x, canvas.height - 20 - waterHeight, barWidth / 2, waterHeight);

      ctx.fillStyle = '#ffb380';
      ctx.fillRect(x + barWidth / 2, canvas.height - 20 - sportHeight, barWidth / 2, sportHeight);

      ctx.fillStyle = '#777';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 5);
    }
  }

  // Загрузка данных
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

  // Инициализация
  loadProfile();
  loadHabits();
  renderNotes();
  updateStats();
  renderHabitsForDate();
  renderChart();
});