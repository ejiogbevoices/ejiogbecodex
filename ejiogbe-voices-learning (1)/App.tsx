
import React, { useState } from 'react';
import { Mic, Volume2, Languages, GraduationCap, MessageCircle, BookOpen, Bookmark, Brain } from 'lucide-react';
import Transcribe from './components/Transcribe';
import TTS from './components/TTS';
import LiveConversation from './components/LiveConversation';
import Translate from './components/Translate';
import Notebook from './components/Notebook';
import Flashcards from './components/Flashcards';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LIVE);

  const getTabClass = (tabMode: AppMode) => {
    const isActive = mode === tabMode;
    return `
      flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border
      ${isActive 
          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
          : 'border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
      }
    `;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B1120] to-black pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Logo Icon */}
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50">
                <GraduationCap className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
                Ejiogbe Voices
             </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-1.5 bg-slate-800 text-cyan-400 rounded-full border border-slate-700 shadow-inner">
            <BookOpen className="w-3 h-3" />
            <span>AI Learning Suite</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-16">
            <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-sm flex flex-wrap sm:flex-nowrap justify-center gap-2 overflow-x-auto">
                <button
                    onClick={() => setMode(AppMode.LIVE)}
                    className={getTabClass(AppMode.LIVE)}
                >
                    <MessageCircle className="w-4 h-4" />
                    AI Tutor
                </button>
                <button
                    onClick={() => setMode(AppMode.TRANSCRIBE)}
                    className={getTabClass(AppMode.TRANSCRIBE)}
                >
                    <Mic className="w-4 h-4" />
                    Pronunciation
                </button>
                <button
                    onClick={() => setMode(AppMode.FLASHCARDS)}
                    className={getTabClass(AppMode.FLASHCARDS)}
                >
                    <Brain className="w-4 h-4" />
                    Flashcards
                </button>
                <button
                    onClick={() => setMode(AppMode.TRANSLATE)}
                    className={getTabClass(AppMode.TRANSLATE)}
                >
                    <Languages className="w-4 h-4" />
                    Translator
                </button>
                 <button
                    onClick={() => setMode(AppMode.TTS)}
                    className={getTabClass(AppMode.TTS)}
                >
                    <Volume2 className="w-4 h-4" />
                    Listen
                </button>
                <button
                    onClick={() => setMode(AppMode.NOTEBOOK)}
                    className={getTabClass(AppMode.NOTEBOOK)}
                >
                    <Bookmark className="w-4 h-4" />
                    Notebook
                </button>
            </div>
        </div>

        {/* View Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {mode === AppMode.LIVE && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Conversational Roleplay</h2>
                    <p className="text-slate-400 text-lg font-light">Immerse yourself in ancestral and modern dialogues with your personal AI elder.</p>
                </div>
            )}
            {mode === AppMode.TRANSCRIBE && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white">Pronunciation Coach</h2>
                    <p className="text-slate-400 text-lg font-light">Multi-engine transcription to preserve your voice and perfect your accent.</p>
                </div>
            )}
            {mode === AppMode.FLASHCARDS && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white">Smart Flashcards</h2>
                    <p className="text-slate-400 text-lg font-light">Generate interactive decks on any topic using AI.</p>
                </div>
            )}
            {mode === AppMode.TRANSLATE && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white">Global Knowledge</h2>
                    <p className="text-slate-400 text-lg font-light">Context-aware translation across many languages.</p>
                </div>
            )}
             {mode === AppMode.TTS && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white">Listening Lab</h2>
                    <p className="text-slate-400 text-lg font-light">Generate lifelike speech from written text for listening and review.</p>
                </div>
            )}
            {mode === AppMode.NOTEBOOK && (
                <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
                    <h2 className="text-4xl font-serif font-bold text-white">Your Notebook</h2>
                    <p className="text-slate-400 text-lg font-light">Review your saved vocabulary and pronunciation progress.</p>
                </div>
            )}

            {mode === AppMode.TRANSCRIBE && <Transcribe />}
            {mode === AppMode.TTS && <TTS />}
            {mode === AppMode.TRANSLATE && <Translate />}
            {mode === AppMode.LIVE && <LiveConversation />}
            {mode === AppMode.NOTEBOOK && <Notebook />}
            {mode === AppMode.FLASHCARDS && <Flashcards />}
        </div>

      </main>
    </div>
  );
};

export default App;
