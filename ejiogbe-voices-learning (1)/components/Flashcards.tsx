
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw, Brain, Wand2, Volume2, Globe, AlertCircle } from 'lucide-react';
import { Flashcard } from '../types';
import { base64ToUint8Array, decodeAudioData } from '../services/audioUtils';
import { SUPPORTED_LANGUAGES, LIVE_SUPPORTED_LANGUAGES } from '../utils/languages';

const Flashcards: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [frontLang, setFrontLang] = useState('English');
  const [backLang, setBackLang] = useState('Spanish');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showTTSWarning, setShowTTSWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const isLanguageSupported = LIVE_SUPPORTED_LANGUAGES.some(l => l.name === frontLang);

  const generateCards = async () => {
    if (!topic.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowTTSWarning(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using Pro model for better reliability with JSON schemas
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Generate a set of 10 educational flashcards about the topic: "${topic}". 
        
        CRITICAL INSTRUCTIONS:
        1. The text on the FRONT of the cards must be in ${frontLang}.
        2. The text on the BACK of the cards must be in ${backLang}.
        3. If it's a vocabulary list, the front should be the word/phrase in ${frontLang} and the back should be the equivalent/explanation in ${backLang}.
        
        Format the output as a JSON object with a 'cards' array containing 'front' and 'back' strings.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                  },
                  required: ['front', 'back'],
                },
              },
            },
            required: ['cards'],
          },
        },
      });

      if (!response.text) throw new Error("The AI returned an empty response. Please try a different topic.");
      
      const data = JSON.parse(response.text);
      if (!data.cards || data.cards.length === 0) throw new Error("No cards were generated. Try being more specific with your topic.");
      
      setCards(data.cards);
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setError(err.message || "Failed to generate deck. The AI might be busy or the topic might be restricted.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (isAudioPlaying || !text) return;

    if (!isLanguageSupported) {
      setShowTTSWarning(true);
      setTimeout(() => setShowTTSWarning(false), 3000);
      return;
    }
    
    setIsAudioPlaying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `Speak this clearly in ${frontLang}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsAudioPlaying(false);
        source.start();
      } else {
        setIsAudioPlaying(false);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      setIsAudioPlaying(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700 shadow-xl mb-12 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic: French Verbs, Medical Terms, Physics..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
              onKeyPress={(e) => e.key === 'Enter' && generateCards()}
            />
          </div>
          <button
            onClick={generateCards}
            disabled={isGenerating || !topic.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Drafting...' : 'Generate Deck'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
           <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Globe className="w-3 h-3" />
                 Front Side Language
              </label>
              <select 
                 value={frontLang}
                 onChange={(e) => setFrontLang(e.target.value)}
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                 {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
           </div>
           <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Globe className="w-3 h-3" />
                 Back Side Language
              </label>
              <select 
                 value={backLang}
                 onChange={(e) => setBackLang(e.target.value)}
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                 {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="flex flex-col items-center min-h-[400px]">
        {error && (
            <div className="w-full max-w-lg mb-8 bg-rose-950/40 border border-rose-500/30 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in zoom-in">
                <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                <div>
                    <h4 className="text-rose-200 font-bold text-sm uppercase tracking-wider mb-1">Generation Failed</h4>
                    <p className="text-rose-100/80 text-sm leading-relaxed">{error}</p>
                    <button 
                        onClick={() => { setError(null); generateCards(); }}
                        className="mt-3 text-xs font-bold text-rose-400 hover:text-rose-300 underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )}

        {isGenerating ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 text-slate-500">
            <div className="relative">
              <div className="w-20 h-28 border-4 border-cyan-500/20 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-500 animate-bounce" />
              </div>
            </div>
            <p className="text-lg font-medium">Curating your knowledge deck...</p>
          </div>
        ) : cards.length > 0 ? (
          <div className="w-full max-w-lg space-y-8 animate-in fade-in zoom-in duration-500">
            <div 
              className="group h-[400px] w-full [perspective:1000px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative h-full w-full rounded-3xl shadow-2xl transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center p-12 [backface-visibility:hidden] text-center">
                  <div className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-slate-500">{frontLang}</div>
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    {showTTSWarning && (
                       <div className="bg-amber-950/80 text-amber-200 text-[10px] px-2 py-1 rounded border border-amber-500/30 animate-in fade-in slide-in-from-right-1">
                          Voice unavailable for {frontLang}
                       </div>
                    )}
                    <button 
                      onClick={(e) => playAudio(e, cards[currentIndex].front)}
                      className={`p-2 rounded-lg transition-all border ${
                        !isLanguageSupported 
                        ? 'bg-slate-700/30 text-slate-600 border-slate-700 cursor-not-allowed opacity-50' 
                        : 'bg-slate-700/50 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border-slate-600 hover:border-cyan-500/30'
                      }`}
                    >
                      {isAudioPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-white leading-tight">{cards[currentIndex].front}</h3>
                  <div className="absolute bottom-6 flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                    <RotateCcw className="w-3 h-3" />
                    Click to reveal answer
                  </div>
                </div>
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-cyan-950/20 border-2 border-cyan-500/30 flex flex-col items-center justify-center p-12 [backface-visibility:hidden] [transform:rotateY(180deg)] text-center backdrop-blur-md">
                  <div className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-cyan-400">{backLang}</div>
                  <p className="text-2xl text-cyan-50 leading-relaxed font-light">{cards[currentIndex].back}</p>
                  <div className="absolute bottom-6 flex items-center gap-2 text-cyan-400/50 text-xs font-medium uppercase tracking-wider">
                    <RotateCcw className="w-3 h-3" />
                    Click to hide answer
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between w-full px-4">
              <button
                onClick={(e) => { e.stopPropagation(); prevCard(); }}
                className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <div className="flex gap-1 mt-2">
                    {cards.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-700'}`} />
                    ))}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : !error && (
          <div className="h-96 flex flex-col items-center justify-center space-y-6 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl w-full">
            <div className="p-6 rounded-full bg-slate-900/50">
                <Brain className="w-16 h-16 opacity-20" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-serif font-bold text-slate-400 mb-2">No Deck Active</h3>
                <p className="max-w-xs mx-auto">Describe a topic and select languages to generate a custom deck.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 text-center text-slate-500 text-sm">
        Powered by Gemini 3.0 Pro Intelligence
      </div>
    </div>
  );
};

export default Flashcards;
