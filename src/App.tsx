import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Brain, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RefreshCcw, 
  Gamepad2,
  Settings2,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { generateQuestions } from "./services/aiService";
import { QuizState } from "./types";
import { cn } from "./lib/utils";

const PRESET_CATEGORIES = [
  { name: "General Knowledge", icon: <Brain className="w-5 h-5" /> },
  { name: "Science & Nature", icon: <Lightbulb className="w-5 h-5" /> },
  { name: "History & Culture", icon: <Trophy className="w-5 h-5" /> },
  { name: "Movies & TV", icon: <Gamepad2 className="w-5 h-5" /> },
  { name: "Random Mix", icon: <HelpCircle className="w-5 h-5" /> },
];

export default function App() {
  const [view, setView] = useState<'home' | 'loading' | 'quiz' | 'results'>('home');
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async (selectedCat: string) => {
    setError(null);
    setCategory(selectedCat);
    setView('loading');
    try {
      const questions = await generateQuestions(selectedCat, 10, difficulty);
      setQuizState({
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: {},
        startTime: Date.now(),
        endTime: null,
        difficulty,
        category: selectedCat
      });
      setView('quiz');
      setTimeLeft(20);
    } catch (err) {
      console.error(err);
      setError("Failed to generate questions. Please try again.");
      setView('home');
    }
  };

  const handleAnswer = (answer: string) => {
    if (!quizState || isAnswered) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (isCorrect) {
      // Basic scoring + speed bonus
      const speedBonus = Math.floor(timeLeft / 2);
      const points = 10 + speedBonus;
      setQuizState(prev => prev ? { ...prev, score: prev.score + points } : null);
    }
  };

  const nextQuestion = () => {
    if (!quizState) return;

    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
      setQuizState(prev => prev ? { ...prev, endTime: Date.now() } : null);
      setView('results');
    } else {
      setQuizState(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(20);
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'quiz' && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (view === 'quiz' && timeLeft === 0 && !isAnswered) {
      handleAnswer("__TIMEOUT__");
    }
    return () => clearInterval(timer);
  }, [view, isAnswered, timeLeft]);

  const reset = () => {
    setView('home');
    setQuizState(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(20);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0f172a] text-white relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="blob w-[600px] h-[600px] bg-indigo-600/20 -top-[200px] -left-[100px]"></div>
      <div className="blob w-[500px] h-[500px] bg-pink-600/10 -bottom-[100px] -right-[100px]"></div>
      <div className="blob w-[400px] h-[400px] bg-cyan-500/10 top-[200px] left-[400px]"></div>

      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between frosted-panel shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Trivia<span className="text-indigo-400 font-black italic">Sphere</span></h1>
            <p className="text-[10px] uppercase tracking-[2px] text-gray-400 font-bold">Intelligent System</p>
          </div>
        </div>
        {quizState && view === 'quiz' && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Topic</span>
              <span className="font-mono text-sm text-indigo-300">{quizState.category}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Score</span>
              <span className="font-mono text-lg font-bold text-emerald-400">{quizState.score}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8 z-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl flex flex-col h-full justify-center">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">Choose your <span className="font-black italic text-indigo-400 uppercase">sphere</span></h2>
                  <p className="text-gray-400 text-lg max-w-lg mx-auto">Select a primary domain or curate a custom knowledge pool.</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl text-sm text-center font-medium backdrop-blur-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRESET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => startQuiz(cat.name)}
                      className="btn-frosted flex items-center gap-4 p-6 bg-white/5 rounded-2xl text-left group"
                    >
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Curation pool available</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="btn-frosted rounded-3xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-[3px] text-gray-400">
                      <Settings2 className="w-4 h-4 text-indigo-400" />
                      Neural Input
                    </h3>
                    <div className="flex bg-white/5 rounded-full p-1 gap-1 border border-white/5">
                      {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            "px-4 py-1.5 text-[10px] uppercase font-black rounded-full transition-all",
                            difficulty === d ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-gray-500 hover:text-white"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter specific topic..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && customCategory.trim() && startQuiz(customCategory)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                    <button
                      onClick={() => customCategory.trim() && startQuiz(customCategory)}
                      disabled={!customCategory.trim()}
                      className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all shadow-xl shadow-indigo-500/20"
                    >
                      Gen
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 py-10 md:py-20"
              >
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <h2 className="mt-12 text-3xl font-light tracking-tight text-white text-center">Synthesizing Questions</h2>
                <p className="text-indigo-300/60 mt-3 text-center max-w-xs font-mono text-[10px] uppercase tracking-[3px]">Mapping neural pathways...</p>
              </motion.div>
            )}

            {view === 'quiz' && quizState && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 flex flex-col flex-1 w-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-[4px] text-gray-400">
                    <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5">Q{quizState.currentQuestionIndex + 1} / {quizState.questions.length}</span>
                    <div className="flex items-center gap-4">
                       <div className={cn("w-14 h-14 rounded-full border-4 flex items-center justify-center transition-colors", timeLeft <= 5 ? "border-red-500 text-red-500 animate-pulse" : "border-indigo-500 text-white")}>
                          <span className="font-bold font-mono text-xl">{timeLeft}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-10 text-center">
                  <h3 className="text-3xl md:text-4xl font-light text-white leading-tight tracking-tight max-w-2xl mx-auto">
                    {quizState.questions[quizState.currentQuestionIndex].text}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizState.questions[quizState.currentQuestionIndex].options.map((option, idx) => {
                      const isCorrect = option === quizState.questions[quizState.currentQuestionIndex].correctAnswer;
                      const isUserSelection = selectedAnswer === option;
                      
                      let variant = "default";
                      if (isAnswered) {
                        if (isCorrect) variant = "correct";
                        else if (isUserSelection) variant = "incorrect";
                        else variant = "dimmed";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleAnswer(option)}
                          className={cn(
                            "btn-frosted group p-6 rounded-3xl text-left flex items-center gap-6 group transition-all relative overflow-hidden h-24",
                            variant === "default" && "hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:ring-2 hover:ring-indigo-500/20 active:scale-95",
                            variant === "correct" && "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-100",
                            variant === "incorrect" && "bg-red-500/20 border-red-500 ring-2 ring-red-500/30 text-red-100",
                            variant === "dimmed" && "opacity-20 grayscale scale-[0.98]"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shrink-0 shadow-lg",
                            variant === "default" && "bg-white/5 text-gray-500 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white",
                            variant === "correct" && "bg-emerald-500 text-white shadow-emerald-500/40",
                            variant === "incorrect" && "bg-red-500 text-white shadow-red-500/40",
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-lg font-medium leading-snug">{option}</span>
                          {isUserSelection && !isCorrect && (
                            <div className="absolute right-6"><XCircle className="w-8 h-8 text-red-400" /></div>
                          )}
                          {isCorrect && isAnswered && (
                            <div className="absolute right-6"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-24 py-4 flex flex-col justify-end">
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-6 frosted-panel bg-white/5 p-6 rounded-3xl"
                      >
                        <div className="text-sm flex flex-col gap-1 overflow-hidden">
                           <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Flash Context</span>
                           <p className="italic text-gray-300 line-clamp-2 italic">
                             {quizState.questions[quizState.currentQuestionIndex].explanation}
                           </p>
                        </div>
                        <button
                          onClick={nextQuestion}
                          className="bg-white text-indigo-950 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all shrink-0 w-full md:w-auto shadow-2xl shadow-indigo-500/20 active:scale-95"
                        >
                          {quizState.currentQuestionIndex === quizState.questions.length - 1 ? "Results" : "Advance"}
                          <ChevronRight className="w-4 h-4 inline-block ml-2" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {view === 'results' && quizState && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 text-center py-4 md:py-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-28 h-28 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-indigo-500/30"
                  >
                    <Trophy className="w-14 h-14 text-indigo-400" />
                  </motion.div>
                  <h2 className="text-5xl font-light tracking-tight text-white">Domination <span className="font-black italic bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic">COMPLETE</span></h2>
                  <p className="text-gray-400 tracking-wide">Category Mastered: <span className="font-bold text-white uppercase italic tracking-[2px]">{quizState.category}</span></p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Final Score", val: quizState.score, color: "text-emerald-400" },
                    { label: "Pool Size", val: quizState.questions.length, color: "text-indigo-400" },
                    { label: "Latency", val: `${Math.floor(((quizState.endTime || 0) - (quizState.startTime || 0)) / 1000)}s`, color: "text-cyan-400" },
                    { label: "Tier", val: quizState.difficulty, color: "text-pink-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="btn-frosted p-8 rounded-3xl text-center">
                      <span className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-[3px]">{stat.label}</span>
                      <span className={cn("text-3xl font-black font-mono tracking-tighter truncate", stat.color)}>{stat.val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={() => startQuiz(quizState.category)}
                    className="flex-1 bg-white text-indigo-950 px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-[3px] hover:brightness-110 shadow-2xl shadow-indigo-500/20 active:scale-95"
                  >
                    Recycle Pool
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 btn-frosted text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-[3px] hover:bg-white/10 active:scale-95"
                  >
                    Neural Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="shrink-0 p-8 flex flex-col md:flex-row items-center justify-between z-20 gap-6 mt-auto">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={cn("w-10 h-1 bg-white/10 rounded-full", i <= 4 ? "bg-indigo-500" : "bg-white/10")}></div>
          ))}
        </div>
        <div className="flex items-center gap-10 text-[10px] uppercase font-black tracking-[4px] text-gray-500">
           <span>Sphere Encryption Active</span>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
           <span>Latency 24ms</span>
        </div>
      </footer>
    </div>
  );
}
