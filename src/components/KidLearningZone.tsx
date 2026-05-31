import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playChime, playBoing } from '../utils/audio';

// Dynamic Indonesian kid-friendly words for spelling challenge
const SPELLING_WORDS = [
  { word: 'BOLA', emoji: '⚽', hint: 'Benda bulat yang suka ditendang dan memantul!' },
  { word: 'BUKU', emoji: '📖', hint: 'Tempat membaca cerita seru dan melihat gambar!' },
  { word: 'ROTI', emoji: '🍞', hint: 'Makanan lezat untuk sarapan pagi yang empuk!' },
  { word: 'SAPI', emoji: '🐄', hint: 'Hewan lucu bertanduk yang katanya "Mooo"!' },
  { word: 'IKAN', emoji: '🐟', hint: 'Hewan air yang berenang lincah ke sana kemari!' },
  { word: 'MADU', emoji: '🍯', hint: 'Cairan manis buatan lebah hutan yang sehat!' },
  { word: 'SUSU', emoji: '🥛', hint: 'Minuman putih bergizi untuk pertumbuhan tulangmu!' },
  { word: 'TOPI', emoji: '🤠', hint: 'Dipakai di kepala agar terlindung dari sinar matahari!' },
  { word: 'KUCING', emoji: '🐱', hint: 'Hewan berbulu yang mengeong "Meong meong"!' },
  { word: 'PENA', emoji: '🖊️', hint: 'Digunakan oleh bapak/ibu guru untuk menulis tugas!' },
];

interface Props {
  itemType: 'lever' | 'treasure' | 'bomb' | 'fossil';
  onSuccess: () => void;
  onCancel: () => void;
}

