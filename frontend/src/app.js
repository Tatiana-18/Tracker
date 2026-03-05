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
  const todayDateEl = document.getElementById('today-date');
  if (todayDateEl) {
    todayDateEl.textContent = getTodayLabel();
  }

  // === Тема ===
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }

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

  if (bulletBtn) {
    bulletBtn.addEventListener('click', () => {
      noteType = 'bullet';
      bulletBtn.classList.add('active');
      numberBtn.classList.remove('active');
    });
  }
  if (numberBtn) {
    numberBtn.addEventListener('click', () => {
      noteType = 'number';
      numberBtn.classList.add('active');
      bulletBtn.classList.remove('active');
    });
  }

  // === Заметки ===
  function saveNote(title, text, type) {
    const note = { id: Date.now(), title, text, date: formatDate(new Date()), type };
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    updateStats();
  }

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

  // === Редактирование заметки ===
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

  // === Сохранение привычек ===
  const saveHabitsBtn = document.getElementById('save-habits');
  if (saveHabitsBtn) {
    saveHabitsBtn.addEventListener('click', () => {
      const habits = [
        { key: 'water', value: parseFloat(document.getElementById('water-sum').textContent) || 0, done: document.getElementById('water-done').checked },
        { key: 'sport', value: parseFloat(document.getElementById('sport-sum').textContent) || 0, done: document.getElementById('sport-done').checked },
        { key: 'read', value: parseFloat(document.getElementById('read-sum').textContent) || 0, done: document.getElementById('read-done').checked },
        { key: 'sleep', value: parseFloat(document.getElementById('sleep-sum').textContent) || 0, done: document.getElementById('sleep-done').checked },
        { key: 'walk', value: parseFloat(document.getElementById('walk-sum').textContent) || 0, done: document.getElementById('walk-done').checked }
      ];

      const today = formatDate(new Date());
      const log = JSON.parse(localStorage.getItem('habitsLog') || '[]');
      const existingIndex = log.findIndex(entry => entry.date === today);

      const newEntry = { date: today };
      habits.forEach(h => {
        newEntry[h.key] = { value: h.value, done: h.done };
      });

      if (existingIndex !== -1) {
        log[existingIndex] = newEntry;
      } else {
        log.unshift(newEntry);
      }

      localStorage.setItem('habitsLog', JSON.stringify(log));
      updateStats();
      alert('Прогресс за сегодня сохранён!');
    });
  }

  // === Кнопки "+" для привычек ===
  function setupHabitPlus(key) {
    const plusBtn = document.getElementById(`${key}-plus`);
    const input = document.getElementById(`${key}-input`);
    const sumEl = document.getElementById(`${key}-sum`);
    const totalEl = document.getElementById(`${key}-total`);

    if (plusBtn && input && sumEl && totalEl) {
      plusBtn.addEventListener('click', () => {
        const addValue = parseFloat(input.value) || 0;
        const currentSum = parseFloat(sumEl.textContent) || 0;
        const newSum = currentSum + addValue;
        const unit = key === 'water' ? ' л' : key === 'sleep' ? ' ч' : ' мин';
        sumEl.textContent = newSum + unit;
        totalEl.textContent = newSum + unit;
      });
    }
  }

  ['water', 'sport', 'read', 'sleep', 'walk'].forEach(key => {
    setupHabitPlus(key);
  });

  // === Выбор даты ===
  const datePicker = document.getElementById('date-picker');
  if (datePicker) {
    const today = new Date();
    datePicker.valueAsDate = today;
    datePicker.addEventListener('change', () => {
      const selectedDate = datePicker.value;
      const formatted = selectedDate.split('-').reverse().join('.');
      document.getElementById('selected-date-label').textContent = formatted;

      const habitsLog = JSON.parse(localStorage.getItem('habitsLog') || '[]');
      const dayData = habitsLog.find(h => h.date === formatted);
      const container = document.getElementById('habits-detail');

      if (!dayData || !container) {
        if (container) container.innerHTML = '<p>Нет данных за этот день</p>';
        return;
      }

      const habitMap = {
        water: '💧 Вода',
        sport: '🏃 Спорт',
        read: '📚 Чтение',
        sleep: '😴 Сон',
        walk: '🚶 Прогулка'
      };

      let html = '';
      for (const [key, name] of Object.entries(habitMap)) {
        if (dayData[key]) {
          const unit = key === 'water' ? ' л' : key === 'sleep' ? ' ч' : ' мин';
          const done = dayData[key].done ? '✅' : '❌';
          html += `<div class="habit-row"><strong>${name}</strong>: ${dayData[key].value}${unit} ${done}</div>`;
        }
      }
      container.innerHTML = html;
    });
  }

  // === Обновление статистики ===
  function updateStats() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const habitsLog = JSON.parse(localStorage.getItem('habitsLog') || '[]');

    document.getElementById('notes-count').textContent = notes.length;
    document.getElementById('actions-total').textContent = habitsLog.length * 5;
    document.getElementById('streak').textContent = habitsLog.length;

    // Вода
    const waterTotal = habitsLog.reduce((sum, day) => sum + (day.water?.value || 0), 0);
    document.getElementById('water-stats').textContent = waterTotal.toFixed(1) + ' л';

    // Спорт
    const sportTotal = habitsLog.reduce((sum, day) => sum + (day.sport?.value || 0), 0);
    document.getElementById('sport-stats').textContent = Math.round(sportTotal) + ' мин';

    // Чтение
    const readTotal = habitsLog.reduce((sum, day) => sum + (day.read?.value || 0), 0);
    document.getElementById('read-stats').textContent = Math.round(readTotal) + ' мин';

    // Сон
    const sleepTotal = habitsLog.reduce((sum, day) => sum + (day.sleep?.value || 0), 0);
    document.getElementById('sleep-stats').textContent = Math.round(sleepTotal) + ' ч';

    // Прогулка
    const walkTotal = habitsLog.reduce((sum, day) => sum + (day.walk?.value || 0), 0);
    document.getElementById('walk-stats').textContent = Math.round(walkTotal) + ' мин';
  }

  // === Инициализация ===
  renderNotes();
  updateStats();

  // Загрузка сохранённых значений привычек за сегодня
  const today = formatDate(new Date());
  const habitsLog = JSON.parse(localStorage.getItem('habitsLog') || '[]');
  const todayData = habitsLog.find(h => h.date === today);
  if (todayData) {
    ['water', 'sport', 'read', 'sleep', 'walk'].forEach(key => {
      const value = todayData[key]?.value || 0;
      const done = todayData[key]?.done || false;
      const unit = key === 'water' ? ' л' : key === 'sleep' ? ' ч' : ' мин';
      const sumEl = document.getElementById(`${key}-sum`);
      const totalEl = document.getElementById(`${key}-total`);
      const doneEl = document.getElementById(`${key}-done`);
      if (sumEl) sumEl.textContent = value + unit;
      if (totalEl) totalEl.textContent = value + unit;
      if (doneEl) doneEl.checked = done;
    });
  }
});