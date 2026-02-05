import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, Square, Loader2, Volume2, Globe, RefreshCw, ChevronDown, ChevronUp, PlayCircle, BarChart3, AlertCircle, Bookmark } from 'lucide-react';
import { blobToBase64, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import AudioVisualizer from './AudioVisualizer';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { SavedItem } from '../types';

type Phase = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'FEEDBACK';

interface AnalysisResult {
  transcript: string;
  overallScore: number;
  metrics: {
    sounds: number;
    stress: number;
    flow: number;
  };
  correction: {
    word: string;
    phoneme: string;
    issue: string;
    tip: string;
  } | null;
}

const Transcribe: React.FC = () => {
  // State
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [targetPhrase, setTargetPhrase] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Audio Refs
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize: Get a phrase when language changes
  useEffect(() => {
    generateNewPhrase();
  }, [targetLanguage]);

  const generateNewPhrase = async () => {
    setIsGeneratingPhrase(true);
    setPhase('IDLE');
    setAnalysis(null);
    setShowTranscript(false);
    setSaved(false);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a single, useful B1-level conversational sentence in ${targetLanguage} for pronunciation practice. Output ONLY the sentence. No quotes, no English translation.`,
        });
        setTargetPhrase(response.text?.trim() || "Hello, how are you?");
    } catch (e) {
        console.error("Phrase gen error", e);
        setTargetPhrase("Error generating phrase. Please try again.");
    } finally {
        setIsGeneratingPhrase(false);
    }
  };

  const playTargetAudio = async (text: string) => {
    if (!text) return;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: `Speak clearly: ${text}` }] }],
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
             source.start();
        }
    } catch (err) {
        console.error("TTS error:", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' }); 
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        await analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setPhase('RECORDING');
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && phase === 'RECORDING') {
      mediaRecorderRef.current.stop();
      setPhase('PROCESSING');
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      setSaved(false);
      const base64Audio = await blobToBase64(audioBlob);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        ACT AS A STRICT PHONETICIAN AND LANGUAGE EXAMINER.
        
        TARGET PHRASE: "${targetPhrase}"
        TARGET LANGUAGE: ${targetLanguage}
        
        INSTRUCTIONS:
        1. Listen to the audio and transcribe EXACTLY what the user said.
           - If gibberish/unrelated: Transcribe what you hear or "[unintelligible]".
           
        2. VERIFY CONTENT:
           - If user words do NOT match target words: Score = 0-10. Correction = "Speak the target phrase".
             
        3. DETAILED SCORING (Only if words match):
           - < 50%: Poor pronunciation.
           - > 90%: Native-like.
           
        4. CORRECTION FOCUS:
           - Identify the single most important error.
           - Isolate the specific PHONEME or syllable causing the issue (e.g. /r/, /th/, 'long a').
        
        OUTPUT JSON:
        {
          "transcript": "string",
          "overallScore": number (0-100),
          "metrics": {
            "sounds": number (0-100),
            "stress": number (0-100),
            "flow": number (0-100)
          },
          "correction": {
            "word": "string (the word containing the error)",
            "phoneme": "string (the specific target phoneme/sound e.g. /æ/ or 'th', or 'N/A' if general)",
            "issue": "string (concise error description)",
            "tip": "string (physical instruction)"
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
            { text: prompt }
          ]
        },
        config: {
            responseMimeType: 'application/json'
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText) as AnalysisResult;
      
      setAnalysis(result);
      setPhase('FEEDBACK');
      
      if (result.overallScore < 40) {
        setShowTranscript(true);
      }

    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysis({
          transcript: "Error processing audio.",
          overallScore: 0,
          metrics: { sounds: 0, stress: 0, flow: 0 },
          correction: { word: "Error", phoneme: "N/A", issue: "Analysis failed", tip: "Please try again." }
      });
      setPhase('FEEDBACK');
    }
  };

  const handleToggleSave = () => {
    if (!analysis) return;
    try {
        const storedItems: SavedItem[] = JSON.parse(localStorage.getItem('ejiogbe_memory') || '[]');
        
        if (!saved) {
             const newItem: SavedItem = {
                id: Date.now().toString(),
                type: 'pronunciation',
                timestamp: Date.now(),
                phrase: targetPhrase,
                score: analysis.overallScore,
                correction: analysis.correction || undefined
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

  const renderBar = (label: string, value: number, colorClass: string) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div 
                className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      
      {/* 1. Configuration & Target Phrase */}
      <div className="space-y-6">
          
          <div className="flex justify-between items-center px-2">
            <div className="relative group min-w-[200px]">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select 
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 text-sm font-semibold rounded-lg appearance-none outline-none focus:ring-2 focus:ring-cyan-500 hover:bg-slate-800 cursor-pointer"
                >
                    {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                </select>
            </div>
            
            <button 
                onClick={generateNewPhrase}
                disabled={isGeneratingPhrase}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isGeneratingPhrase ? 'animate-spin' : ''}`} />
                <span>New Phrase</span>
            </button>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-xl flex flex-col items-center text-center space-y-4">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Target Phrase</h3>
               
               {isGeneratingPhrase ? (
                   <div className="h-12 flex items-center justify-center">
                       <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                   </div>
               ) : (
                   <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-2xl sm:text-3xl font-serif font-medium text-slate-100 leading-relaxed">
                            "{targetPhrase}"
                        </p>
                        <button
                            onClick={() => playTargetAudio(targetPhrase)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 transition-colors text-sm font-semibold border border-cyan-900/50"
                        >
                            <PlayCircle className="w-4 h-4" />
                            <span>Listen to Native</span>
                        </button>
                   </div>
               )}
          </div>
      </div>

      {/* 2. Middle Section: Dynamic */}
      <div className="min-h-[220px] transition-all duration-500">
        
        {(phase === 'IDLE' || phase === 'RECORDING' || phase === 'PROCESSING') && (
             <div className="h-full bg-slate-900/30 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                {phase === 'RECORDING' && stream ? (
                    <div className="w-full h-40 opacity-70">
                        <AudioVisualizer stream={stream} isRecording={true} color="#22d3ee" />
                    </div>
                ) : phase === 'PROCESSING' ? (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                        <span className="text-sm font-medium">AI Elder is analyzing your speech...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                        <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                        <span className="text-xs font-medium uppercase tracking-wider">Ready to Record</span>
                    </div>
                )}
             </div>
        )}

        {phase === 'FEEDBACK' && analysis && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                
                {/* Score Dashboard */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 flex flex-col sm:flex-row gap-8 items-center relative">
                    
                    {/* Save Button */}
                    <button
                        onClick={handleToggleSave}
                        className={`
                            absolute top-4 right-4 p-2 rounded-lg transition-colors
                            ${saved ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-700/50'}
                        `}
                        title={saved ? "Saved to Memory" : "Save Result"}
                    >
                        <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                    </button>

                    <div className="relative w-32 h-32 flex-shrink-0">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                            <circle 
                                cx="50" cy="50" r="40" 
                                fill="none" 
                                stroke={analysis.overallScore > 80 ? '#22d3ee' : analysis.overallScore > 50 ? '#fb923c' : '#f43f5e'} 
                                strokeWidth="8"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * analysis.overallScore / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-3xl font-bold text-slate-200">{analysis.overallScore}</span>
                             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall</span>
                         </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        {renderBar("Sounds (Phonemes)", analysis.metrics.sounds, "bg-cyan-500")}
                        {renderBar("Stress & Intonation", analysis.metrics.stress, "bg-purple-500")}
                        {renderBar("Flow & Speed", analysis.metrics.flow, "bg-emerald-500")}
                    </div>
                </div>

                {/* Specific Correction Focus */}
                {analysis.correction && analysis.correction.word !== 'None' && analysis.correction.word !== 'Error' && (
                    <div className="bg-orange-950/20 border border-orange-900/30 rounded-xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-orange-900/30 rounded-lg text-orange-400 mt-1">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <div>
                                <h4 className="text-orange-200 font-semibold text-sm flex flex-wrap items-center gap-2">
                                    Focus on: 
                                    {analysis.correction.phoneme && analysis.correction.phoneme !== 'N/A' && (
                                        <span className="text-cyan-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-900/50 shadow-sm">
                                            {analysis.correction.phoneme}
                                        </span>
                                    )}
                                    in 
                                    <span className="italic text-slate-100 bg-white/5 px-2 py-0.5 rounded">"{analysis.correction.word}"</span>
                                </h4>
                            </div>
                            
                            <p className="text-slate-400 text-sm">{analysis.correction.issue}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <span className="text-xs bg-orange-900/40 text-orange-300 px-2 py-1 rounded border border-orange-900/50">
                                    Tip: {analysis.correction.tip}
                                </span>
                                <button 
                                    onClick={() => playTargetAudio(analysis.correction?.word || '')}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors border border-slate-700"
                                >
                                    <Volume2 className="w-3 h-3" />
                                    <span>Listen to correction</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 3. Action Area */}
      <div className="flex flex-col items-center gap-6 pt-4">
         
         <button
            onClick={() => {
                if (phase === 'IDLE') startRecording();
                else if (phase === 'RECORDING') stopRecording();
                else if (phase === 'FEEDBACK') generateNewPhrase();
            }}
            disabled={phase === 'PROCESSING'}
            className={`
                group flex items-center gap-3 px-10 py-4 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 transform hover:-translate-y-1
                ${phase === 'RECORDING' 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/40 animate-pulse ring-4 ring-rose-500/20' 
                    : phase === 'PROCESSING'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/40 cursor-wait'
                        : phase === 'FEEDBACK'
                            ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400 border border-slate-600'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/40'
                }
            `}
         >
             {phase === 'RECORDING' ? (
                 <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>Stop Recording</span>
                 </>
             ) : phase === 'PROCESSING' ? (
                 <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI Analysis In Progress...</span>
                 </>
             ) : phase === 'FEEDBACK' ? (
                 <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Practice Next Phrase</span>
                 </>
             ) : (
                 <>
                    <Mic className="w-5 h-5" />
                    <span>Start Pronunciation Practice</span>
                 </>
             )}
         </button>

         {phase === 'FEEDBACK' && (
             <button 
                onClick={() => {
                    setPhase('IDLE');
                    setAnalysis(null);
                    setSaved(false);
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
             >
                 Repeat this phrase
             </button>
         )}

         {phase === 'FEEDBACK' && analysis && (
             <div className="w-full mt-4 border-t border-slate-800 pt-4">
                 <button 
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl transition-colors text-slate-400 text-sm font-medium"
                 >
                     <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>View Comparison Details</span>
                     </div>
                     {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </button>
                 
                 {showTranscript && (
                     <div className="mt-2 p-4 bg-slate-900/40 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                         <div className="space-y-1">
                             <span className="text-xs uppercase font-bold text-slate-500">Target</span>
                             <p className="text-slate-300 text-lg">{targetPhrase}</p>
                         </div>
                         <div className="space-y-1">
                             <span className="text-xs uppercase font-bold text-rose-500/80">You Said</span>
                             <p className="text-slate-400 italic">"{analysis.transcript}"</p>
                         </div>
                     </div>
                 )}
             </div>
         )}

      </div>
    </div>
  );
};

export default Transcribe;