import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { Zap, Loader2, StopCircle, Settings2, GraduationCap, Layers, MessageSquare, Sparkles, CheckCircle2, AlertTriangle, X, Trophy, Mic, MicOff } from 'lucide-react';
import { pcmToGeminiBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import AudioVisualizer from './AudioVisualizer';
import { LIVE_SUPPORTED_LANGUAGES } from '../utils/languages';
import { LiveFeedback, LearningGoal, SessionLog } from '../types';

const SCENARIO_CATEGORIES: Record<string, string[]> = {
  'Core Daily Life': [
    'Greetings and introductions',
    'Asking names and origins',
    'Polite expressions and apologies',
    'Small talk',
    'Saying goodbye'
  ],
  'Survival / Travel': [
    'Asking for directions',
    'Transportation (bus, taxi, airport)',
    'Checking into lodging',
    'Ordering food and drinks',
    'Shopping and prices',
    'Handling misunderstandings'
  ],
  'Home and Social Life': [
    'Talking about family',
    'Describing daily routines',
    'Making plans',
    'Invitations and refusals',
    'Expressing preferences'
  ],
  'Work and Professional': [
    'Introductions at work',
    'Describing your job',
    'Meetings and scheduling',
    'Giving updates',
    'Asking for clarification',
    'Professional email tone (spoken simulation)'
  ],
  'Education and Learning': [
    'Asking questions',
    'Understanding instructions',
    'Discussing topics or lessons',
    'Presenting ideas',
    'Giving opinions'
  ],
  'Health and Emergencies': [
    'Describing symptoms',
    'Visiting a clinic or pharmacy',
    'Emergencies and urgent help',
    'Mental health check-ins'
  ],
  'Transactions and Services': [
    'Banking basics',
    'Customer service complaints',
    'Returns and refunds',
    'Appointments and bookings'
  ],
  'Cultural and Community Contexts': [
    'Greetings to elders',
    'Respectful forms of address',
    'Ritual or ceremonial language',
    'Community meetings',
    'Storytelling and oral tradition'
  ],
  'Media and Information': [
    'Discussing news',
    'Explaining events',
    'Asking for clarification',
    'Summarizing what you heard'
  ],
  'Opinion and Expression': [
    'Agreeing and disagreeing',
    'Expressing emotions',
    'Making arguments',
    'Persuasion',
    'Conflict resolution'
  ],
  'Advanced / Fluency': [
    'Abstract discussion',
    'Humor and idioms',
    'Metaphors and proverbs',
    'Negotiation',
    'Public speaking'
  ],
  'Domain-Specific': [
    'Medical professional scenarios',
    'Legal consultations',
    'Technical or IT discussions',
    'Spiritual or religious discourse',
    'Academic research discussion'
  ],
  'Language-Learning Drills': [
    'Pronunciation correction',
    'Minimal pair drills',
    'Shadowing (repeat after native)',
    'Grammar correction in speech',
    'Accent and prosody practice'
  ]
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const VOICES = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'];

const feedbackToolDeclaration: FunctionDeclaration = {
  name: 'give_feedback',
  description: 'Provide real-time feedback on the user\'s language usage, grammar, and vocabulary without interrupting the flow of conversation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      grammarScore: {
        type: Type.NUMBER,
        description: 'A score from 0 to 100 indicating grammatical correctness of the last user turn.'
      },
      feedbackText: {
        type: Type.STRING,
        description: 'Short, constructive feedback message (e.g., "Nice use of past tense!" or "Try using \'ser\' here").'
      },
      correction: {
        type: Type.STRING,
        description: 'If there was an error, provide the corrected sentence. Otherwise leave empty.'
      },
      sentiment: {
        type: Type.STRING,
        description: 'The perceived sentiment of the user (e.g., Confused, Confident, Happy).'
      }
    },
    required: ['grammarScore', 'feedbackText', 'sentiment']
  }
};

