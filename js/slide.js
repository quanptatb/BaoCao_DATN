/* ==========================================================================
   DATN Slide Presentation — Engine
   Features: Navigation, Timer (30min countdown), Presenter Notes,
             Video import, Keyboard shortcuts, Scaling
   ========================================================================== */

(function () {
  'use strict';

  // ---------- State ----------
  let currentSlide = 0;
  let totalSlides = 0;
  let timerRunning = false;
  let timerSeconds = 30 * 60; // 30 minutes
  let timerInterval = null;
  let notesVisible = false;
  let shortcutsVisible = false;

  // ---------- DOM refs ----------
  const slides = () => document.querySelectorAll('.slide');
  const timerEl = () => document.getElementById('timer');
  const timerDisplay = () => document.getElementById('timer-display');
  const progressBar = () => document.getElementById('progress-bar');
  const slideCounter = () => document.getElementById('slide-counter');
  const presenterNotes = () => document.getElementById('presenter-notes');
  const shortcutsHelp = () => document.getElementById('shortcuts-help');

  // ---------- Init ----------
  function init() {
    totalSlides = slides().length;
    showSlide(0);
    updateScale();
    startTimer();

    // Event listeners
    window.addEventListener('resize', updateScale);
    window.addEventListener('keydown', handleKeydown);

    // Click navigation areas
    document.addEventListener('click', handleClick);

    // Video picker
    setupVideoPicker();

    console.log(`[Slides] Initialized ${totalSlides} slides, timer 30:00`);
  }

  // ---------- Slide Navigation ----------
  function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    const allSlides = slides();
    allSlides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    currentSlide = index;

    // Update progress bar
    const pct = ((index + 1) / totalSlides) * 100;
    const pb = progressBar();
    if (pb) pb.style.width = pct + '%';

    // Update counter
    const sc = slideCounter();
    if (sc) sc.textContent = `${index + 1} / ${totalSlides}`;

    // Pause demo video if leaving video slide
    const video = document.getElementById('demoVideo');
    if (video && !allSlides[index].contains(video) && !video.paused) {
      video.pause();
    }

    // Update presenter notes
    updateNotes();
  }

  function nextSlide() { showSlide(currentSlide + 1); }
  function prevSlide() { showSlide(currentSlide - 1); }

  // ---------- Timer ----------
  function startTimer() {
    timerRunning = true;
    timerInterval = setInterval(tickTimer, 1000);
    updateTimerDisplay();
  }

  function tickTimer() {
    if (!timerRunning || timerSeconds <= 0) return;
    timerSeconds--;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const el = timerDisplay();
    if (!el) return;

    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const s = (timerSeconds % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;

    const te = timerEl();
    if (!te) return;

    // Remove old state classes
    te.classList.remove('warning', 'danger', 'paused');

    if (timerSeconds <= 0) {
      el.textContent = '00:00';
      timerRunning = false;
      te.classList.add('danger');
    } else if (timerSeconds <= 60) {
      te.classList.add('danger');
    } else if (timerSeconds <= 300) {
      te.classList.add('warning');
    }

    if (!timerRunning && timerSeconds > 0) {
      te.classList.add('paused');
    }
  }

  function toggleTimer() {
    timerRunning = !timerRunning;
    updateTimerDisplay();
  }

  function resetTimer() {
    timerSeconds = 30 * 60;
    timerRunning = true;
    updateTimerDisplay();
  }

  // ---------- Presenter Notes ----------
  function updateNotes() {
    const pn = presenterNotes();
    if (!pn) return;

    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    const noteData = activeSlide.getAttribute('data-notes');
    pn.textContent = noteData || '';
    pn.classList.toggle('visible', notesVisible && !!noteData);
  }

  function toggleNotes() {
    notesVisible = !notesVisible;
    updateNotes();
  }

  // ---------- Shortcuts Help ----------
  function toggleShortcuts() {
    shortcutsVisible = !shortcutsVisible;
    const sh = shortcutsHelp();
    if (sh) sh.classList.toggle('visible', shortcutsVisible);
  }

  // ---------- Video Source Switching ----------
  let currentVideoMode = 'drive';

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

  // ---------- Video Picker ----------
  function setupVideoPicker() {
    const picker = document.getElementById('videoPicker');
    const video = document.getElementById('demoVideo');
    if (!picker || !video) return;

    // Detect if running on GitHub Pages / Web vs Localhost / File
    const isOnline = window.location.hostname.includes('github.io') || window.location.protocol === 'https:';
    if (isOnline) {
      switchVideoSource('drive');
    } else {
      // If local file:// or localhost, check if local video can load
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
      // Show filename
      const label = document.querySelector('.video-filename');
      if (label) label.textContent = file.name;
    });
  }

  // ---------- Fullscreen ----------
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ---------- Scale slides to fit viewport ----------
  function updateScale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / 1920, vh / 1080);
    const offsetX = (vw - 1920 * scale) / 2;
    const offsetY = (vh - 1080 * scale) / 2;

    const allSlides = slides();
    allSlides.forEach(s => {
      s.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });
  }

  // ---------- Keyboard Handler ----------
  function handleKeydown(e) {
    // Ignore if typing in an input
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

  // ---------- Click Navigation ----------
  function handleClick(e) {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button, a, input, label, video, .timer-controls, #timer, #presenter-notes, #shortcuts-help')) return;

    // Click on right side = next, left side = prev
    const x = e.clientX;
    const w = window.innerWidth;
    if (x > w * 0.7) {
      nextSlide();
    } else if (x < w * 0.3) {
      prevSlide();
    }
  }

  // ---------- Video Toggle ----------
  function toggleVideo() {
    const video = document.getElementById('demoVideo');
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  // ---------- Public API (for inline onclick) ----------
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

  // ---------- Boot ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
