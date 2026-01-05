import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ArrowRightLeft, Loader2, Copy, Check, Sparkles, Mic, Square, Wand2, Trash2, Volume2, Settings2, Bookmark } from 'lucide-react';
import { blobToBase64, base64ToUint8Array, decodeAudioData } from '../services/audioUtils';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { SavedItem } from '../types';

const MAX_CHARS = 5000;

const REGISTERS = [
  'General',
  'Formal',
  'Conversational',
  'Ceremonial',
  'Academic'
];

const Translate: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  const [sourceLang, setSourceLang] = useState('Auto-detect');
  const [targetLang, setTargetLang] = useState('Yoruba');
  const [register, setRegister] = useState('General');
  
  const [detectedLang, setDetectedLang] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detectionTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const translateText = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setSaved(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Task: Translate the following text.
        Source Language: ${sourceLang === 'Auto-detect' ? (detectedLang || 'Detect automatically') : sourceLang}
        Target Language: ${targetLang}
        Register/Context: ${register}
        
        Input Text: "${text}"
        
        Output only the translated text. Do not add markdown, quotes, or explanations.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setTranslatedText(response.text?.trim() || '');
    } catch (error) {
      console.error('Translation failed:', error);
      // Silent fail to avoid alert spam
    } finally {
      setIsTranslating(false);
    }
  };

  const detectLanguage = async (text: string) => {
    if (text.length < 4) return;
    
    setIsDetecting(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Identify the language of the following text. 
        Output ONLY the language name in English (e.g., 'English', 'French', 'Swahili'). 
        If you are unsure, output "Unknown".
        
        Text: "${text.slice(0, 300)}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        const detected = response.text?.trim();
        const cleanDetected = detected?.replace(/[.,!?;:]/g, '').trim();
        
        if (cleanDetected && cleanDetected.toLowerCase() !== 'unknown') {
            setDetectedLang(cleanDetected);
        }
    } catch (e) {
        console.error("Language detection error:", e);
    } finally {
        setIsDetecting(false);
    }
  };

  const handleToggleSave = () => {
    try {
        const storedItems: SavedItem[] = JSON.parse(localStorage.getItem('ejiogbe_memory') || '[]');
        
        if (!saved) {
            // Save logic
            const newItem: SavedItem = {
                id: Date.now().toString(),
                type: 'vocabulary',
                timestamp: Date.now(),
                sourceText: sourceText,
                translatedText: translatedText,
                sourceLang: sourceLang === 'Auto-detect' ? (detectedLang || 'Unknown') : sourceLang,
                targetLang: targetLang,
                tags: [register]
            };
            localStorage.setItem('ejiogbe_memory', JSON.stringify([newItem, ...storedItems]));
            setSaved(true);
        } else {
            setSaved(false);
        }
    } catch (e) {
        console.error("Storage error", e);
    }
  };

  useEffect(() => {
    if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
    }

    // Only run detection if we are in Auto-detect mode
    if (sourceLang === 'Auto-detect' && sourceText.trim().length > 4 && !isRecording && !isTranscribing) {
        detectionTimeoutRef.current = window.setTimeout(() => {
            detectLanguage(sourceText);
        }, 1000); 
    } else {
        setDetectedLang('');
    }

    return () => {
        if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
    };
  }, [sourceText, isRecording, isTranscribing, sourceLang]);

  useEffect(() => {
    if (sourceText.trim() && translatedText.trim()) {
      translateText(sourceText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang, register]);

  const handleTranslate = () => {
    translateText(sourceText);
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang('');
    setSaved(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSourceText('');
      setTranslatedText('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Audio
              }
            },
            {
              text: `Transcribe the following audio accurately. ${sourceLang !== 'Auto-detect' ? `The audio is likely in ${sourceLang}.` : ''} Output only the transcript text.`
            }
          ]
        }
      });

      const text = response.text?.trim();
      if (text) {
        setSourceText(text.slice(0, MAX_CHARS));
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'Auto-detect') {
        if (detectedLang) {
            const match = SUPPORTED_LANGUAGES.find(l => l.name.toLowerCase() === detectedLang.toLowerCase());
            if (match) {
                setSourceLang(targetLang);
                setTargetLang(match.name);
            } else {
                 setSourceLang(targetLang);
                 setTargetLang(detectedLang);
            }
        } else {
             setSourceLang(targetLang);
             setTargetLang('English');
        }
    } else {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    }
    
    setSourceText(translatedText.slice(0, MAX_CHARS));
    setTranslatedText(sourceText);
    setSaved(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = async () => {
    if (!translatedText || isPlaying) return;
    setIsPlaying(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: `Please speak the following text: ${translatedText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
             }
             const ctx = audioContextRef.current;
             const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
             const source = ctx.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(ctx.destination);
             source.onended = () => setIsPlaying(false);
             source.start();
        } else {
            setIsPlaying(false);
        }
    } catch (err) {
        console.error("TTS error:", err);
        setIsPlaying(false);
    }
  };

  // Character limit ring calculation
  const charPercentage = Math.min((sourceText.length / MAX_CHARS) * 100, 100);
  const circleRadius = 10;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (charPercentage / 100) * circumference;
  
  const getRingColor = () => {
    if (sourceText.length >= MAX_CHARS) return 'text-rose-500';
    if (sourceText.length >= MAX_CHARS * 0.9) return 'text-orange-500';
    return 'text-cyan-500';
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header / Controls */}
        <div className="border-b border-slate-700 bg-slate-900/40 p-4 sm:px-6 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
             {/* Source Language */}
             <div className="relative group w-full sm:w-auto">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className={`
                    w-full sm:w-56 appearance-none bg-slate-800 border border-slate-600 text-slate-200 font-medium rounded-xl py-2.5 pl-4 pr-10 outline-none cursor-pointer transition-colors
                    focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:bg-slate-700
                  `}
                >
                  <option value="Auto-detect">
                    {sourceLang === 'Auto-detect' && detectedLang ? `Detected: ${detectedLang}` : 'Auto-detect'}
                  </option>
                  {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
             </div>

             <button 
                onClick={handleSwapLanguages}
                className="hidden sm:block p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Swap languages"
              >
                <ArrowRightLeft className="w-5 h-5" />
             </button>

             {/* Target Language */}
             <div className="relative w-full sm:w-auto">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full sm:w-56 appearance-none bg-slate-800 border border-slate-600 text-slate-200 font-medium rounded-xl py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
             </div>
          </div>

          {/* Context Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto border-l border-slate-700 pl-0 md:pl-4">
             <div className="relative w-full">
                <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                    value={register}
                    onChange={(e) => setRegister(e.target.value)}
                    className="w-full md:w-44 pl-10 pr-8 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300 text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    {REGISTERS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
             </div>
          </div>
        </div>

        {/* Translation Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
            
            {/* Source Input */}
            <div className="p-6 relative group bg-slate-900/20">
                <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Paste text, a proverb, or a phrase"
                    className="w-full h-64 p-0 text-lg text-slate-200 bg-transparent border-none focus:ring-0 outline-none resize-none placeholder:text-slate-500 font-light"
                />
                <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                        {/* Circular Character Counter */}
                        <div className="flex items-center gap-2" title={`${sourceText.length}/${MAX_CHARS} characters`}>
                            <div className="relative w-5 h-5">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                                    <circle
                                        cx="12" cy="12" r={circleRadius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-slate-700"
                                    />
                                    <circle
                                        cx="12" cy="12" r={circleRadius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className={`transition-all duration-300 ${getRingColor()}`}
                                    />
                                </svg>
                            </div>
                            <span className={`font-mono text-xs transition-colors ${sourceText.length >= MAX_CHARS ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                                {sourceText.length} / {MAX_CHARS}
                            </span>
                        </div>
                        
                        {/* Detection Badge (Only for visual feedback, logic handled in dropdown) */}
                        {isDetecting && (
                            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-medium bg-cyan-950/30 px-2 py-1 rounded-full animate-pulse">
                                <Wand2 className="w-3 h-3" />
                                <span>Detecting...</span>
                            </div>
                        )}

                        {isRecording && (
                            <span className="text-rose-400 text-xs font-medium animate-pulse">Recording...</span>
                        )}
                    </div>
                    
                    {/* Microphone Button */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing || isTranslating}
                        title={isRecording ? "Stop Recording" : "Record Audio"}
                        className={`
                            p-3 rounded-full transition-all duration-300 flex items-center justify-center
                            ${isRecording 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-cyan-400'
                            }
                            ${(isTranscribing || isTranslating) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isTranscribing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isRecording ? (
                            <Square className="w-4 h-4 fill-current" />
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Transcribing Overlay */}
                {isTranscribing && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl transition-all">
                      <div className="bg-slate-800 shadow-xl border border-slate-700 px-5 py-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                         <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                         <span className="font-medium text-slate-300">Transcribing audio...</span>
                      </div>
                   </div>
                )}
            </div>

            {/* Target Output */}
            <div className="p-6 bg-slate-900/40 relative group">
                
                {/* Floating Actions (Copy & Listen & Save) */}
                {translatedText && !isTranslating && (
                    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                        <button
                            onClick={handleToggleSave}
                            className={`
                                p-2 rounded-lg backdrop-blur-sm transition-all shadow-sm border
                                ${saved
                                    ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-700 hover:text-cyan-400 hover:border-slate-600'
                                }
                            `}
                            title={saved ? "Remove from Memory" : "Save to Memory"}
                        >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={handleListen}
                            disabled={isPlaying}
                            className={`
                                p-2 rounded-lg backdrop-blur-sm transition-all shadow-sm border
                                ${isPlaying 
                                    ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50' 
                                    : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-700 hover:text-cyan-400 hover:border-slate-600'
                                }
                            `}
                            title="Listen"
                        >
                            {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        
                        <button 
                            onClick={copyToClipboard}
                            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 border border-transparent hover:border-slate-600 transition-all shadow-sm backdrop-blur-sm"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                )}

                {isTranslating ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                        <span className="text-sm font-medium">Translating...</span>
                    </div>
                ) : (
                    <div className="relative h-64">
                         <textarea
                            readOnly
                            value={translatedText}
                            placeholder="Translation will appear here..."
                            className="w-full h-full p-0 text-lg text-slate-200 bg-transparent border-none focus:ring-0 outline-none resize-none placeholder:text-slate-600 pr-12 font-light"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-slate-700 flex justify-center items-center gap-4 bg-slate-900/50">
            {/* Clear Button */}
            {(sourceText || translatedText) && (
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                    title="Clear all text"
                >
                    <Trash2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Clear</span>
                </button>
            )}

            <button
                onClick={handleTranslate}
                disabled={isTranslating || isTranscribing || !sourceText.trim()}
                className={`
                    flex items-center gap-2 px-10 py-3 rounded-full font-bold text-white transition-all shadow-lg text-lg
                    ${(isTranslating || isTranscribing || !sourceText.trim()) 
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                        : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/30 hover:-translate-y-0.5'
                    }
                `}
            >
                {isTranslating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Sparkles className="w-5 h-5 fill-current" />
                )}
                <span>Translate</span>
            </button>
        </div>

      </div>
      
      <div className="mt-8 text-center text-slate-500 text-sm">
        Powered by Gemini 3.0 Flash
      </div>
    </div>
  );
};

export default Translate;