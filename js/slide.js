/**
 * @file slide.js
 * @description Slide Presentation Engine cho Đồ Án Tốt Nghiệp (FPT Polytechnic - PRO2192.04).
 *              Quản lý điều hướng slide, đếm ngược thời gian thuyết trình (15:00),
 *              hiển thị Presenter Notes (phím N), trình phát video demo và co giãn tỷ lệ 16:9.
 * @layer Presentation / Frontend Engine
 * @context Được nhúng trực tiếp vào index.html, chạy client-side trên mọi trình duyệt hiện đại.
 * @dependencies Vanilla JS (ES6+), CSS custom variables trong css/style.css
 * @rules Tuân thủ Project Guardrails (Scope boundary, 6-tier comments, Maintainability)
 */

(function () {
  'use strict';

  /* ==========================================================================
     TIER 5: CONSTANTS & CONFIGURATION (Đơn vị đo & Rationale)
     ========================================================================== */

  /** @constant {number} DEFAULT_PRESENTATION_SECONDS - Thời lượng tối đa cho phần thuyết trình slide (15 phút = 900 giây) */
  const DEFAULT_PRESENTATION_SECONDS = 15 * 60;

  /** @constant {number} TIMER_WARNING_SECONDS - Ngưỡng cảnh báo vàng (3 phút cuối = 180 giây) */
  const TIMER_WARNING_SECONDS = 3 * 60;

  /** @constant {number} TIMER_DANGER_SECONDS - Ngưỡng cảnh báo đỏ nguy cấp (1 phút cuối = 60 giây) */
  const TIMER_DANGER_SECONDS = 60;

  /** @constant {number} SLIDE_BASE_WIDTH - Chiều rộng chuẩn 16:9 của canvas slide (pixels) */
  const SLIDE_BASE_WIDTH = 1920;

  /** @constant {number} SLIDE_BASE_HEIGHT - Chiều cao chuẩn 16:9 của canvas slide (pixels) */
  const SLIDE_BASE_HEIGHT = 1080;

  /* ==========================================================================
     APPLICATION STATE
     ========================================================================== */
  let currentSlide = 0;
  let totalSlides = 0;
  let timerRunning = false;
  let timerSeconds = DEFAULT_PRESENTATION_SECONDS;
  let timerInterval = null;
  let notesVisible = false;
  let shortcutsVisible = false;
  let currentVideoMode = 'drive';

  /* ==========================================================================
     DOM SELECTORS & HELPERS
     ========================================================================== */
  const slides = () => document.querySelectorAll('.slide');
  const timerEl = () => document.getElementById('timer');
  const timerDisplay = () => document.getElementById('timer-display');
  const progressBar = () => document.getElementById('progress-bar');
  const slideCounter = () => document.getElementById('slide-counter');
  const presenterNotes = () => document.getElementById('presenter-notes');
  const shortcutsHelp = () => document.getElementById('shortcuts-help');

  /* ==========================================================================
     LIFECYCLE & INITIALIZATION
     ========================================================================== */

  /**
   * Khởi tạo toàn bộ hệ thống slide, đếm số slide thực tế, kích hoạt timer và gắn lắng nghe sự kiện.
   * @function init
   * @returns {void}
   */
  function init() {
    // Step 1: Đếm tổng số lượng slide trong DOM
    totalSlides = slides().length;

    // Step 2: Kiểm tra URL hash (ví dụ #2) để nhảy trực tiếp đến slide tương ứng
    const hash = window.location.hash;
    const initialIndex = hash ? parseInt(hash.replace('#', ''), 10) - 1 : 0;
    showSlide(!isNaN(initialIndex) && initialIndex >= 0 && initialIndex < totalSlides ? initialIndex : 0);

    // Step 3: Tính toán tỷ lệ co giãn phù hợp với màn hình hiện tại
    updateScale();

    // Step 4: Tự động khởi động đồng hồ đếm ngược 15:00
    startTimer();

    // Step 5: Gắn các trình lắng nghe sự kiện ngoại vi (Resize, Phím tắt, Click chuột, Hashchange)
    window.addEventListener('resize', updateScale);
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('hashchange', () => {
      const idx = parseInt(window.location.hash.replace('#', ''), 10) - 1;
      if (!isNaN(idx) && idx !== currentSlide) showSlide(idx);
    });
    document.addEventListener('click', handleClick);

    // Step 6: Thiết lập trình chọn video nếu slide có chứa video player
    setupVideoPicker();

    console.log(`[Slides Engine] Initialized ${totalSlides} slides. Countdown timer: 15:00`);
  }

  /* ==========================================================================
     SLIDE NAVIGATION LOGIC
     ========================================================================== */

  /**
   * Chuyển đến slide tại vị trí chỉ định, đồng thời cập nhật thanh tiến trình, số đếm và ghi chú thuyết trình.
   * @function showSlide
   * @param {number} index - Chỉ số slide mục tiêu (0-indexed)
   * @returns {void}
   */
  function showSlide(index) {
    // Step 1: Kiểm tra biên an toàn (Tránh tràn chỉ số mảng)
    if (index < 0 || index >= totalSlides) return;

    const allSlides = slides();

    // Step 2: Kích hoạt class 'active' cho slide được chọn, ẩn các slide còn lại
    allSlides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    currentSlide = index;

    // Step 3: Cập nhật độ rộng thanh tiến trình (progress bar)
    const pct = ((index + 1) / totalSlides) * 100;
    const pb = progressBar();
    if (pb) pb.style.width = pct + '%';

    // Step 4: Cập nhật nhãn số đếm slide (ví dụ: 1 / 17)
    const sc = slideCounter();
    if (sc) sc.textContent = `${index + 1} / ${totalSlides}`;

    // Step 5: Tự động tạm dừng video nếu chuyển ra khỏi slide chứa video
    const video = document.getElementById('demoVideo');
    if (video && !allSlides[index].contains(video) && !video.paused) {
      video.pause();
    }

    // Step 6: Cập nhật kịch bản ghi chú thuyết trình (Presenter Notes) tương ứng với slide hiện tại
    updateNotes();
  }

  /**
   * Chuyển sang slide kế tiếp.
   * @function nextSlide
   * @returns {void}
   */
  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  /**
   * Quay lại slide liền trước.
   * @function prevSlide
   * @returns {void}
   */
  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  /* ==========================================================================
     COUNTDOWN TIMER CONTROLLER (15 PHÚT THUYẾT TRÌNH)
     ========================================================================== */

  /**
   * Bắt đầu chạy đồng hồ đếm ngược mỗi 1000ms.
   * @function startTimer
   * @returns {void}
   */
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerRunning = true;
    timerInterval = setInterval(tickTimer, 1000);
    updateTimerDisplay();
  }

  /**
   * Giảm 1 giây thời gian còn lại và cập nhật giao diện hiển thị.
   * @function tickTimer
   * @returns {void}
   */
  function tickTimer() {
    if (!timerRunning || timerSeconds <= 0) return;
    timerSeconds--;
    updateTimerDisplay();
  }

  /**
   * Định dạng thời gian thành dạng MM:SS và đổi màu cảnh báo theo tiến độ.
   * @function updateTimerDisplay
   * @returns {void}
   */
  function updateTimerDisplay() {
    const el = timerDisplay();
    if (!el) return;

    // Step 1: Format phút và giây dạng 2 chữ số 00:00
    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const s = (timerSeconds % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;

    const te = timerEl();
    if (!te) return;

    // Step 2: Xóa các class cảnh báo cũ
    te.classList.remove('warning', 'danger', 'paused');

    // Step 3: Áp dụng màu cảnh báo dựa trên ngưỡng quy định
    if (timerSeconds <= 0) {
      el.textContent = '00:00';
      timerRunning = false;
      te.classList.add('danger');
    } else if (timerSeconds <= TIMER_DANGER_SECONDS) {
      te.classList.add('danger'); // Đỏ: Dưới 1 phút cuối
    } else if (timerSeconds <= TIMER_WARNING_SECONDS) {
      te.classList.add('warning'); // Vàng cam: Dưới 3 phút cuối
    }

    // Step 4: Đánh dấu trạng thái tạm dừng nếu cần
    if (!timerRunning && timerSeconds > 0) {
      te.classList.add('paused');
    }
  }

  /**
   * Bật hoặc tắt trạng thái chạy của đồng hồ đếm ngược.
   * @function toggleTimer
   * @returns {void}
   */
  function toggleTimer() {
    timerRunning = !timerRunning;
    updateTimerDisplay();
  }

  /**
   * Đặt lại đồng hồ đếm ngược về mốc chuẩn 15:00.
   * @function resetTimer
   * @returns {void}
   */
  function resetTimer() {
    timerSeconds = DEFAULT_PRESENTATION_SECONDS;
    timerRunning = true;
    updateTimerDisplay();
  }

  /* ==========================================================================
     PRESENTER NOTES CONTROLLER (PHÍM N)
     ========================================================================== */

  /**
   * Trích xuất thuộc tính data-notes của slide hiện tại và hiển thị lên popup ghi chú.
   * @function updateNotes
   * @returns {void}
   */
  function updateNotes() {
    const pn = presenterNotes();
    if (!pn) return;

    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    const noteData = activeSlide.getAttribute('data-notes');
    if (noteData) {
      pn.innerHTML = noteData
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/(👉|🎯|⚡|💡|📌|✅|•)/g, '<span style="color:#F37021; font-weight:bold; margin-right:6px;">$1</span>');
    } else {
      pn.innerHTML = '';
    }
    pn.classList.toggle('visible', notesVisible && !!noteData);
  }

  /**
   * Bật/tắt thanh ghi chú thuyết trình (Presenter Notes).
   * @function toggleNotes
   * @returns {void}
   */
  function toggleNotes() {
    notesVisible = !notesVisible;
    updateNotes();
  }

  /* ==========================================================================
     SHORTCUTS MODAL CONTROLLER
     ========================================================================== */

  /**
   * Bật/tắt bảng trợ giúp phím tắt điều khiển.
   * @function toggleShortcuts
   * @returns {void}
   */
  function toggleShortcuts() {
    shortcutsVisible = !shortcutsVisible;
    const sh = shortcutsHelp();
    if (sh) sh.classList.toggle('visible', shortcutsVisible);
  }

  /* ==========================================================================
     VIDEO SOURCE SWITCHING & PICKER
     ========================================================================== */

  /**
   * Chuyển đổi nguồn phát video giữa Google Drive Cloud và File Cục Bộ (Offline).
   * @function switchVideoSource
   * @param {string} mode - Chế độ phát ('drive' hoặc 'local')
   * @returns {void}
   */
  function switchVideoSource(mode) {
    currentVideoMode = mode;
    const tabDrive = document.getElementById('tabDrive');
    const tabLocal = document.getElementById('tabLocal');
    const driveWrapper = document.getElementById('drivePlayerWrapper');
    const localWrapper = document.getElementById('localPlayerWrapper');
    const localPicker = document.getElementById('localPickerWrapper');
    const statusHint = document.getElementById('videoStatusHint');
    const video = document.getElementById('demoVideo');

    if (mode === 'drive') {
      if (tabDrive) tabDrive.classList.add('active');
      if (tabLocal) tabLocal.classList.remove('active');
      if (driveWrapper) driveWrapper.classList.add('active');
      if (localWrapper) localWrapper.classList.remove('active');
      if (localPicker) localPicker.style.display = 'none';
      if (statusHint) statusHint.innerHTML = '💡 Đang phát trực tuyến <strong>Google Drive Cloud</strong> • Bấm biểu tượng phóng to góc phải video để xem Fullscreen HD';
      if (video && !video.paused) video.pause();
    } else {
      if (tabDrive) tabDrive.classList.remove('active');
      if (tabLocal) tabLocal.classList.add('active');
      if (driveWrapper) driveWrapper.classList.remove('active');
      if (localWrapper) localWrapper.classList.add('active');
      if (localPicker) localPicker.style.display = 'flex';
      if (statusHint) statusHint.innerHTML = '💻 Đang phát từ <strong>File Cục Bộ (Offline)</strong> • Bấm phím <kbd>V</kbd> hoặc click màn hình để Play / Pause';
    }
  }

  /**
   * Thiết lập bộ lắng nghe cho input file video cục bộ.
   * @function setupVideoPicker
   * @returns {void}
   */
  function setupVideoPicker() {
    const picker = document.getElementById('videoPicker');
    const video = document.getElementById('demoVideo');
    if (!picker || !video) return;

    // Tự động kiểm tra môi trường chạy online hay local
    const isOnline = window.location.hostname.includes('github.io') || window.location.protocol === 'https:';
    if (isOnline) {
      switchVideoSource('drive');
    } else {
      video.addEventListener('error', () => {
        console.warn('[Slides] Local video failed to load, falling back to Google Drive stream.');
        switchVideoSource('drive');
      }, { once: true });
    }

    picker.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      video.src = url;
      video.load();
      switchVideoSource('local');
      const label = document.querySelector('.video-filename');
      if (label) label.textContent = file.name;
    });
  }

  /* ==========================================================================
     FULLSCREEN & RESPONSIVE SCALING (16:9 VIEWPORT)
     ========================================================================== */

  /**
   * Bật hoặc tắt chế độ toàn màn hình (Fullscreen) của trình duyệt.
   * @function toggleFullscreen
   * @returns {void}
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  /**
   * Co giãn canvas 1920x1080 theo kích thước viewport hiện tại để luôn giữ tỷ lệ 16:9.
   * @function updateScale
   * @returns {void}
   */
  function updateScale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / SLIDE_BASE_WIDTH, vh / SLIDE_BASE_HEIGHT);
    const offsetX = (vw - SLIDE_BASE_WIDTH * scale) / 2;
    const offsetY = (vh - SLIDE_BASE_HEIGHT * scale) / 2;

    const allSlides = slides();
    allSlides.forEach(s => {
      s.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });
  }

  /* ==========================================================================
     EVENT HANDLERS (KEYBOARD & CLICK NAVIGATION)
     ========================================================================== */

  /**
   * Điều khiển trình chiếu thông qua các phím tắt bàn phím.
   * @function handleKeydown
   * @param {KeyboardEvent} e - Sự kiện bàn phím
   * @returns {void}
   */
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        showSlide(0);
        break;
      case 'End':
        e.preventDefault();
        showSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 't':
      case 'T':
        e.preventDefault();
        toggleTimer();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        resetTimer();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotes();
        break;
      case 'v':
      case 'V':
        e.preventDefault();
        toggleVideo();
        break;
      case '?':
      case 'h':
      case 'H':
        e.preventDefault();
        toggleShortcuts();
        break;
      case 'Escape':
        if (shortcutsVisible) toggleShortcuts();
        break;
    }
  }

  /**
   * Điều hướng slide khi click chuột vào 30% lề trái (lùi) hoặc 30% lề phải (tiến).
   * @function handleClick
   * @param {MouseEvent} e - Sự kiện chuột
   * @returns {void}
   */
  function handleClick(e) {
    if (e.target.closest('button, a, input, label, video, .timer-controls, #timer, #presenter-notes, #shortcuts-help, .demo-action-btn')) return;

    const x = e.clientX;
    const w = window.innerWidth;
    if (x > w * 0.7) {
      nextSlide();
    } else if (x < w * 0.3) {
      prevSlide();
    }
  }

  /**
   * Bật/tắt phát video demo trên slide.
   * @function toggleVideo
   * @returns {void}
   */
  function toggleVideo() {
    const video = document.getElementById('demoVideo');
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  /* ==========================================================================
     PUBLIC EXPORTS (Gắn vào window để gọi từ inline onclick)
     ========================================================================== */
  window.slideEngine = {
    next: nextSlide,
    prev: prevSlide,
    goTo: showSlide,
    toggleTimer,
    resetTimer,
    toggleNotes,
    toggleFullscreen,
    toggleShortcuts,
    toggleVideo,
    switchVideoSource,
  };

  /* ==========================================================================
     BOOTSTRAP ENTRY POINT
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
