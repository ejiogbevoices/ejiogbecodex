
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Sparkles, Loader2, Target, Trophy, Flame, 
  ChevronRight, CheckCircle2, XCircle, 
  RefreshCcw, BookOpen, Brain, 
  LayoutGrid, ListOrdered, ArrowRightLeft, 
  Type as FontIcon, Globe, AlertCircle 
} from 'lucide-react';
import { QuizActivity, QuizType, SessionLog } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

const QuizSystem: React.FC = () => {
  // Config State
  const [targetLang, setTargetLang] = useState('Spanish');
  const [topic, setTopic] = useState('Common Greetings');
  
  // Quiz Session State
  const [activities, setActivities] = useState<QuizActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Matching Specific State
  const [userMatches, setUserMatches] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  
  const generateQuiz = async () => {
    if (!topic.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setShowResults(false);
    setActivities([]);
    setCurrentIndex(0);
    setSessionScore(0);
    setStreak(0);
    setIsAnswered(false);
    setIsCorrect(null);
    setUserMatches({});
    setActiveLeft(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate a set of 5 diverse vocabulary and grammar activities for learning ${targetLang} centered on the topic: "${topic}".
      
      REQUIREMENTS:
      1. Vary the types significantly. Use a mix of: multiple_choice, word_scramble, matching, fill_blanks, odd_one_out, and true_false.
      2. For 'matching', provide exactly 4 pairs.
      3. For 'word_scramble', Provide the sentence in the 'options' array as a list of words.
      4. Ensure linguistic accuracy in ${targetLang}. 
      5. Provide clear context and explanations for each answer.
      
      Output exactly a JSON object with an 'activities' array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    question: { type: Type.STRING },
                    context: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    pairs: { 
                      type: Type.ARRAY, 
                      items: { 
                        type: Type.OBJECT,
                        properties: {
                          left: { type: Type.STRING },
                          right: { type: Type.STRING }
                        }
                      } 
                    },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ['id', 'type', 'question', 'answer', 'explanation']
                }
              }
            },
            required: ['activities']
          }
        }
      });

      const data = JSON.parse(response.text);
      if (!data.activities || data.activities.length === 0) {
        throw new Error("No activities generated.");
      }
      setActivities(data.activities);
      setStartTime(Date.now());
    } catch (err: any) {
      console.error("Quiz generation failed", err);
      setError(err.message || "Failed to generate lesson. Please try a different topic or language.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Shuffle the right side for matching activities so they aren't adjacent
    const activity = activities[currentIndex];
    if (activity?.type === 'matching' && activity.pairs) {
      const rights = activity.pairs.map(p => p.right);
      setShuffledRights([...rights].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, activities]);

  const saveQuizSession = (finalScore: number) => {
    try {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const log: SessionLog = {
        id: `quiz-${Date.now()}`,
        timestamp: Date.now(),
        durationSeconds,
        language: targetLang,
        category: 'Activity Hub',
        averageScore: finalScore,
        feedbackCount: activities.length,
        xpGained: finalScore * 5
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('ejiogbe_sessions') || '[]');
      localStorage.setItem('ejiogbe_sessions', JSON.stringify([log, ...existingLogs]));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Failed to persist quiz results", e);
    }
  };

  const handlePairSelection = (side: 'left' | 'right', value: string) => {
    if (isAnswered) return;
    
    if (side === 'left') {
      setActiveLeft(value);
    } else if (side === 'right' && activeLeft) {
      setUserMatches(prev => ({
        ...prev,
        [activeLeft]: value
      }));
      setActiveLeft(null);
    }
  };

  const checkAnswer = () => {
    if (isAnswered) return;
    
    const activity = activities[currentIndex];
    let correct = false;

    if (activity.type === 'multiple_choice' || activity.type === 'true_false' || activity.type === 'odd_one_out' || activity.type === 'scenario_choice') {
      correct = selectedOption === activity.answer;
    } else if (activity.type === 'fill_blanks' || activity.type === 'translation_blitz') {
      correct = inputText.trim().toLowerCase() === (activity.answer as string).toLowerCase();
    } else if (activity.type === 'word_scramble') {
      correct = inputText.trim().toLowerCase() === (activity.answer as string).toLowerCase();
    } else if (activity.type === 'matching' && activity.pairs) {
      const totalPairs = activity.pairs.length;
      let matchedCount = 0;
      activity.pairs.forEach(p => {
        if (userMatches[p.left] === p.right) matchedCount++;
      });
      correct = matchedCount === totalPairs;
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setSessionScore(s => s + 20);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const nextActivity = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setInputText('');
      setUserMatches({});
      setActiveLeft(null);
    } else {
      setShowResults(true);
      saveQuizSession(sessionScore);
    }
  };

  const currentActivity = activities[currentIndex];
  const isMatchingComplete = currentActivity?.type === 'matching' && currentActivity.pairs && Object.keys(userMatches).length === currentActivity.pairs.length;
  const isButtonDisabled = !selectedOption && !inputText.trim() && !isMatchingComplete && !isAnswered;

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
      
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-end">
         <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Target Language</label>
            <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 font-bold focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none"
                >
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
            </div>
         </div>
         <div className="flex-[2] space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Lesson Topic</label>
            <div className="relative">
                <Brain className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Travel, Family, Modern Slang..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                />
            </div>
         </div>
         <button 
            onClick={generateQuiz}
            disabled={isGenerating || !topic.trim()}
            className="w-full md:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-700"
         >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Start Quiz'}
         </button>
      </div>

      {error && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 flex items-start gap-4 animate-in fade-in">
          <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
          <div>
            <h4 className="text-rose-200 font-bold uppercase tracking-wider text-sm mb-1">Lesson Error</h4>
            <p className="text-rose-100/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {isGenerating ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-6 text-slate-500 border-2 border-dashed border-slate-800 rounded-[40px]">
           <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
           </div>
           <div className="text-center">
              <p className="text-xl font-serif font-bold text-slate-300">Generating Custom Activities</p>
              <p className="text-sm font-light">Analyzing {targetLang} grammar and vocabulary...</p>
           </div>
        </div>
      ) : activities.length > 0 && !showResults ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="flex items-center gap-4 px-2">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-cyan-500 transition-all duration-500" 
                    style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }} 
                 />
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                 <span>{currentIndex + 1} / {activities.length}</span>
                 <div className="flex items-center gap-1.5 text-orange-400">
                    <Flame className={`w-4 h-4 ${streak > 0 ? 'animate-bounce' : ''}`} />
                    <span>{streak}</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <LayoutGrid className="w-32 h-32" />
              </div>

              <div className="space-y-8 relative z-10">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                           {currentActivity.type.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white leading-tight">
                        {currentActivity.question}
                    </h3>
                    {currentActivity.context && (
                        <p className="text-slate-400 font-light italic text-lg leading-relaxed">
                            {currentActivity.context}
                        </p>
                    )}
                 </div>

                 <div className="min-h-[200px]">
                    {(currentActivity.type === 'multiple_choice' || currentActivity.type === 'true_false' || currentActivity.type === 'odd_one_out') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentActivity.options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !isAnswered && setSelectedOption(opt)}
                                    className={`
                                        p-6 rounded-2xl text-left font-medium text-lg transition-all border-2
                                        ${selectedOption === opt 
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]' 
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                                        ${isAnswered && opt === currentActivity.answer ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200' : ''}
                                        ${isAnswered && selectedOption === opt && opt !== currentActivity.answer ? 'border-rose-500 bg-rose-500/20 text-rose-200' : ''}
                                        ${isAnswered ? 'cursor-default' : 'active:scale-95'}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentActivity.type === 'matching' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Select an item on the left, then its match on the right</p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    {currentActivity.pairs?.map((p, i) => {
                                        const isLinked = !!userMatches[p.left];
                                        const isSelected = activeLeft === p.left;
                                        return (
                                          <button 
                                              key={i} 
                                              onClick={() => handlePairSelection('left', p.left)}
                                              className={`
                                                w-full p-6 rounded-2xl border-2 text-lg font-medium transition-all text-center
                                                ${isSelected ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-900/20 scale-[1.02]' : 'bg-slate-900 border-slate-700 text-slate-400'}
                                                ${isLinked && !isSelected ? 'border-slate-600 bg-slate-800/50 text-slate-500' : ''}
                                                ${isAnswered ? 'cursor-default' : 'active:scale-95'}
                                              `}
                                          >
                                              {p.left}
                                          </button>
                                        );
                                    })}
                                </div>
                                <div className="space-y-3">
                                    {shuffledRights.map((rightVal, i) => {
                                        const matchedLeft = Object.keys(userMatches).find(key => userMatches[key] === rightVal);
                                        const isLinked = !!matchedLeft;
                                        const isCorrectMatch = isAnswered && currentActivity.pairs?.some(p => p.left === matchedLeft && p.right === rightVal);

                                        return (
                                          <button 
                                              key={i}
                                              onClick={() => handlePairSelection('right', rightVal)}
                                              className={`
                                                w-full p-6 rounded-2xl border-2 text-lg font-medium transition-all text-center
                                                ${isLinked ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400'}
                                                ${isAnswered && isLinked && isCorrectMatch ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200' : ''}
                                                ${isAnswered && isLinked && !isCorrectMatch ? 'border-rose-500 bg-rose-500/20 text-rose-200' : ''}
                                                ${isAnswered ? 'cursor-default' : 'active:scale-95'}
                                              `}
                                          >
                                              {rightVal}
                                          </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {(currentActivity.type === 'fill_blanks' || currentActivity.type === 'word_scramble' || currentActivity.type === 'translation_blitz') && (
                        <div className="space-y-6">
                            {currentActivity.type === 'word_scramble' && (
                                <div className="flex flex-wrap gap-2 p-6 bg-slate-900/50 rounded-2xl border border-slate-700 border-dashed">
                                    {currentActivity.options?.map((word, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm font-mono border border-slate-700">{word}</span>
                                    ))}
                                </div>
                            )}
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={isAnswered}
                                placeholder="Type your answer here..."
                                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-500/50 p-6 rounded-3xl text-2xl font-serif text-white outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>
                    )}
                 </div>

                 <div className="pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        {isAnswered && (
                            <div className={`flex items-start gap-4 animate-in slide-in-from-left-4 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isCorrect ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
                                <div className="space-y-1">
                                    <p className="font-black uppercase tracking-widest text-[10px]">
                                        {isCorrect ? 'Perfect Mastery' : 'Lesson Opportunity'}
                                    </p>
                                    <p className="text-slate-200 text-sm italic font-serif">
                                        "{currentActivity.explanation}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={isAnswered ? nextActivity : checkAnswer}
                        disabled={isButtonDisabled}
                        className={`
                            px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-3
                            ${isAnswered 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-700 disabled:text-slate-500'}
                        `}
                    >
                        <span>{isAnswered ? 'Continue' : 'Check'}</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : showResults ? (
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-[40px] p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="inline-flex p-8 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4">
                <Trophy className="w-20 h-20 text-cyan-400 animate-bounce" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-serif font-bold text-white">Lesson Complete!</h2>
                <p className="text-slate-400 font-light text-xl">You've mastered the session with high honors.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Score</p>
                    <p className="text-3xl font-bold text-cyan-400">{sessionScore}%</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">XP Gained</p>
                    <p className="text-3xl font-bold text-indigo-400">+{sessionScore * 5}</p>
                </div>
            </div>

            <button 
                onClick={generateQuiz}
                className="px-12 py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4 mx-auto"
            >
                <RefreshCcw className="w-5 h-5" />
                New Session
            </button>
        </div>
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-slate-800 rounded-[40px] text-center p-12 group hover:bg-slate-900/10 transition-colors">
             <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-10 h-10 text-slate-700 group-hover:text-cyan-400 transition-colors" />
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-slate-400 tracking-tight">Activity Forge</h3>
                <p className="text-slate-600 max-w-sm leading-relaxed text-sm">
                   Set your language and a topic above to generate a custom-tailored learning session powered by the AI Elder.
                </p>
             </div>
             <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse delay-150"></div>
             </div>
        </div>
      )}
      
      <div className="mt-20 border-t border-slate-800/50 pt-12 text-center space-y-6">
         <div className="flex flex-wrap justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-2"><ListOrdered className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Sequencing</span></div>
            <div className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Pairing</span></div>
            <div className="flex items-center gap-2"><FontIcon className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Syntax</span></div>
            <div className="flex items-center gap-2"><Target className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Semantic</span></div>
         </div>
         <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Ejiogbe Cognitive Engine v2.0</p>
      </div>

    </div>
  );
};

export default QuizSystem;