export function KidLearningZone({ itemType, onSuccess, onCancel }: Props) {
  // Mode: 'math' | 'spelling'
  const [challengeMode, setChallengeMode] = useState<'math' | 'spelling'>('math');
  
  // Math Challenge State
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [isAddition, setIsAddition] = useState(true);
  const [mathAnswers, setMathAnswers] = useState<number[]>([]);
  const [chosenAnswer, setChosenAnswer] = useState<number | null>(null);
  const [mathShake, setMathShake] = useState(false);

  // Spelling Challenge State
  const [spellWord, setSpellWord] = useState('');
  const [spellEmoji, setSpellEmoji] = useState('');
  const [spellHint, setSpellHint] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; char: string; clicked: boolean }[]>([]);
  const [spelledProgress, setSpelledProgress] = useState<string[]>([]);
  const [spellError, setSpellError] = useState(false);

  // Global game state within the popup
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize a random challenge
  useEffect(() => {
    // Choose a random mode
    const mode = Math.random() > 0.5 ? 'math' : 'spelling';
    setChallengeMode(mode);

    if (mode === 'math') {
      generateMathChallenge();
    } else {
      generateSpellingChallenge();
    }
  }, [itemType]);

  const generateMathChallenge = () => {
    const isAdd = Math.random() > 0.5;
    setIsAddition(isAdd);
    
    let a = 0;
    let b = 0;
    let answer = 0;

    if (isAdd) {
      a = Math.floor(Math.random() * 8) + 2; // 2 to 9
      b = Math.floor(Math.random() * 7) + 1; // 1 to 7
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 8) + 3; // 3 to 10
      b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1 (ensures positive answer)
      answer = a - b;
    }

    setNumA(a);
    setNumB(b);

    // Create 3 reasonable alternative answers
    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const opt = Math.max(0, answer + offset);
      options.add(opt);
    }

    // Shuffle options
    setMathAnswers(Array.from(options).sort(() => Math.random() - 0.5));
    setChosenAnswer(null);
  };

  const generateSpellingChallenge = () => {
    // Pick a random word structure
    const randomItem = SPELLING_WORDS[Math.floor(Math.random() * SPELLING_WORDS.length)];
    setSpellWord(randomItem.word);
    setSpellEmoji(randomItem.emoji);
    setSpellHint(randomItem.hint);

    // Create letters with stable unique IDs to prevent sorting bugs
    const chars = randomItem.word.split('').map((char, index) => ({
      id: `${char}-${index}-${Math.random()}`,
      char,
      clicked: false,
    }));

    // Shuffle the letter sequence for scrambling
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setSpelledProgress([]);
    setSpellError(false);
  };

  const handleMathSelect = (selected: number) => {
    const correctAnswer = isAddition ? numA + numB : numA - numB;

    if (selected === correctAnswer) {
      setChosenAnswer(selected);
      setIsSuccess(true);
      playChime();
      
      // Delay successful action release
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      playBoing();
      setMathShake(true);
      setTimeout(() => setMathShake(false), 500);
    }
  };

  const handleLetterTap = (letter: { id: string; char: string; clicked: boolean }) => {
    if (letter.clicked || isSuccess) return;

    // Check if the clicked letter is the correct next character in the sequence
    const nextCorrectCharIndex = spelledProgress.length;
    const targetChar = spellWord[nextCorrectCharIndex];

    if (letter.char === targetChar) {
      // Correct stroke!
      playChime();
      
      // Mark as clicked
      setScrambledLetters(prev =>
        prev.map(item => (item.id === letter.id ? { ...item, clicked: true } : item))
      );
      
      const newProgress = [...spelledProgress, letter.char];
      setSpelledProgress(newProgress);

      // Check if complete
      if (newProgress.length === spellWord.length) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } else {
      // Wrong character selected
      playBoing();
      setSpellError(true);
      setTimeout(() => setSpellError(false), 500);
    }
  };

  // Human descriptive text based on item
  const getItemText = () => {
    switch (itemType) {
      case 'lever':
        return 'Tuas Rahasia';
      case 'bomb':
        return 'Petasan Bahaya';
      case 'fossil':
        return 'Fosil Dinosaurus';
      case 'treasure':
      default:
        return 'Peti Emas Karun';
    }
  };

  const getEmojiAndTheme = () => {
    switch (itemType) {
      case 'lever':
        return { emoji: '⚙️', color: 'from-amber-400 to-amber-500', accent: 'border-amber-400 bg-amber-50 text-amber-900' };
      case 'bomb':
        return { emoji: '🚀', color: 'from-rose-400 to-rose-500', accent: 'border-rose-400 bg-rose-50 text-rose-900' };
      case 'fossil':
        return { emoji: '🦴', color: 'from-neutral-200 to-neutral-400', accent: 'border-neutral-400 bg-neutral-100 text-neutral-900' };
      case 'treasure':
      default:
        return { emoji: '✨', color: 'from-yellow-400 to-yellow-500', accent: 'border-yellow-400 bg-yellow-50 text-yellow-900' };
    }
  };

  const themeTheme = getEmojiAndTheme();

  return (
    <div className="absolute inset-0 bg-neutral-950/98 backdrop-blur-md z-50 flex flex-col justify-between p-5 select-none touch-none rounded-xl border-4 border-neutral-800 shadow-2xl">
      
      {/* Top Banner Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-2xl opacity-60">🗝️</span>
          <h2 className="text-lg font-bold text-neutral-300 font-sans tracking-widest drop-shadow">
            KOTAK RAHASIA
          </h2>
          <span className="text-2xl opacity-60">🦇</span>
        </div>
        
        <p className="text-xs text-neutral-400 mt-1.5 px-3">
          Selesaikan sandi di bawah ini untuk membuka <span className="font-bold text-neutral-200">{getItemText()}</span>.
        </p>
      </div>

      {/* Main Challenge Content */}
      <div className="flex-1 flex flex-col justify-center items-center my-4 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* Celebrate screen when child gets the correct answer */
            <motion.div 
              key="success-celebration"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="flex flex-col items-center justify-center text-center p-4 bg-neutral-900 border border-neutral-600 rounded-2xl w-full max-w-[280px] shadow-lg animate-bounce"
            >
              <div className="text-5xl mb-2 opacity-80">🔓</div>
              <h3 className="text-xl font-black text-neutral-300 tracking-widest font-sans leading-none">BERHASIL!</h3>
              <p className="text-xs text-neutral-400 mt-2 font-sans px-1">
                Sandi terpecahkan. Keamanan terbuka.
              </p>
              
              <div className="flex items-center gap-1 mt-3.5 bg-neutral-800 px-3 py-1 rounded-full animate-pulse border border-neutral-600">
                <span className="text-[11px] text-neutral-300 font-extrabold uppercase font-sans">Membuka Kunci...</span>
              </div>
            </motion.div>
          ) : challengeMode === 'math' ? (
            /* ------------------ MATHEMATICS MODULE ------------------ */
            <motion.div 
              key="math-display"
              initial={{ x: 100, opacity: 0 }}
              animate={{ opacity: 1, x: mathShake ? [0, -10, 10, -10, 10, 0] : 0 }}
              exit={{ x: -100, opacity: 0 }}
              className="w-full flex flex-col items-center justify-center p-3"
            >
              <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 w-full max-w-[270px] text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-neutral-800 border-b border-l border-neutral-700 text-neutral-400 text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider font-sans">
                  Sandi Angka
                </div>

                <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1.5 font-sans">Hasil Kode Dari:</div>
                
                {/* Large Mathematical Question */}
                <div className="text-4xl font-extrabold font-sans text-neutral-200 drop-shadow select-none">
                  {numA} {isAddition ? '+' : '-'} {numB} = <span className="text-neutral-500">?</span>
                </div>

                <p className="text-[10px] text-neutral-500 outline-none select-none mt-1.5 font-sans uppercase tracking-widest">
                  {isAddition 
                    ? `Tarik dan tahan jawaban ke atas` 
                    : `Tarik dan tahan jawaban ke atas`
                  }
                </p>
              </div>

              {/* Grid of options, but with framer motion drag interaction! */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-[260px] mt-4">
                {mathAnswers.map((answer) => (
                  <motion.div
                    key={answer}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.8}
                    whileDrag={{ scale: 1.1, zIndex: 50 }}
                    onDragEnd={(e, info) => {
                       // If dragged up near the container core
                       if (info.offset.y < -40) {
                          handleMathSelect(answer);
                       }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative py-3 px-1 rounded-xl font-bold text-lg font-sans flex items-center justify-center border-b-4 bg-neutral-800 text-neutral-300 border-neutral-950 active:border-b-2 active:mt-0.5 shadow-lg touch-none"
                  >
                    <span className="text-xl font-black select-none pointer-events-none">{answer}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ------------------ SPELLING/ALPHABET MODULE ------------------ */
            <motion.div 
              key="spelling-display"
              initial={{ x: -100, opacity: 0 }}
              animate={{ opacity: 1, x: spellError ? [0, -10, 10, -10, 10, 0] : 0 }}
              exit={{ x: 100, opacity: 0 }}
              className="w-full flex flex-col items-center justify-center p-2"
            >
              <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-3 w-full max-w-[270px] text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-neutral-800 text-neutral-400 text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider font-sans border-b border-l border-neutral-700">
                  SANDI KATA
                </div>

                {/* Spell clue representation */}
                <span className="text-3xl filter drop-shadow block mt-1 grayscale opacity-70">{spellEmoji}</span>
                <span className="text-[10px] text-neutral-500 font-bold block mt-1.5 font-sans">EJA KATA SANDI:</span>
                
                {/* Complete word reference display */}
                <h3 className="text-2xl font-black font-sans text-neutral-300 drop-shadow select-none tracking-widest mt-0.5">
                  {spellWord}
                </h3>

                <p className="text-[9px] leading-tight text-neutral-500 mt-1 px-1 select-none font-sans italic">
                  Tarik satu persatu huruf ke kotak atas
                </p>
              </div>

              {/* Progress letters spelling board */}
              <div className="flex justify-center gap-1.5 my-3 h-11 w-full max-w-[270px]">
                {spellWord.split('').map((char, index) => {
                  const revealed = index < spelledProgress.length;
                  return (
                    <div 
                      key={index} 
                      className={`w-9 h-9 rounded bg-neutral-950 flex items-center justify-center font-sans font-black text-base shadow-sm transition-all duration-300 ${
                        revealed 
                          ? 'border border-neutral-500 text-neutral-200' 
                          : 'border border-neutral-800 text-neutral-800'
                      }`}
                    >
                      {revealed ? char : ''}
                    </div>
                  );
                })}
              </div>

              {/* Pool of interactive block letters */}
              <div className="w-full text-center">
                
                <div className="flex flex-wrap justify-center gap-2 max-w-[280px] mx-auto">
                  {scrambledLetters.map((letter) => (
                    <motion.div
                      key={letter.id}
                      drag={!letter.clicked}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.8}
                      whileDrag={!letter.clicked ? { scale: 1.2, zIndex: 50, opacity: 0.8 } : undefined}
                      onDragEnd={(e, info) => {
                         if (!letter.clicked && info.offset.y < -30) {
                            handleLetterTap(letter);
                         }
                      }}
                      onPointerDown={() => {
                        // We rely on drag primarily, but can keep tap as fallback
                        if(!letter.clicked) handleLetterTap(letter);
                      }}
                      className={`w-11 h-11 rounded border-b-4 text-base font-extrabold font-sans flex items-center justify-center transition-opacity shadow ${
                        letter.clicked 
                          ? 'opacity-10 bg-neutral-950 text-neutral-600 border-neutral-900 border-b-0 cursor-default shadow-none mt-1 touch-none pointer-events-none' 
                          : 'bg-neutral-800 text-neutral-300 border-neutral-950 active:border-b-2 active:mt-0.5 touch-none'
                      }`}
                    >
                      <span className="pointer-events-none">{letter.char}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Exit Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-[270px] mx-auto opacity-70">
        <button
          onClick={onCancel}
          disabled={isSuccess}
          className="w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 font-sans text-xs text-neutral-400 transition-all disabled:opacity-20 uppercase tracking-widest"
        >
          TUTUP KOTAK
        </button>
      </div>
    </div>
  );
}
