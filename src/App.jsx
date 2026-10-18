import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

// Звуковые эффекты через Web Audio API
const playTone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {
    console.warn('AudioContext not allowed or not supported', e);
  }
};

// Запуск салюта конфетти
const triggerConfetti = (goldOnly = false) => {
  if (typeof confetti !== 'function') return;
  playTone('success');
  if (goldOnly) {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFB21F', '#FFD700', '#FFA500', '#FFE600']
    });
  } else {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#58CC02', '#FFB21F', '#1CB0F6', '#1E2C8A']
    });
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#58CC02', '#FFB21F', '#1E2C8A']
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#58CC02', '#1CB0F6', '#FFB21F']
      });
    }, 180);
  }
};

export default function App() {
  // Навигация верхнего уровня: 'home' (Главная) | 'student' (Ученик) | 'parent' (Родитель)
  const [activeTab, setActiveTab] = useState('home');
  const [subject, setSubject] = useState('math'); // 'math' | 'english'

  // Активный урок в предметах
  const [mathLessonIndex, setMathLessonIndex] = useState(0); // 0: Дроби пицца, 1: Интерактивные весы, 2: Геометрия
  const [englishLessonIndex, setEnglishLessonIndex] = useState(0); // 0: Red Apple, 1: Golden Sun, 2: Blue Ocean

  // Игровой прогресс
  const [streak, setStreak] = useState(5);
  const [coins, setCoins] = useState(120);
  const [studentName, setStudentName] = useState('Сардор');
  const [selectedGrade, setSelectedGrade] = useState(6);
  const [selectedLevel, setSelectedLevel] = useState('medium'); // 'basic' | 'medium' | 'express'
  const [familyCode, setFamilyCode] = useState('ZK-4821');
  const [codeCopied, setCodeCopied] = useState(false);

  // Модальные окна
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCodeGeneratedModal, setShowCodeGeneratedModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showTelegramPush, setShowTelegramPush] = useState(false);
  const [rewardIssued, setRewardIssued] = useState(false);

  // === Интерактив Урок 1 (Математика: Пицца 3/4) ===
  const [selectedSlices, setSelectedSlices] = useState([]);
  const [mathFeedback, setMathFeedback] = useState(null); // 'correct' | 'wrong' | null

  // === Интерактив Урок 2 (Математика: Весы Уравнения x + 3 = 8) ===
  const [scaleX, setScaleX] = useState(0); // значение X, правильное 5
  const [scaleFeedback, setScaleFeedback] = useState(null);

  // === Интерактив Урок 3 (Математика: Геометрия Площадь прямоугольника 4 x 6) ===
  const [geomAnswer, setGeomAnswer] = useState(null);
  const [geomFeedback, setGeomFeedback] = useState(null);

  // === Интерактив Английский (Speaking Lab) ===
  const englishLessons = [
    {
      id: 'apple',
      word: 'Red Apple',
      emoji: '🍎',
      phonetic: '[ rɛd ˈæp.əl ]',
      translation: 'Красное яблоко',
      keywords: ['apple', 'red']
    },
    {
      id: 'sun',
      word: 'Golden Sun',
      emoji: '☀️',
      phonetic: '[ ˈɡoʊl.dən sʌn ]',
      translation: 'Золотое солнце',
      keywords: ['sun', 'golden', 'gold']
    },
    {
      id: 'ocean',
      word: 'Blue Ocean',
      emoji: '🌊',
      phonetic: '[ bluː ˈoʊ.ʃən ]',
      translation: 'Синий океан',
      keywords: ['ocean', 'blue']
    }
  ];

  const currentEnglish = englishLessons[englishLessonIndex];
  const [speechStatus, setSpeechStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'error'
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState('');
  const recognitionRef = useRef(null);

  // Озвучивание слова (SpeechSynthesis)
  const speakWord = (text = currentEnglish.word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ХАКАТОН ЧИТ-КОД: Пробел (Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        console.log('⚡ ХАКАТОН-ЧИТКОД АКТИВИРОВАН!');
        
        if (activeTab === 'student') {
          if (subject === 'math') {
            if (mathLessonIndex === 0) {
              setSelectedSlices([0, 1, 2]);
              setMathFeedback('correct');
              setCoins(prev => prev + 20);
              triggerConfetti();
            } else if (mathLessonIndex === 1) {
              setScaleX(5);
              setScaleFeedback('correct');
              setCoins(prev => prev + 20);
              triggerConfetti();
            } else if (mathLessonIndex === 2) {
              setGeomAnswer(24);
              setGeomFeedback('correct');
              setCoins(prev => prev + 20);
              triggerConfetti();
            }
          } else if (subject === 'english') {
            setSpeechStatus('success');
            setSpeechTranscript(`${currentEnglish.word} (100% точно)`);
            setSpeakingFeedback('🎉 Идеально произнесено! Чистый звук!');
            setCoins(prev => prev + 20);
            triggerConfetti();
            speakWord(`Awesome! ${currentEnglish.word}!`);
          }
        } else if (activeTab === 'parent') {
          setRewardIssued(true);
          triggerConfetti(true);
        } else {
          triggerConfetti();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, subject, mathLessonIndex, englishLessonIndex, currentEnglish]);

  // Микрофон SpeechRecognition
  const startListening = () => {
    playTone('pop');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API не поддерживается вашим браузером. Нажмите ПРОБЕЛ для демонстрации чит-кода!');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setSpeechStatus('listening');
      setSpeechTranscript(`Слушаю... Скажите "${currentEnglish.word}"`);

      recognition.onresult = (event) => {
        const rawText = event.results[0][0].transcript;
        const cleaned = rawText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
        setSpeechTranscript(`Распознано: "${rawText}"`);

        const isMatch = currentEnglish.keywords.some(kw => cleaned.includes(kw));

        if (isMatch) {
          setSpeechStatus('success');
          setSpeakingFeedback('🔥 Отлично! Произношение распознано на 100%!');
          setCoins(prev => prev + 20);
          triggerConfetti();
          speakWord('Awesome! Excellent!');
        } else {
          setSpeechStatus('error');
          setSpeakingFeedback(`Почти получилось! Попробуй еще раз четко: "${currentEnglish.word}"`);
          playTone('error');
        }
      };

      recognition.onerror = () => {
        setSpeechStatus('error');
        setSpeechTranscript('Не удалось распознать звук из-за шума. Подсказка: нажми Пробел!');
      };

      recognition.onend = () => {
        if (speechStatus === 'listening') {
          setSpeechStatus('idle');
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechStatus('idle');
    }
  };

  // Выбор кусков пиццы
  const toggleSlice = (index) => {
    playTone('pop');
    setMathFeedback(null);
    if (selectedSlices.includes(index)) {
      setSelectedSlices(selectedSlices.filter(i => i !== index));
    } else {
      setSelectedSlices([...selectedSlices, index]);
    }
  };

  // Проверка задания 3/4
  const checkPizza = () => {
    if (selectedSlices.length === 3) {
      setMathFeedback('correct');
      setCoins(prev => prev + 20);
      triggerConfetti();
    } else {
      setMathFeedback('wrong');
      playTone('error');
    }
  };

  // Проверка весов
  const checkScale = () => {
    if (scaleX === 5) {
      setScaleFeedback('correct');
      setCoins(prev => prev + 20);
      triggerConfetti();
    } else {
      setScaleFeedback('wrong');
      playTone('error');
    }
  };

  // Проверка геометрии
  const checkGeom = (val) => {
    setGeomAnswer(val);
    if (val === 24) {
      setGeomFeedback('correct');
      setCoins(prev => prev + 20);
      triggerConfetti();
    } else {
      setGeomFeedback('wrong');
      playTone('error');
    }
  };

  // Копирование кода
  const copyFamilyCode = () => {
    navigator.clipboard?.writeText(familyCode);
    setCodeCopied(true);
    playTone('pop');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Окончание онбординга
  const handleFinishOnboarding = (chosenRole) => {
    const randomCode = 'ZK-' + Math.floor(1000 + Math.random() * 9000);
    setFamilyCode(randomCode);
    setShowOnboarding(false);
    setActiveTab(chosenRole);
    setShowCodeGeneratedModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-[#1E2C8A]">
      
      {/* ==================== 1. ШАПКА САЙТА (HEADER) ==================== */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm px-4 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Логотип */}
          <div 
            onClick={() => { playTone('pop'); setActiveTab('home'); }}
            className="flex items-center gap-3 cursor-pointer group"
            title="На главную ZukkoLearn"
          >
            <div className="w-11 h-11 bg-[#1E2C8A] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_5px_0_#152066] group-hover:scale-105 transition transform">
              <span className="text-[#FFB21F]">Z</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#1E2C8A]">
                  Zukko<span className="text-[#FFB21F]">Learn</span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#BDEBCB] text-[#1E2C8A] border border-emerald-300">
                  EdTech
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>{selectedGrade}-класс</span>
                <span>•</span>
                <span className="text-[#1E2C8A]">
                  {selectedLevel === 'basic' ? 'Базовый' : selectedLevel === 'medium' ? 'Средний' : 'Продвинутый'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowLevelModal(true); }} 
                  className="text-slate-400 hover:text-[#1E2C8A] ml-1 transition"
                  title="Настройки класса и уровня"
                >
                  <i className="fa-solid fa-gear"></i>
                </button>
              </div>
            </div>
          </div>

          {/* НАВИГАЦИОННОЕ МЕНЮ С КНОПКОЙ HOME 🏠 */}
          <nav className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => { playTone('pop'); setActiveTab('home'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'home'
                  ? 'bg-[#1E2C8A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#1E2C8A]'
              }`}
            >
              <span>🏠</span> 
              <span>Главная</span>
            </button>

            <button
              onClick={() => { playTone('pop'); setActiveTab('student'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'student'
                  ? 'bg-[#1E2C8A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#1E2C8A]'
              }`}
            >
              <span>👦</span> 
              <span>Ученик</span>
            </button>

            <button
              onClick={() => { playTone('pop'); setActiveTab('parent'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'parent'
                  ? 'bg-[#1E2C8A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#1E2C8A]'
              }`}
            >
              <span>👨‍👩‍👦</span> 
              <span>Родитель</span>
            </button>

            {/* Кнопка Каталог Уроков (5-9 классы) */}
            <button
              onClick={() => { playTone('pop'); setActiveTab('catalog'); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-[#1E2C8A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#1E2C8A]'
              }`}
            >
              <span>📚</span> 
              <span>Каталог 5–9</span>
            </button>
          </nav>

          {/* Счетчики */}
          <div className="flex items-center gap-2.5">
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-sm"
              title="Ударный режим: 5 дней подряд!"
            >
              <span className="text-base animate-bounce">🔥</span>
              <span>{streak}</span>
            </div>

            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-[#1E2C8A] font-extrabold text-sm"
              title="Твои кристаллы"
            >
              <span className="text-base">💎</span>
              <span>{coins}</span>
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="btn-3d btn-3d-yellow px-3 py-1.5 rounded-2xl text-xs font-black hidden sm:flex items-center gap-1.5"
              title="Начать заново или сменить роль"
            >
              <span>🚀</span>
              <span>Вход / Роль</span>
            </button>
          </div>

        </div>
      </header>



      {/* ==================== ОСНОВНОЙ КОНТЕНТ ==================== */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        
        {/* ========================================================
            0. СТРАНИЦА HOME (ГЛАВНАЯ)
        ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-[0_8px_0_rgba(30,44,138,0.12)] text-center relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BDEBCB] text-[#1E2C8A] font-black text-xs border border-emerald-300">
                  <span>🏆</span> EdTech платформа нового поколения для школьников (5–9 классы)
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#1E2C8A] tracking-tight leading-tight">
                  Игровое интерактивное обучение, <br className="hidden sm:inline" />
                  <span className="text-[#FFB21F]">спокойствие</span> для родителей!
                </h1>

                <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed">
                  Интерактивная математика с наглядной визуализацией дробей и уравнений, разговорный английский со встроенным распознаванием речи и персональный дашборд спокойствия без стресса и ссор.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => { playTone('pop'); setActiveTab('student'); }}
                    className="btn-3d btn-3d-yellow px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 shadow-lg"
                  >
                    <span>👦</span>
                    <span>Начать как Ученик</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>

                  <button
                    onClick={() => { playTone('pop'); setActiveTab('parent'); }}
                    className="btn-3d btn-3d-blue px-7 py-4 rounded-2xl font-black text-base flex items-center gap-3 shadow-lg"
                  >
                    <span>👨‍👩‍👦</span>
                    <span>Кабинет Родителя</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Карточки уроков */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div 
                onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); }}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-[#FFB21F] cursor-pointer transition transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#FFB21F] flex items-center justify-center text-3xl font-black mb-4">
                  🍕
                </div>
                <h3 className="font-black text-xl text-[#1E2C8A] mb-2">
                  Визуальная математика
                </h3>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  3 интерактивных модуля: дроби на пицце (3/4), чашечные весы для уравнений (x+3=8) и площадь фигур.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 font-black text-xs text-[#FFB21F] flex items-center gap-1">
                  <span>Доступно 3 урока</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
              </div>

              <div 
                onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); }}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-[#1CB0F6] cursor-pointer transition transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#1CB0F6] flex items-center justify-center text-3xl font-black mb-4">
                  🎙️
                </div>
                <h3 className="font-black text-xl text-[#1E2C8A] mb-2">
                  Speaking Lab
                </h3>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  Тренировка разговорной речи: «Red Apple», «Golden Sun» и «Blue Ocean». Озвучка и проверка микрофоном.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 font-black text-xs text-[#1CB0F6] flex items-center gap-1">
                  <span>Доступно 3 спикинга</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
              </div>

              <div 
                onClick={() => { playTone('pop'); setActiveTab('parent'); }}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:border-[#58CC02] cursor-pointer transition transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black mb-4">
                  🛡️
                </div>
                <h3 className="font-black text-xl text-[#1E2C8A] mb-2">
                  Peace of Mind
                </h3>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  Дашборд спокойствия для родителей. Аналитика сомнений, семейный договор наград и подсказки «Как объяснить без ссор».
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 font-black text-xs text-emerald-600 flex items-center gap-1">
                  <span>Открыть дашборд</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
              </div>

            </div>

            {/* Код связки */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#BDEBCB] flex items-center justify-center text-[#1E2C8A] text-2xl font-black">
                  🔗
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Семейный код связки</div>
                  <div className="text-lg font-black text-[#1E2C8A] flex items-center gap-2">
                    <span>Код: <strong className="text-[#FFB21F] bg-[#1E2C8A] px-2.5 py-0.5 rounded-xl font-mono">{familyCode}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyFamilyCode}
                  className="btn-3d btn-3d-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2"
                >
                  <i className={`fa-solid ${codeCopied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                  <span>{codeCopied ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
                <button
                  onClick={() => setShowTelegramPush(true)}
                  className="btn-3d btn-3d-sky px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2"
                >
                  <i className="fa-brands fa-telegram text-base"></i>
                  <span>Тест Telegram-бота</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            3. КАБИНЕТ УЧЕНИКА
        ======================================================== */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            
            {/* Меню предметов и семейный код */}
            <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  onClick={() => { playTone('pop'); setSubject('math'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${
                    subject === 'math'
                      ? 'bg-[#1E2C8A] text-white shadow-md'
                      : 'text-slate-600 hover:text-[#1E2C8A]'
                  }`}
                >
                  <span>📐</span> Математика (3 урока)
                </button>
                <button
                  onClick={() => { playTone('pop'); setSubject('english'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${
                    subject === 'english'
                      ? 'bg-[#1E2C8A] text-white shadow-md'
                      : 'text-slate-600 hover:text-[#1E2C8A]'
                  }`}
                >
                  <span>🇬🇧</span> English (3 урока)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Код:</span>
                <span className="text-sm font-mono font-black text-[#FFB21F] bg-[#1E2C8A] px-2.5 py-1 rounded-xl">
                  {familyCode}
                </span>
                <button
                  onClick={copyFamilyCode}
                  className="btn-3d btn-3d-white p-2 rounded-xl text-xs font-black"
                  title="Скопировать код"
                >
                  <i className={`fa-solid ${codeCopied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>

            {/* ==================== ТРЕК: МАТЕМАТИКА ==================== */}
            {subject === 'math' && (
              <div className="space-y-6">
                
                {/* Игровая вертикальная дорожка в стиле Duolingo в фирменных цветах Zukko */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-black uppercase text-[#FFB21F] bg-[#1E2C8A] px-2.5 py-1 rounded-full">
                        Игровая дорожка • {selectedGrade} класс
                      </span>
                      <h3 className="text-xl font-black text-[#1E2C8A] mt-1">
                        Твой образовательный квест
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      Кликай на кружки для перехода в урок
                    </span>
                  </div>

                  {/* Вертикальная змейка с кружками и сундуком */}
                  <div className="relative max-w-sm mx-auto flex flex-col items-center gap-7 py-4">
                    
                    {/* SVG пунктирная линия пути */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '380px' }}>
                      <path 
                        d="M 230 40 Q 200 90, 150 140 T 80 230 T 150 310" 
                        fill="none" 
                        stroke="#CBD5E1" 
                        strokeWidth="8" 
                        strokeDasharray="10 10" 
                        strokeLinecap="round" 
                      />
                    </svg>

                    {/* Уровень 1: Пройден (Зеленый круг с галочкой) */}
                    <div className="w-full flex justify-end pr-10 z-10">
                      <div 
                        onClick={() => { playTone('pop'); setMathLessonIndex(0); }}
                        className={`relative group cursor-pointer flex flex-col items-center ${
                          mathLessonIndex === 0 ? 'scale-110' : ''
                        }`}
                      >
                        {mathLessonIndex === 0 && (
                          <span className="absolute -top-7 bg-[#FFB21F] text-[#1E2C8A] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                            СЕЙЧАС ТУТ
                          </span>
                        )}
                        <button className="w-16 h-16 rounded-full bg-[#58CC02] border-4 border-[#46A302] shadow-[0_6px_0_#388E00] flex items-center justify-center text-white text-2xl font-black transform active:translate-y-1 transition">
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <span className="text-xs font-black text-[#1E2C8A] mt-1">1. Дроби 3/4</span>
                      </div>
                    </div>

                    {/* Уровень 2: Урок / Книга (Синий круг с книгой #1E2C8A) */}
                    <div className="w-full flex justify-end pr-24 z-10">
                      <div 
                        onClick={() => { playTone('pop'); setMathLessonIndex(1); }}
                        className={`relative group cursor-pointer flex flex-col items-center ${
                          mathLessonIndex === 1 ? 'scale-110' : ''
                        }`}
                      >
                        {mathLessonIndex === 1 && (
                          <span className="absolute -top-7 bg-[#FFB21F] text-[#1E2C8A] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                            СЕЙЧАС ТУТ
                          </span>
                        )}
                        <button className="w-16 h-16 rounded-full bg-[#1E2C8A] border-4 border-[#121A52] shadow-[0_6px_0_#0D133D] flex items-center justify-center text-[#FFB21F] text-2xl font-black transform active:translate-y-1 transition">
                          <i className="fa-solid fa-book-open"></i>
                        </button>
                        <span className="text-xs font-black text-[#1E2C8A] mt-1">2. Весы (x+3=8)</span>
                      </div>
                    </div>

                    {/* ЗОЛОТОЙ СУНДУК НАГРАДЫ (Стрик бонус) */}
                    <div className="w-full flex justify-center z-10 my-1">
                      <div 
                        onClick={() => {
                          playTone('success');
                          triggerConfetti(true);
                          setCoins(prev => prev + 50);
                        }}
                        className="p-3 bg-slate-50 border-2 border-amber-300 rounded-3xl shadow-md cursor-pointer hover:scale-105 active:scale-95 transition flex flex-col items-center group"
                        title="Кликни, чтобы забрать сундук с кристаллами!"
                      >
                        <div className="text-4xl filter drop-shadow-md group-hover:rotate-6 transition">
                          🎁
                        </div>
                        <span className="text-[11px] font-black text-amber-700 mt-1 uppercase tracking-wider">
                          Сундук +50 💎
                        </span>
                      </div>
                    </div>

                    {/* Уровень 3: Галочка / Площадь фигур (#58CC02) */}
                    <div className="w-full flex justify-start pl-20 z-10">
                      <div 
                        onClick={() => { playTone('pop'); setMathLessonIndex(2); }}
                        className={`relative group cursor-pointer flex flex-col items-center ${
                          mathLessonIndex === 2 ? 'scale-110' : ''
                        }`}
                      >
                        {mathLessonIndex === 2 && (
                          <span className="absolute -top-7 bg-[#FFB21F] text-[#1E2C8A] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                            СЕЙЧАС ТУТ
                          </span>
                        )}
                        <button className="w-16 h-16 rounded-full bg-[#58CC02] border-4 border-[#46A302] shadow-[0_6px_0_#388E00] flex items-center justify-center text-white text-2xl font-black transform active:translate-y-1 transition">
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <span className="text-xs font-black text-[#1E2C8A] mt-1">3. Площадь S=24</span>
                      </div>
                    </div>

                    {/* Уровень 4: Книга / Английский Спикинг (#1CB0F6) */}
                    <div className="w-full flex justify-start pl-32 z-10">
                      <div 
                        onClick={() => { playTone('pop'); setSubject('english'); }}
                        className="group cursor-pointer flex flex-col items-center"
                      >
                        <button className="w-16 h-16 rounded-full bg-[#1CB0F6] border-4 border-[#1899D6] shadow-[0_6px_0_#1277A8] flex items-center justify-center text-white text-2xl font-black transform active:translate-y-1 transition">
                          <i className="fa-solid fa-headphones"></i>
                        </button>
                        <span className="text-xs font-black text-[#1E2C8A] mt-1">4. Speaking Lab</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* УРОК 1: ДРОБИ И ПИЦЦА */}
                {mathLessonIndex === 0 && (
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                      
                      <div className="inline-block bg-slate-50 border-2 border-slate-200 px-6 py-3 rounded-2xl">
                        <p className="text-base sm:text-lg font-bold text-slate-700">
                          Задание 1: <span className="font-black text-[#1E2C8A] text-xl">Выделите ровно 3/4 части пиццы</span> для друзей.
                        </p>
                      </div>

                      {/* SVG Пицца */}
                      <div className="relative w-72 h-72 mx-auto my-4">
                        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl select-none">
                          <circle cx="150" cy="150" r="142" fill="#E2E8F0" />
                          <circle cx="150" cy="150" r="136" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="4" />
                          
                          {/* 0 */}
                          <g 
                            className={`pizza-slice ${selectedSlices.includes(0) ? 'selected-0' : ''}`}
                            onClick={() => toggleSlice(0)}
                          >
                            <path 
                              d="M 150 150 L 270 150 A 120 120 0 0 1 150 270 Z" 
                              fill={selectedSlices.includes(0) ? "#FFB21F" : "#FDE68A"} 
                              stroke="#D97706" 
                              strokeWidth="4" 
                            />
                            <path d="M 270 150 A 120 120 0 0 1 150 270" fill="none" stroke="#B45309" strokeWidth="12" strokeLinecap="round" />
                            <circle cx="205" cy="185" r="13" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="175" cy="225" r="11" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="210" cy="220" r="7" fill="#16A34A" />
                            <text x="215" y="170" fill="#78350F" fontSize="13" fontWeight="900">1/4</text>
                          </g>

                          {/* 1 */}
                          <g 
                            className={`pizza-slice ${selectedSlices.includes(1) ? 'selected-1' : ''}`}
                            onClick={() => toggleSlice(1)}
                          >
                            <path 
                              d="M 150 150 L 150 270 A 120 120 0 0 1 30 150 Z" 
                              fill={selectedSlices.includes(1) ? "#FFB21F" : "#FDE68A"} 
                              stroke="#D97706" 
                              strokeWidth="4" 
                            />
                            <path d="M 150 270 A 120 120 0 0 1 30 150" fill="none" stroke="#B45309" strokeWidth="12" strokeLinecap="round" />
                            <circle cx="95" cy="185" r="13" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="125" cy="225" r="11" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="85" cy="210" r="7" fill="#16A34A" />
                            <text x="70" y="170" fill="#78350F" fontSize="13" fontWeight="900">2/4</text>
                          </g>

                          {/* 2 */}
                          <g 
                            className={`pizza-slice ${selectedSlices.includes(2) ? 'selected-2' : ''}`}
                            onClick={() => toggleSlice(2)}
                          >
                            <path 
                              d="M 150 150 L 30 150 A 120 120 0 0 1 150 30 Z" 
                              fill={selectedSlices.includes(2) ? "#FFB21F" : "#FDE68A"} 
                              stroke="#D97706" 
                              strokeWidth="4" 
                            />
                            <path d="M 30 150 A 120 120 0 0 1 150 30" fill="none" stroke="#B45309" strokeWidth="12" strokeLinecap="round" />
                            <circle cx="95" cy="115" r="13" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="125" cy="75" r="11" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="75" cy="80" r="7" fill="#16A34A" />
                            <text x="70" y="135" fill="#78350F" fontSize="13" fontWeight="900">3/4</text>
                          </g>

                          {/* 3 */}
                          <g 
                            className={`pizza-slice ${selectedSlices.includes(3) ? 'selected-3' : ''}`}
                            onClick={() => toggleSlice(3)}
                          >
                            <path 
                              d="M 150 150 L 150 30 A 120 120 0 0 1 270 150 Z" 
                              fill={selectedSlices.includes(3) ? "#FFB21F" : "#FDE68A"} 
                              stroke="#D97706" 
                              strokeWidth="4" 
                            />
                            <path d="M 150 30 A 120 120 0 0 1 270 150" fill="none" stroke="#B45309" strokeWidth="12" strokeLinecap="round" />
                            <circle cx="205" cy="115" r="13" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="175" cy="75" r="11" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                            <circle cx="215" cy="85" r="7" fill="#16A34A" />
                            <text x="215" y="135" fill="#78350F" fontSize="13" fontWeight="900">4/4</text>
                          </g>

                          <circle cx="150" cy="150" r="12" fill="#B45309" />
                        </svg>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <span className="text-base font-bold text-slate-500">Выбрано кусков:</span>
                        <span className={`text-2xl font-black px-4 py-1 rounded-2xl border-2 transition ${
                          selectedSlices.length === 3 
                            ? 'bg-[#58CC02]/10 border-[#58CC02] text-[#58CC02]' 
                            : 'bg-slate-100 border-slate-300 text-[#1E2C8A]'
                        }`}>
                          {selectedSlices.length} / 4
                        </span>
                      </div>

                      {mathFeedback === 'correct' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-extrabold flex items-center justify-center gap-3">
                          <span className="text-2xl">🎉</span>
                          <span>Правильно! 3 куска из 4 — это в точности 3/4 пиццы! +20 💎 получено!</span>
                        </div>
                      )}

                      {mathFeedback === 'wrong' && (
                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-700 font-bold flex items-center justify-center gap-3">
                          <span className="text-2xl">🤔</span>
                          <span>Сейчас выбрано {selectedSlices.length}/4. Нужно ровно 3 куска! Кликните на кусок еще раз.</span>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                          onClick={() => { setSelectedSlices([]); setMathFeedback(null); }}
                          className="btn-3d btn-3d-white px-5 py-3 rounded-2xl font-bold text-slate-600 text-sm"
                        >
                          <i className="fa-solid fa-rotate-left mr-2"></i> Сбросить
                        </button>

                        <button
                          onClick={checkPizza}
                          className={`btn-3d px-8 py-3.5 rounded-2xl font-black text-base shadow-lg ${
                            selectedSlices.length === 3 ? 'btn-3d-green' : 'btn-3d-yellow'
                          }`}
                        >
                          <i className="fa-solid fa-check mr-2"></i> Проверить ответ
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* УРОК 2: ИНТЕРАКТИВНЫЕ ВЕСЫ (УРАВНЕНИЯ) */}
                {mathLessonIndex === 1 && (
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                      
                      <div className="inline-block bg-slate-50 border-2 border-slate-200 px-6 py-3 rounded-2xl">
                        <p className="text-base sm:text-lg font-bold text-slate-700">
                          Задание 2: Найди вес неизвестного груза <span className="font-black text-[#1E2C8A] text-xl">X</span>, чтобы уравновесить весы:
                        </p>
                        <div className="text-xl font-black text-[#1E2C8A] font-mono mt-1">
                          [ X ] + 3 кг = 8 кг
                        </div>
                      </div>

                      {/* Визуальные Весы */}
                      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-200">
                        <div className="flex items-end justify-center gap-12 sm:gap-16 h-40 relative">
                          
                          {/* Левая чаша: X + 3 */}
                          <div className={`flex flex-col items-center transition-all duration-300 ${
                            scaleX === 5 ? 'translate-y-0' : scaleX < 5 ? 'translate-y-4' : '-translate-y-4'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-12 h-12 rounded-2xl bg-[#FFB21F] text-[#1E2C8A] font-black text-lg flex items-center justify-center shadow-md">
                                {scaleX > 0 ? `${scaleX} кг` : 'X'}
                              </span>
                              <span className="w-9 h-9 rounded-xl bg-slate-300 text-slate-800 font-black text-sm flex items-center justify-center shadow">
                                3 кг
                              </span>
                            </div>
                            <div className="w-32 h-3 bg-amber-700 rounded-full"></div>
                            <div className="text-xs font-bold text-slate-500 mt-1">Левая чаша: {scaleX + 3} кг</div>
                          </div>

                          {/* Центральная стойка весов */}
                          <div className="w-4 h-32 bg-[#1E2C8A] rounded-t-lg relative flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-[#FFB21F] absolute -top-4 border-2 border-[#1E2C8A]"></div>
                          </div>

                          {/* Правая чаша: 8 кг */}
                          <div className={`flex flex-col items-center transition-all duration-300 ${
                            scaleX === 5 ? 'translate-y-0' : scaleX < 5 ? '-translate-y-4' : 'translate-y-4'
                          }`}>
                            <div className="flex items-center gap-1 mb-2">
                              <span className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                                8 кг
                              </span>
                            </div>
                            <div className="w-32 h-3 bg-amber-700 rounded-full"></div>
                            <div className="text-xs font-bold text-slate-500 mt-1">Правая чаша: 8 кг</div>
                          </div>

                        </div>
                      </div>

                      {/* Выбор значения X */}
                      <div>
                        <div className="text-xs font-black uppercase text-slate-400 mb-2">
                          Выбери гирю для X:
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          {[3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              onClick={() => { playTone('pop'); setScaleX(num); setScaleFeedback(null); }}
                              className={`btn-3d w-14 h-14 rounded-2xl font-black text-lg ${
                                scaleX === num
                                  ? 'btn-3d-yellow ring-4 ring-amber-300'
                                  : 'btn-3d-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Фидбек */}
                      {scaleFeedback === 'correct' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-extrabold flex items-center justify-center gap-3">
                          <span className="text-2xl">⚖️</span>
                          <span>Идеальный баланс! 5 + 3 = 8 кг. Весы уравновешены! +20 💎 получено!</span>
                        </div>
                      )}

                      {scaleFeedback === 'wrong' && (
                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-700 font-bold flex items-center justify-center gap-3">
                          <span className="text-2xl">⚖️</span>
                          <span>Весы перевесили! При X = {scaleX} кг на левой чаше {scaleX + 3} кг, а на правой 8 кг. Подумай еще!</span>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <button
                          onClick={checkScale}
                          className="btn-3d btn-3d-green px-8 py-3.5 rounded-2xl font-black text-base shadow-lg"
                        >
                          <i className="fa-solid fa-check mr-2"></i> Проверить равновесие
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* УРОК 3: ГЕОМЕТРИЯ (ПЛОЩАДЬ) */}
                {mathLessonIndex === 2 && (
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                      
                      <div className="inline-block bg-slate-50 border-2 border-slate-200 px-6 py-3 rounded-2xl">
                        <p className="text-base sm:text-lg font-bold text-slate-700">
                          Задание 3: Найди площадь прямоугольного футбольного поля со сторонами <span className="font-black text-[#1E2C8A] text-xl">4 м</span> и <span className="font-black text-[#1E2C8A] text-xl">6 м</span>:
                        </p>
                      </div>

                      {/* Интерактивный прямоугольник с сеткой */}
                      <div className="p-8 bg-slate-50 rounded-3xl border-2 border-slate-200 flex flex-col items-center justify-center">
                        <div className="relative">
                          {/* Верхняя сторона */}
                          <div className="text-xs font-black text-slate-500 mb-1">Длина = 6 м</div>
                          
                          <div className="w-56 h-36 bg-[#BDEBCB] border-4 border-emerald-500 rounded-2xl flex items-center justify-center relative shadow-inner">
                            {/* Сетка клеток */}
                            <div className="grid grid-cols-6 grid-rows-4 w-full h-full p-1 gap-1 opacity-40">
                              {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="border border-emerald-700 rounded-xs"></div>
                              ))}
                            </div>
                            <span className="absolute font-black text-xl text-emerald-950">S = ?</span>
                          </div>

                          {/* Правая сторона */}
                          <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                            Ширина<br />4 м
                          </div>
                        </div>
                      </div>

                      {/* Варианты ответов */}
                      <div>
                        <div className="text-xs font-black uppercase text-slate-400 mb-2">
                          Выбери правильную площадь (S = a × b):
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                          {[20, 24, 28, 10].map((ans) => (
                            <button
                              key={ans}
                              onClick={() => { playTone('pop'); checkGeom(ans); }}
                              className={`btn-3d py-3 rounded-2xl font-black text-lg ${
                                geomAnswer === ans
                                  ? ans === 24 ? 'btn-3d-green' : 'bg-rose-500 text-white'
                                  : 'btn-3d-white'
                              }`}
                            >
                              {ans} м²
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Фидбек */}
                      {geomFeedback === 'correct' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-extrabold flex items-center justify-center gap-3">
                          <span className="text-2xl">📐</span>
                          <span>Браво! 4 м × 6 м = 24 м²! Ровно 24 квадрата в сетке! +20 💎 получено!</span>
                        </div>
                      )}

                      {geomFeedback === 'wrong' && (
                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-700 font-bold flex items-center justify-center gap-3">
                          <span className="text-2xl">🤔</span>
                          <span>Не совсем. Формула площади прямоугольника: S = длина × ширина. Попробуй умножить 4 на 6!</span>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ==================== ТРЕК: ENGLISH ==================== */}
            {subject === 'english' && (
              <div className="space-y-6">
                
                {/* Дорожка переключения уроков английского */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-base sm:text-lg text-[#1E2C8A] flex items-center gap-2">
                      <span>🎙️</span> Выбери карточку для спикинга:
                    </h3>
                    <span className="text-xs font-black text-[#1CB0F6] bg-sky-100 px-2.5 py-1 rounded-full border border-sky-300">
                      Слово {englishLessonIndex + 1} из 3
                    </span>
                  </div>

                  <div className="flex items-center justify-around max-w-xl mx-auto py-2">
                    {englishLessons.map((item, idx) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          playTone('pop');
                          setEnglishLessonIndex(idx);
                          setSpeechStatus('idle');
                          setSpeechTranscript('');
                          setSpeakingFeedback('');
                        }}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${
                          englishLessonIndex === idx 
                            ? 'bg-[#1CB0F6] text-white shadow-[0_5px_0_#1899D6] ring-4 ring-sky-200 scale-105' 
                            : 'bg-slate-100 text-slate-600 shadow-sm hover:scale-105'
                        }`}>
                          {item.emoji}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item.word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Карточка спикинга */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
                  <div className="max-w-xl mx-auto text-center space-y-6">
                    
                    <div className="text-slate-500 font-bold text-sm">
                      Послушай произношение и повтори фразу в микрофон:
                    </div>

                    <div className="p-8 rounded-3xl bg-amber-50/50 border-2 border-amber-200 flex flex-col items-center justify-center gap-3">
                      <div className="text-7xl sm:text-8xl select-none transform hover:scale-110 transition duration-200">
                        {currentEnglish.emoji}
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#1E2C8A] tracking-wide">
                          {currentEnglish.word}
                        </h2>
                        <p className="text-slate-500 font-mono text-sm">{currentEnglish.phonetic} — {currentEnglish.translation}</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => { playTone('pop'); speakWord(currentEnglish.word); }}
                        className="btn-3d btn-3d-white px-6 py-3 rounded-2xl font-black text-[#1E2C8A] flex items-center gap-3 text-base"
                      >
                        <span className="text-xl">🔊</span>
                        <span>Прослушать образец</span>
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col items-center gap-3">
                      <button
                        onClick={startListening}
                        className={`btn-3d w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${
                          speechStatus === 'listening'
                            ? 'bg-rose-500 text-white mic-recording'
                            : speechStatus === 'success'
                            ? 'bg-[#58CC02] text-white shadow-[0_5px_0_#46A302]'
                            : 'bg-[#1E2C8A] text-white shadow-[0_5px_0_#121A52] hover:brightness-110'
                        }`}
                        title="Нажми и говори"
                      >
                        <i className={`fa-solid ${
                          speechStatus === 'listening' ? 'fa-microphone-lines' : 
                          speechStatus === 'success' ? 'fa-check' : 'fa-microphone'
                        }`}></i>
                      </button>

                      <div className="text-sm font-bold text-slate-500">
                        {speechStatus === 'listening' ? (
                          <span className="text-rose-500 font-black animate-pulse">
                            🔴 Говорите сейчас...
                          </span>
                        ) : (
                          <span>Нажми на микрофон и скажи <strong className="text-[#1E2C8A]">"{currentEnglish.word}"</strong></span>
                        )}
                      </div>
                    </div>

                    {speechTranscript && (
                      <div className="p-3 bg-slate-100 rounded-2xl text-xs font-mono text-slate-700">
                        {speechTranscript}
                      </div>
                    )}

                    {speakingFeedback && (
                      <div className={`p-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 ${
                        speechStatus === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400'
                          : 'bg-amber-50 text-amber-800 border-2 border-amber-300'
                      }`}>
                        <span>{speakingFeedback}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                      Шумно в зале? Нажмите клавишу <kbd className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold font-mono">Space</kbd> для моментального зачета.
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================
            4. КАБИНЕТ РОДИТЕЛЯ (PEACE OF MIND DASHBOARD)
        ======================================================== */}
        {activeTab === 'parent' && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Peace of Mind Dashboard
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1E2C8A] mt-1">
                  Кабинет Родителя: {studentName}
                </h1>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-600">
                <i className="fa-brands fa-telegram text-sky-500 text-base"></i>
                <span>Привязан: <strong className="text-[#1E2C8A]">@parent_alisher</strong></span>
                <span className="text-emerald-500">✅</span>
              </div>
            </div>

            {/* Зеленый щит */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm flex flex-wrap items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-[0_5px_0_#059669] shrink-0">
                🛡️
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-emerald-950">
                    {studentName} сегодня: 24 минуты полезного фокуса, стресса нет
                  </h2>
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-sm font-semibold text-emerald-800 mt-1">
                  Пройдено 3 интерактивных микро-урока математики и модуль Speaking Lab. Начислено +60 XP. Стрик сохранен!
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 block uppercase tracking-wider">Индекс стресса</span>
                <span className="text-2xl font-black text-emerald-600">0% • Спокойно</span>
              </div>
            </div>

            {/* Аналитика */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                    ⚠️
                  </div>
                  <h3 className="text-lg font-black text-[#1E2C8A]">
                    Где возникли сложности
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  В задании с уравнениями на весах ребенок сначала примерил груз 4 кг, заметил перекос чаши и сам переставил на 5 кг. Ошибки — часть процесса!
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Самостоятельная коррекция</span>
                  <span className="text-emerald-600">Решено успешно ✓</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-[0_8px_0_rgba(30,44,138,0.12)] bg-emerald-50/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#BDEBCB] text-emerald-800 flex items-center justify-center text-xl font-bold">
                    💡
                  </div>
                  <h3 className="text-lg font-black text-emerald-950">
                    Совет родителю: Не ругайте!
                  </h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                  Похвалите ребенка за старания! Спросите за ужином: «Как бы ты разделил пиццу на 4 части?» и дайте ребенку почувствовать себя экспертом.
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Рекомендация педагогов Zukko</span>
                  <span>Без криков и ссор ✨</span>
                </div>
              </div>

            </div>

            {/* Договор */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#FFB21F]/20 border-2 border-[#FFB21F] text-[#E09B15] flex items-center justify-center text-3xl font-black">
                    🍕
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#E09B15]">
                      Семейный договор (Reward Contract)
                    </span>
                    <h3 className="text-xl font-black text-[#1E2C8A] mt-0.5">
                      Цель недели: 5 дней подряд 🔥 ➔ Награда: Поход в пиццерию
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">
                      Прогресс стрика: <strong className="text-[#58CC02]">5 из 5 дней выполнено! (100%)</strong>
                    </p>
                  </div>
                </div>

                <div>
                  {rewardIssued ? (
                    <div className="px-6 py-3 rounded-2xl bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-black text-sm flex items-center gap-2">
                      <span>🎉 Награда выдана! Приятного аппетита!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setRewardIssued(true);
                        triggerConfetti(true);
                      }}
                      className="btn-3d btn-3d-yellow px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2"
                    >
                      <span>Выдать награду 🎉</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setShowTelegramPush(true)}
                className="btn-3d btn-3d-white px-6 py-3 rounded-2xl text-xs font-black inline-flex items-center gap-2 text-[#1E2C8A]"
              >
                <i className="fa-brands fa-telegram text-sky-500 text-base"></i>
                <span>Посмотреть, как этот отчет отправляется родителям в Telegram</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================
            5. КАТАЛОГ УРОКОВ (5–9 КЛАССЫ С ВЫБОРОМ ЛЮБОГО УРОКА)
        ======================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Шапка каталога */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-[0_8px_0_rgba(30,44,138,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#FFB21F] bg-[#1E2C8A] px-3 py-1 rounded-full">
                    Каталог EdTech • 10+ Уроков
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1E2C8A] mt-1">
                    📚 Выберите тему и перейдите в урок
                  </h1>
                  <p className="text-slate-600 font-semibold text-sm mt-1">
                    Программы обучения разделены по классам с 5 по 9. Кликните по любому уроку для мгновенного запуска!
                  </p>
                </div>

                {/* Фильтр по классам 5-9 */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  {[5, 6, 7, 8, 9].map((g) => (
                    <button
                      key={g}
                      onClick={() => { playTone('pop'); setSelectedGrade(g); }}
                      className={`w-10 h-10 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        selectedGrade === g
                          ? 'bg-[#1E2C8A] text-white shadow-md'
                          : 'text-slate-600 hover:text-[#1E2C8A]'
                      }`}
                    >
                      {g} кл
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Сетка уроков, строго соответствующих выбранному классу */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-[#1E2C8A] flex items-center gap-2">
                  <span>⚡</span> Уроки для {selectedGrade} класса:
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Нажмите на карточку, чтобы открыть интерактивное задание
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* === 5 КЛАСС === */}
                {selectedGrade === 5 && (
                  <>
                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(0); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#FFB21F] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🍕</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg">5 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Дроби и части целого (3/4 пиццы)</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Интерактивная пицца: визуализация обыкновенных дробей.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#FFB21F]">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); setEnglishLessonIndex(0); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1CB0F6] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🍎</span>
                        <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg">5 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Speaking Lab: Red Apple</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Первые слова, эталонный голос и проверка произношения.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#1CB0F6]">
                        <span>Тренировать спикинг</span>
                        <i className="fa-solid fa-microphone text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-emerald-500 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">📏</span>
                        <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg">5 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Периметр и площадь прямоугольника</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Основы измерений сторон на наглядной координатной сетке.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-600">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>
                  </>
                )}

                {/* === 6 КЛАСС === */}
                {selectedGrade === 6 && (
                  <>
                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1E2C8A] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">⚖️</span>
                        <span className="text-xs font-black bg-blue-100 text-[#1E2C8A] px-2.5 py-0.5 rounded-lg">6 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Уравнения на чашечных весах</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Физический баланс: [ X ] + 3 кг = 8 кг. Поиск неизвестного X.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#1E2C8A]">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); setEnglishLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#FFB21F] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">☀️</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg">6 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Speaking Lab: Golden Sun</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Погода и окружающий мир: тренировка разговорной речи.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#FFB21F]">
                        <span>Тренировать спикинг</span>
                        <i className="fa-solid fa-microphone text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(0); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-amber-400 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🏷️</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg">6 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Проценты и скидки в магазине</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Скидка 25% — это ровно 1/4 пиццы. Бытовая математика.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-amber-600">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>
                  </>
                )}

                {/* === 7 КЛАСС === */}
                {selectedGrade === 7 && (
                  <>
                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1E2C8A] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">📐</span>
                        <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-lg">7 класс • +25 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Смежные углы и треугольники</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Сумма углов треугольника (180°) и доказательства на фигурах.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-indigo-600">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); setEnglishLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1CB0F6] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🌊</span>
                        <span className="text-xs font-black bg-sky-100 text-[#1CB0F6] px-2.5 py-0.5 rounded-lg">7 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Speaking Lab: Blue Ocean</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Океаны планеты, длинные гласные звуки и беглая речь.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#1CB0F6]">
                        <span>Тренировать спикинг</span>
                        <i className="fa-solid fa-microphone text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1E2C8A] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🎯</span>
                        <span className="text-xs font-black bg-blue-100 text-[#1E2C8A] px-2.5 py-0.5 rounded-lg">7 класс • +20 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Координаты на плоскости (X, Y)</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Построение точек и графиков линейных функций y = kx + b.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#1E2C8A]">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>
                  </>
                )}

                {/* === 8 КЛАСС === */}
                {selectedGrade === 8 && (
                  <>
                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-purple-500 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">📐</span>
                        <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">8 класс • +25 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Теорема Пифагора (a² + b² = c²)</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Египетский треугольник 3-4-5 и нахождение гипотенузы.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-purple-600">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#1E2C8A] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🧮</span>
                        <span className="text-xs font-black bg-blue-100 text-[#1E2C8A] px-2.5 py-0.5 rounded-lg">8 класс • +25 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Квадратные уравнения и D</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Поиск корней через формулу дискриминанта D = b² - 4ac.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#1E2C8A]">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); setEnglishLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-amber-500 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🚀</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg">8 класс • +25 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Speaking: Space & Deep Galaxy</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Космические исследования, планеты и научные дискуссии.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-amber-600">
                        <span>Тренировать спикинг</span>
                        <i className="fa-solid fa-microphone text-[10px]"></i>
                      </div>
                    </div>
                  </>
                )}

                {/* === 9 КЛАСС === */}
                {selectedGrade === 9 && (
                  <>
                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(1); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-emerald-500 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">📈</span>
                        <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg">9 класс • +30 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Функции, параболы и прогрессии</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Вершина параболы, арифметическая прогрессия и подготовка к ОГЭ.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-600">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('english'); setEnglishLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-purple-500 cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🤖</span>
                        <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">9 класс • +30 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Speaking: AI & Future Technology</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Презентации, собеседование и беглый академический английский.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-purple-600">
                        <span>Тренировать спикинг</span>
                        <i className="fa-solid fa-microphone text-[10px]"></i>
                      </div>
                    </div>

                    <div 
                      onClick={() => { playTone('pop'); setActiveTab('student'); setSubject('math'); setMathLessonIndex(2); }}
                      className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-[#FFB21F] cursor-pointer transition transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">🎯</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg">9 класс • +30 💎</span>
                      </div>
                      <h4 className="font-black text-lg text-[#1E2C8A]">Экзаменационный экспресс-тест</h4>
                      <p className="text-slate-500 font-semibold text-xs mt-1">Проверка комплексных навыков по геометрии и алгебре.</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#FFB21F]">
                        <span>Запустить интерактив</span>
                        <i className="fa-solid fa-play text-[10px]"></i>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Карточка программы для выбранного класса */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-black text-lg text-[#1E2C8A] mb-4 flex items-center gap-2">
                <span>📋</span> Подробная программа для {selectedGrade} класса:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <h4 className="font-black text-sm text-amber-900 flex items-center gap-2">
                    <span>📐</span> Темы по Математике:
                  </h4>
                  <ul className="text-xs font-semibold text-slate-700 space-y-1.5 list-disc list-inside">
                    {selectedGrade === 5 && (
                      <>
                        <li>Натуральные числа и обыкновенные дроби</li>
                        <li>Периметр и площадь простых фигур</li>
                        <li>Десятичные дроби и округление</li>
                      </>
                    )}
                    {selectedGrade === 6 && (
                      <>
                        <li>Обыкновенные дроби (сложение, вычитание, 3/4)</li>
                        <li>Линейные уравнения с чашечными весами</li>
                        <li>Пропорции, проценты и скидки</li>
                      </>
                    )}
                    {selectedGrade === 7 && (
                      <>
                        <li>Смежные и вертикальные углы в геометрии</li>
                        <li>Формулы сокращенного умножения (a+b)²</li>
                        <li>Линейная функция y = kx + b</li>
                      </>
                    )}
                    {selectedGrade === 8 && (
                      <>
                        <li>Теорема Пифагора для прямоугольного треугольника</li>
                        <li>Квадратные уравнения и вычисление дискриминанта D</li>
                        <li>Площадь параллелограмма, ромба и трапеции</li>
                      </>
                    )}
                    {selectedGrade === 9 && (
                      <>
                        <li>Квадратичная функция и построение параболы</li>
                        <li>Арифметическая и геометрическая прогрессии</li>
                        <li>Подготовка к вступительным экзаменам ОГЭ / ДТМ</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                  <h4 className="font-black text-sm text-sky-900 flex items-center gap-2">
                    <span>🇬🇧</span> Темы по English Speaking Lab:
                  </h4>
                  <ul className="text-xs font-semibold text-slate-700 space-y-1.5 list-disc list-inside">
                    {selectedGrade === 5 && (
                      <>
                        <li>Colors & Fruits (Red Apple)</li>
                        <li>My Family & Daily Routine</li>
                        <li>Numbers, Animals & Greetings</li>
                      </>
                    )}
                    {selectedGrade === 6 && (
                      <>
                        <li>Weather & Nature (Golden Sun)</li>
                        <li>Food, Restaurant & Ordering</li>
                        <li>Giving Directions in the City</li>
                      </>
                    )}
                    {selectedGrade === 7 && (
                      <>
                        <li>Geography & Oceans (Blue Ocean)</li>
                        <li>Hobbies, School Life & Friends</li>
                        <li>Future Simple: My Ambitions</li>
                      </>
                    )}
                    {selectedGrade === 8 && (
                      <>
                        <li>Deep Galaxy & Space Exploration</li>
                        <li>Science, Inventions & Inventions</li>
                        <li>Expressing Opinions & Debates</li>
                      </>
                    )}
                    {selectedGrade === 9 && (
                      <>
                        <li>AI & Future Technology Presentation</li>
                        <li>Career, Job Interview & Soft Skills</li>
                        <li>Advanced Speaking Fluency</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ==================== 2. СТАРТОВЫЙ ОНБОРДИНГ ==================== */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-[#1E2C8A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#1E2C8A] rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-[0_5px_0_#152066]">
                <span className="text-[#FFB21F]">Z</span>
              </div>
              <h2 className="text-2xl font-black text-[#1E2C8A]">
                Добро пожаловать в ZukkoLearn!
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Умная платформа обучения математике и английскому
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab('student')}
                className={`py-2.5 rounded-xl font-black text-sm transition ${
                  activeTab === 'student' ? 'bg-white text-[#1E2C8A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👦 Я Ученик
              </button>
              <button
                onClick={() => setActiveTab('parent')}
                className={`py-2.5 rounded-xl font-black text-sm transition ${
                  activeTab === 'parent' ? 'bg-white text-[#1E2C8A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👨‍👩‍👦 Я Родитель
              </button>
            </div>

            {activeTab === 'student' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Твое имя
                  </label>
                  <input 
                    type="text" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-[#1E2C8A] focus:outline-none focus:border-[#1E2C8A]"
                    placeholder="Например: Сардор"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Твой класс
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 6, 7, 8, 9].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-2 rounded-2xl font-black text-xs sm:text-sm border-2 transition ${
                          selectedGrade === grade
                            ? 'bg-[#1E2C8A] text-white border-[#1E2C8A]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {grade} кл
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Выбор уровня подготовки
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedLevel('basic')}
                      className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition ${
                        selectedLevel === 'basic' ? 'border-[#58CC02] bg-emerald-50/50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs text-[#1E2C8A]">🟢 Начинающий</div>
                        <div className="text-[11px] font-bold text-slate-500">Учим с азов, подробные подсказки</div>
                      </div>
                      {selectedLevel === 'basic' && <i className="fa-solid fa-check text-[#58CC02]"></i>}
                    </button>

                    <button
                      onClick={() => setSelectedLevel('medium')}
                      className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition ${
                        selectedLevel === 'medium' ? 'border-[#FFB21F] bg-amber-50/50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs text-[#1E2C8A]">🟡 Средний (Рекомендуется)</div>
                        <div className="text-[11px] font-bold text-slate-500">Знаю базу, закрываю пробелы</div>
                      </div>
                      {selectedLevel === 'medium' && <i className="fa-solid fa-check text-amber-500"></i>}
                    </button>

                    <button
                      onClick={() => setSelectedLevel('express')}
                      className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition ${
                        selectedLevel === 'express' ? 'border-[#1CB0F6] bg-blue-50/50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs text-[#1E2C8A]">⚡ Экспресс-тест</div>
                        <div className="text-[11px] font-bold text-slate-500">Определить уровень за 1 минуту</div>
                      </div>
                      {selectedLevel === 'express' && <i className="fa-solid fa-check text-[#1CB0F6]"></i>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Ваш номер телефона (для отчетов)
                  </label>
                  <input 
                    type="text" 
                    defaultValue="+998 90 123-45-67" 
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-[#1E2C8A] focus:outline-none focus:border-[#1E2C8A]"
                  />
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  💡 Вы будете получать короткую сводку раз в день: сколько минут ребенок занимался и практический совет без ссор.
                </div>
              </div>
            )}

            <button
              onClick={() => handleFinishOnboarding(activeTab === 'parent' ? 'parent' : 'student')}
              className="btn-3d btn-3d-green w-full py-3.5 rounded-2xl font-black text-base shadow-lg"
            >
              Поехали 🚀
            </button>

          </div>
        </div>
      )}

      {/* ==================== ОКНО ВЫДАЧИ КОДА ==================== */}
      {showCodeGeneratedModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2C8A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-sm w-full p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#BDEBCB] text-[#1E2C8A] text-3xl font-black flex items-center justify-center mx-auto">
              🎉
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1E2C8A]">
                Профиль настроен!
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Твой персональный семейный код Zukko:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-[#1E2C8A]/40">
              <div className="text-3xl font-black tracking-widest text-[#1E2C8A] font-mono">
                {familyCode}
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-1">
                Передай этот код родителям для Telegram-бота!
              </div>
            </div>

            <button
              onClick={() => {
                setShowCodeGeneratedModal(false);
                triggerConfetti();
              }}
              className="btn-3d btn-3d-yellow w-full py-3 rounded-2xl font-black text-sm"
            >
              Перейти к урокам! 📚
            </button>
          </div>
        </div>
      )}

      {/* ==================== МОДАЛКА УРОВНЕЙ ==================== */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2C8A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-[#1E2C8A]">Настройки обучения</h3>
              <button onClick={() => setShowLevelModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Класс:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 6, 7, 8, 9].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`py-2 rounded-xl font-black text-xs border-2 ${
                      selectedGrade === g ? 'bg-[#1E2C8A] text-white border-[#1E2C8A]' : 'border-slate-200'
                    }`}
                  >
                    {g} кл
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Сложность:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedLevel('basic')}
                  className={`py-2 rounded-xl font-bold text-xs border-2 ${
                    selectedLevel === 'basic' ? 'bg-[#1E2C8A] text-white border-[#1E2C8A]' : 'border-slate-200'
                  }`}
                >
                  Базовый
                </button>
                <button
                  onClick={() => setSelectedLevel('medium')}
                  className={`py-2 rounded-xl font-bold text-xs border-2 ${
                    selectedLevel === 'medium' ? 'bg-[#1E2C8A] text-white border-[#1E2C8A]' : 'border-slate-200'
                  }`}
                >
                  Средний
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLevelModal(false)}
              className="btn-3d btn-3d-blue w-full py-2.5 rounded-xl font-black text-xs mt-2"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* ==================== TELEGRAM PUSH ==================== */}
      {showTelegramPush && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#17212B] text-white rounded-3xl p-5 shadow-2xl border border-slate-700 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white">
                  <i className="fa-brands fa-telegram"></i>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">ZukkoLearn Bot</div>
                  <div className="text-[10px] text-slate-400">сегодня в 11:25</div>
                </div>
              </div>
              <button 
                onClick={() => setShowTelegramPush(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200 font-sans">
              <div className="font-bold text-sm text-sky-400">
                📊 Ежедневный отчет спокойствия для родителей:
              </div>
              <p>
                Здравствуйте, Алишер! Ребенок <strong>{studentName}</strong> (код <span className="text-amber-400 font-mono">{familyCode}</span>) сегодня позанимался:
              </p>
              
              <div className="bg-[#242F3D] p-3 rounded-2xl space-y-1.5 text-[11px]">
                <div>⏱ <strong>24 минуты полезного фокуса</strong> (без стресса)</div>
                <div>📐 <strong>Математика:</strong> Дроби 3/4, Весы x+3=8 и Площадь 24м² усвоены!</div>
                <div>🎙 <strong>Английский:</strong> Спикинг «Red Apple», «Golden Sun», «Blue Ocean» — 100%!</div>
                <div>🔥 <strong>Стрик:</strong> 5 дней подряд! Семейный договор выполнен!</div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 text-[11px]">
                💡 <strong>Совет на вечер:</strong> Разрежьте за ужином лепешку на 4 части и попросите ребенка показать 3 кусочка. Хвалите за инициативу!
              </div>
            </div>

            <button
              onClick={() => setShowTelegramPush(false)}
              className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition"
            >
              Понятно, спасибо!
            </button>

          </div>
        </div>
      )}

      {/* ==================== ФУТЕР ==================== */}
      <footer className="bg-white border-t-2 border-slate-200 py-4 px-4 text-center text-xs font-bold text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            © 2026 <strong>ZukkoLearn</strong>. Образовательная EdTech платформа для школьников и родителей.
          </div>
          <div className="flex items-center gap-4 text-[#1E2C8A]">
            <span>🎧 Web Speech API & Synthesis</span>
            <span>•</span>
            <span>🛡️ Peace of Mind Dashboard</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
