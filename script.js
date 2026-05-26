/* ============================================================
   КЕДР · ЛЕТО 2026 · ЛЕНДИНГ
   script.js — этап 3, итерация 1

   - Тень шапки при скролле
   - Карусель в hero (автопрокрутка + клики + свайпы)
   - Аккордеон FAQ
   ============================================================ */

/* ============================================================
   1. Тень у шапки при скролле
   ============================================================ */
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
}, { passive: true });


/* ============================================================
   1b. Бургер и мобильное меню
   ============================================================ */
(function initBurger() {
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;

  function openMenu() {
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Клик по пункту меню → закрытие
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Закрытие при изменении ширины (вышли в десктоп)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1100 && burger.classList.contains('open')) {
      closeMenu();
    }
  });

  // Esc — закрыть
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.classList.contains('open')) {
      closeMenu();
    }
  });
})();


/* ============================================================
   2. Карусель Hero
   ============================================================ */
(function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 2500; // 2.5 секунды между слайдами

  function goToSlide(index) {
    // Нормализуем индекс
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Клики по точкам
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startAutoplay(); // Перезапускаем таймер
    });
  });

  // Свайпы на мобильном
  const heroEl = document.querySelector('.hero');
  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50;

  heroEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  heroEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToSlide(currentIndex - 1); // свайп вправо → предыдущий
      } else {
        goToSlide(currentIndex + 1); // свайп влево → следующий
      }
    }
    startAutoplay();
  }, { passive: true });

  // Пауза автопрокрутки при наведении мышью
  heroEl.addEventListener('mouseenter', stopAutoplay);
  heroEl.addEventListener('mouseleave', startAutoplay);

  // Уважаем настройки пользователя (анимации в системе отключены)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // не запускаем автопрокрутку
  }

  // Первое переключение через короткую задержку,
  // чтобы юзер успел заметить первый слайд (фасад) перед сменой
  setTimeout(() => {
    nextSlide();
    startAutoplay();
  }, 800);
})();


/* ============================================================
   3. Аккордеон FAQ
   ============================================================ */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Закрываем все остальные
    document.querySelectorAll('.faq-item').forEach(other => {
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      other.querySelector('.faq-answer').classList.remove('open');
    });

    // Открываем текущий, если был закрыт
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});


/* ============================================================
   4. Маска телефона +7 (___) ___-__-__
   ============================================================ */
(function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  function formatPhone(raw) {
    // Только цифры
    let digits = raw.replace(/\D/g, '');

    // Если начинается с 7 или 8 — отбрасываем (потом сами поставим +7)
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.slice(1);
    }

    // Ограничиваем 10 цифрами
    digits = digits.slice(0, 10);

    // Собираем форматированную строку
    let out = '+7';
    if (digits.length > 0) out += ' (' + digits.slice(0, 3);
    if (digits.length >= 3) out += ') ' + digits.slice(3, 6);
    if (digits.length >= 6) out += '-' + digits.slice(6, 8);
    if (digits.length >= 8) out += '-' + digits.slice(8, 10);

    return out;
  }

  // При фокусе на пустое поле — сразу префикс
  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value) {
      phoneInput.value = '+7 ';
    }
  });

  // При вводе — форматируем
  phoneInput.addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });

  // Запрещаем стирать префикс "+7 "
  phoneInput.addEventListener('keydown', (e) => {
    const cursorPos = phoneInput.selectionStart;
    if (e.key === 'Backspace' && cursorPos <= 3) {
      e.preventDefault();
    }
  });

  // Обработка вставки из буфера
  phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    phoneInput.value = formatPhone(pasted);
  });

  // При потере фокуса с пустым (только "+7 ") — очищаем
  phoneInput.addEventListener('blur', () => {
    if (phoneInput.value === '+7 ' || phoneInput.value === '+7') {
      phoneInput.value = '';
    }
  });
})();


/* ============================================================
   5. Валидация и отправка формы
   ============================================================ */