const LiveConversation: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to start");
  
  // Learning Configuration
  const [language, setLanguage] = useState('Spanish');
  const [category, setCategory] = useState('Core Daily Life');
  const [scenario, setScenario] = useState(SCENARIO_CATEGORIES['Core Daily Life'][0]);
  const [level, setLevel] = useState('Beginner');
  const [voice, setVoice] = useState('Zephyr');
  
  // Session State
  const [activeGoals, setActiveGoals] = useState<LearningGoal[]>([]);
  const [feedbacks, setFeedbacks] = useState<LiveFeedback[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<{user: string, model: string}>({ user: '', model: '' });
  const [startTime, setStartTime] = useState<number>(0);
  const [volume, setVolume] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Load goals on mount
  useEffect(() => {
    try {
        const savedGoals = localStorage.getItem('ejiogbe_goals');
        if (savedGoals) {
            const parsed = JSON.parse(savedGoals) as LearningGoal[];
            setActiveGoals(parsed.filter(g => g.status === 'active'));
        }
    } catch (e) {
        console.error("Failed to load goals");
    }
  }, []);

  // Auto-scroll feedback
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedbacks, currentTranscript]);

  // Helper to cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    nextStartTimeRef.current = 0;
    setVolume(0);
  }, []);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (SCENARIO_CATEGORIES[newCategory]?.length > 0) {
        setScenario(SCENARIO_CATEGORIES[newCategory][0]);
    }
  };

  const saveSessionLog = () => {
     if (startTime === 0) return;
     const duration = (Date.now() - startTime) / 1000;
     const avgScore = feedbacks.length > 0 
        ? feedbacks.reduce((acc, curr) => acc + curr.grammarScore, 0) / feedbacks.length 
        : 0;
     
     const log: SessionLog = {
         id: Date.now().toString(),
         timestamp: Date.now(),
         durationSeconds: Math.round(duration),
         language,
         category,
         averageScore: Math.round(avgScore),
         feedbackCount: feedbacks.length
     };
     
     const existingLogs = JSON.parse(localStorage.getItem('ejiogbe_sessions') || '[]');
     localStorage.setItem('ejiogbe_sessions', JSON.stringify([log, ...existingLogs]));
  };

  const connectToGemini = async () => {
    setIsConnecting(true);
    setError(null);
    setFeedbacks([]);
    setCurrentTranscript({ user: '', model: '' });
    setStatusMessage("Initializing audio...");

    try {
      // 1. Setup Audio Contexts
      const InputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const inputCtx = new InputContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      const OutputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const outputCtx = new OutputContextClass({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      // Ensure contexts are running (required by many browsers)
      await inputCtx.resume();
      await outputCtx.resume();

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      mediaStreamRef.current = stream;

      setStatusMessage(`Starting ${language} lesson...`);

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const goalText = activeGoals.length > 0 
        ? `User goals: ${activeGoals.map(g => g.text).join(', ')}.` 
        : '';

      const systemInstruction = `
        You are an expert ${language} language tutor. Roleplay: "${scenario}".
        Student level: ${level}.
        ${goalText}
        
        RULES:
        1. Speak ONLY in ${language}. Never use English.
        2. Give ONE short response (1-2 sentences) and then WAIT for the student.
        3. For EVERY user turn: 
           - Provide spoken response in ${language}.
           - SILENTLY call 'give_feedback' tool with a score and tip.
        4. If the student stays silent, prompt them gently in ${language}.
        5. Be helpful, patient, and encouraging.
        
        Greeting: Start the roleplay now by greeting the student in character in ${language}.
      `;

      // 4. Establish Connection
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);
            setIsConnecting(false);
            setStartTime(Date.now());
            setStatusMessage("Lesson in progress");

            const source = inputCtx.createMediaStreamSource(stream);
            inputSourceRef.current = source;

            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));

              const pcmBlob = pcmToGeminiBlob(inputData, 16000);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Tool Calls
            if (message.toolCall) {
                const responses = message.toolCall.functionCalls.map(fc => {
                    if (fc.name === 'give_feedback') {
                        const feedback = fc.args as any;
                        setFeedbacks(prev => [...prev, {
                            id: fc.id,
                            timestamp: Date.now(),
                            grammarScore: feedback.grammarScore,
                            feedbackText: feedback.feedbackText,
                            correction: feedback.correction,
                            sentiment: feedback.sentiment
                        }]);
                        return { id: fc.id, name: fc.name, response: { result: "ok" } };
                    }
                    return { id: fc.id, name: fc.name, response: { result: "ok" } };
                });
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: responses }));
            }

            // Transcripts
            if (message.serverContent?.inputTranscription) {
                setCurrentTranscript(prev => ({ ...prev, user: prev.user + message.serverContent?.inputTranscription?.text }));
            }
            if (message.serverContent?.outputTranscription) {
                 setCurrentTranscript(prev => ({ ...prev, model: prev.model + message.serverContent?.outputTranscription?.text }));
            }
            
            // Turn Complete (Delay clearing so user can read)
            if (message.serverContent?.turnComplete) {
                setTimeout(() => {
                    setCurrentTranscript(prev => {
                        // Only clear if a new turn hasn't started writing yet
                        return { user: '', model: '' };
                    });
                }, 3000);
            }

            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              try {
                const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current);
                source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (err) { console.error("Audio error:", err); }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => handleDisconnect(),
          onerror: (err) => { setError("Connection error."); handleDisconnect(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
          },
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [feedbackToolDeclaration] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setError(err.message || "Failed to connect.");
      setIsConnecting(false);
      cleanupAudio();
    }
  };

  const handleDisconnect = () => {
    saveSessionLog();
    setIsConnected(false);
    setIsConnecting(false);
    setStatusMessage("Lesson ended");
    cleanupAudio();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto h-[80vh] min-h-[600px]">
      <div className="flex-1 flex flex-col gap-6">
          <div className={`
              relative w-full rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 backdrop-blur-xl shadow-2xl transition-all duration-500
              ${isConnected ? 'flex-1 min-h-[300px]' : 'h-64 flex-shrink-0'}
          `}>
             <div className="absolute inset-0 z-0">
                <AudioVisualizer stream={mediaStreamRef.current || undefined} isRecording={isConnected} color="#22d3ee" />
             </div>
             
             <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
                 {isConnected ? (
                     <div className="flex items-center gap-3">
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                           <span className="text-sm font-bold text-slate-200">Live</span>
                        </div>
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-full flex items-center gap-2 h-9">
                           <Mic className={`w-3.5 h-3.5 ${volume > 0.03 ? 'text-cyan-400' : 'text-slate-500'}`} />
                           <div className="flex gap-0.5 h-2 items-end">
                              {[1,2,3,4,5].map(i => (
                                <div key={i} className={`w-1 rounded-full transition-all duration-75 ${volume * 20 > i ? 'bg-cyan-400' : 'bg-slate-700'}`} style={{ height: `${i * 20}%` }} />
                              ))}
                           </div>
                        </div>
                     </div>
                 ) : (
                     <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2 text-slate-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        <span className="text-sm font-medium">Offline</span>
                     </div>
                 )}
             </div>

             {isConnected && (currentTranscript.user || currentTranscript.model) && (
                 <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                     {currentTranscript.user && (
                         <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-lg font-medium animate-in slide-in-from-bottom-2">
                             <span className="text-slate-400 text-[10px] uppercase block mb-1 tracking-widest font-bold">Hearing</span>
                             {currentTranscript.user}
                         </div>
                     )}
                     {currentTranscript.model && (
                         <div className="bg-cyan-950/80 backdrop-blur-md p-3 rounded-xl border border-cyan-500/20 text-cyan-100 text-lg font-medium ml-auto max-w-[90%] animate-in slide-in-from-bottom-2">
                              <span className="text-cyan-400/70 text-[10px] uppercase block mb-1 tracking-widest font-bold">Tutor</span>
                             {currentTranscript.model}
                         </div>
                     )}
                 </div>
             )}
          </div>

          {!isConnected && !isConnecting && (
              <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700 flex-1 overflow-y-auto">
                 <div className="flex items-center gap-2 mb-6 text-slate-200">
                    <Settings2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-serif font-bold text-lg">Lesson Setup</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">
                            {LIVE_SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proficiency</label>
                        <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tutor Voice</label>
                        <select value={voice} onChange={e => setVoice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">
                            {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                        <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">
                            {Object.keys(SCENARIO_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scenario</label>
                        <select value={scenario} onChange={e => setScenario(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">
                            {SCENARIO_CATEGORIES[category]?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                 </div>

                 {activeGoals.length > 0 && (
                     <div className="mt-6 pt-6 border-t border-slate-700/50">
                         <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <Trophy className="w-3 h-3" />
                             Focus Goals
                         </h4>
                         <div className="flex flex-wrap gap-2">
                             {activeGoals.map(g => (
                                 <span key={g.id} className="text-xs bg-cyan-950/50 text-cyan-200 border border-cyan-500/20 px-2 py-1 rounded-md">
                                     {g.text}
                                 </span>
                             ))}
                         </div>
                     </div>
                 )}
              </div>
          )}

          <div className="flex flex-col items-center gap-2">
             {error && <div className="text-rose-400 bg-rose-950/50 px-4 py-2 rounded-lg text-sm border border-rose-900 mb-2">{error}</div>}
             <button
                onClick={isConnected ? handleDisconnect : connectToGemini}
                disabled={isConnecting}
                className={`
                    w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3
                    ${isConnected ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
                    ${isConnecting ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {isConnecting ? <Loader2 className="animate-spin" /> : isConnected ? <StopCircle className="fill-current" /> : <Zap className="fill-current" />}
                <span>{isConnecting ? 'Connecting...' : isConnected ? 'End Lesson' : 'Start Conversation'}</span>
            </button>
            <p className="text-slate-500 text-xs font-medium">{statusMessage}</p>
          </div>
      </div>

      <div className={`
          flex-col xl:w-96 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-500
          ${isConnected || feedbacks.length > 0 ? 'flex' : 'hidden xl:flex'}
      `}>
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex justify-between items-center">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Live Feedback
              </h3>
              <span className="text-xs font-mono text-slate-500">{feedbacks.length} events</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {feedbacks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 text-center p-4">
                      <Sparkles className="w-8 h-8 opacity-20" />
                      <p className="text-sm">Speak to receive real-time grammar feedback.</p>
                  </div>
              ) : (
                  feedbacks.map((item) => (
                      <div key={item.id} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 animate-in slide-in-from-right-2">
                          <div className="flex justify-between items-start mb-2">
                              <span className={`
                                  text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                                  ${item.grammarScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : item.grammarScore >= 70 ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'}
                              `}>
                                  Score: {item.grammarScore}
                              </span>
                              <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2 leading-relaxed">{item.feedbackText}</p>
                          {item.correction && (
                              <div className="bg-black/20 rounded p-2 text-xs border-l-2 border-orange-500/50">
                                  <span className="text-slate-500 block mb-0.5">Suggestion:</span>
                                  <span className="text-orange-200 font-medium italic">"{item.correction}"</span>
                              </div>
                          )}
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default LiveConversation;