(function initFormValidation() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  // ⚠️ ЗАМЕНИ ЭТОТ URL на свой после развёртывания Apps Script
  // Получишь его в Apps Script → Развернуть → Веб-приложение → URL
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvBLbfpI21BD6lM3oGJ0sSCsfzsUj6BiIimTeAV7894WXbbCp5gKivOIgesKb3N8Hb/exec';

  const submitBtn = form.querySelector('.form-submit');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Отправить заявку';

  const fields = {
    parentName: document.getElementById('parent-name'),
    phone: document.getElementById('phone'),
    consentPd: document.getElementById('consent-pd'),
    website: document.getElementById('website') // honeypot
  };

  // Снимаем подсветку ошибки при вводе в поле
  ['parent-name', 'phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearError(id, `error-${id}`);
      });
    }
  });

  // У чекбокса — снимаем при клике
  if (fields.consentPd) {
    fields.consentPd.addEventListener('change', () => {
      const errEl = document.getElementById('error-consent-pd');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('show');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Если бот заполнил honeypot — молча игнорируем
    if (fields.website && fields.website.value) {
      console.warn('Honeypot заполнен — отбрасываем как спам');
      form.reset();
      showToast('Заявка отправлена. Свяжемся в течение часа.');
      return;
    }

    if (!validate()) {
      // Скролл к первой ошибке
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus({ preventScroll: true });
      }
      return;
    }

    // Собираем данные
    const data = {
      timestamp: new Date().toISOString(),
      parentName: fields.parentName.value.trim(),
      phone: fields.phone.value.replace(/^\+/, ''), // отправляем без плюса в начале
      childAge: document.getElementById('child-age').value,
      period: document.getElementById('period').value,
      company: document.getElementById('company').value.trim(),
      city: document.getElementById('city').value,
      comment: document.getElementById('comment').value.trim(),
      consentPd: fields.consentPd.checked,
      consentMax: document.getElementById('consent-max').checked,
      utm_source: getUtmParam('utm_source'),
      utm_medium: getUtmParam('utm_medium'),
      utm_campaign: getUtmParam('utm_campaign'),
      utm_content: getUtmParam('utm_content'),
      page_url: window.location.href,
      website: '' // honeypot
    };

    setSubmitting(true);

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        // text/plain — чтобы не запускать CORS preflight в Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      form.reset();
      showToast('Заявка отправлена. Свяжемся в течение часа.');

    } catch (err) {
      console.error('Ошибка отправки заявки:', err);
      showToast('Не удалось отправить. Позвоните: 8 (39553) 704-65', 'error');
    } finally {
      setSubmitting(false);
    }
  });

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    if (isSubmitting) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';
      submitBtn.style.opacity = '0.7';
      submitBtn.style.cursor = 'wait';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      submitBtn.style.opacity = '';
      submitBtn.style.cursor = '';
    }
  }

  function validate() {
    let ok = true;

    // Имя
    if (!fields.parentName.value.trim() || fields.parentName.value.trim().length < 2) {
      setError('parent-name', 'error-parent-name', 'Введите ваше имя');
      ok = false;
    } else {
      clearError('parent-name', 'error-parent-name');
    }

    // Телефон
    if (!isValidPhone(fields.phone.value)) {
      setError('phone', 'error-phone', 'Введите корректный номер телефона');
      ok = false;
    } else {
      clearError('phone', 'error-phone');
    }

    // Согласие ПДн
    const consentErr = document.getElementById('error-consent-pd');
    if (!fields.consentPd.checked) {
      if (consentErr) {
        consentErr.textContent = 'Необходимо ваше согласие на обработку персональных данных';
        consentErr.classList.add('show');
      }
      ok = false;
    } else if (consentErr) {
      consentErr.textContent = '';
      consentErr.classList.remove('show');
    }

    return ok;
  }

  function isValidPhone(val) {
    // Проверяем что введено 11 цифр (российский номер)
    return val.replace(/\D/g, '').length === 11;
  }

  function setError(fieldId, errorId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    if (field) field.classList.add('error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('show');
    }
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    if (field) field.classList.remove('error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('show');
    }
  }

  function getUtmParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }
})();


/* ============================================================
   6. Toast-уведомление
   ============================================================ */
let toastTimer = null;

function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Сбрасываем предыдущий
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.remove('toast--error');
  if (type === 'error') {
    toast.classList.add('toast--error');
  }
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

console.log('Лендинг загружен. Этап 3, итерация 4: валидация формы активна.');
