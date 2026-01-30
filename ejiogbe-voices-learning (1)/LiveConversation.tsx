
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { Zap, Loader2, StopCircle, Settings2, GraduationCap, Layers, MessageSquare, Sparkles, CheckCircle2, AlertTriangle, X, Trophy, Mic, MicOff, Globe } from 'lucide-react';
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
  'Opinion and Expression': [
    'Agreeing and disagreeing',
    'Expressing emotions',
    'Making arguments',
    'Persuasion',
    'Conflict resolution'
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
  
  const [language, setLanguage] = useState('Spanish');
  const [category, setCategory] = useState('Core Daily Life');
  const [scenario, setScenario] = useState(SCENARIO_CATEGORIES['Core Daily Life'][0]);
  const [level, setLevel] = useState('Beginner');
  const [voice, setVoice] = useState('Zephyr');
  
  const [activeGoals, setActiveGoals] = useState<LearningGoal[]>([]);
  const [feedbacks, setFeedbacks] = useState<LiveFeedback[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<{user: string, model: string}>({ user: '', model: '' });
  const [startTime, setStartTime] = useState<number>(0);
  const [volume, setVolume] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

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

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedbacks, currentTranscript]);

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
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setVolume(0);
  }, []);

  const saveSessionLog = () => {
     if (startTime === 0) return;
     const duration = (Date.now() - startTime) / 1000;
     const avgScore = feedbacks.length > 0 
        ? feedbacks.reduce((acc, curr) => acc + curr.grammarScore, 0) / feedbacks.length 
        : 0;
     const xp = Math.round(avgScore * 5);
     
     const log: SessionLog = {
         id: Date.now().toString(),
         timestamp: Date.now(),
         durationSeconds: Math.round(duration),
         language,
         category: `Live: ${scenario}`,
         averageScore: Math.round(avgScore),
         feedbackCount: feedbacks.length,
         xpGained: xp
     };
     
     const existingLogs = JSON.parse(localStorage.getItem('ejiogbe_sessions') || '[]');
     localStorage.setItem('ejiogbe_sessions', JSON.stringify([log, ...existingLogs]));
     window.dispatchEvent(new Event('storage'));
  };

  const connectToGemini = async () => {
    setIsConnecting(true);
    setError(null);
    setFeedbacks([]);
    setCurrentTranscript({ user: '', model: '' });
    setStatusMessage("Initializing audio...");

    try {
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      await inputCtx.resume();
      await outputCtx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;
      setStatusMessage(`Starting ${language} lesson...`);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are an expert ${language} tutor. Roleplay: "${scenario}". Level: ${level}. ${activeGoals.length > 0 ? `User goals: ${activeGoals.map(g => g.text).join(', ')}.` : ''} Speak ONLY in ${language}. 1-2 sentences at a time. Call 'give_feedback' after every user turn.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setStartTime(Date.now());
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmToGeminiBlob(inputData, 16000) }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
            inputSourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
                const responses = message.toolCall.functionCalls.map(fc => {
                    if (fc.name === 'give_feedback') {
                        setFeedbacks(prev => [...prev, { id: fc.id, timestamp: Date.now(), ...fc.args } as LiveFeedback]);
                        return { id: fc.id, name: fc.name, response: { result: "ok" } };
                    }
                    return { id: fc.id, name: fc.name, response: { result: "ok" } };
                });
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: responses }));
            }
            if (message.serverContent?.inputTranscription) setCurrentTranscript(prev => ({ ...prev, user: prev.user + message.serverContent?.inputTranscription?.text }));
            if (message.serverContent?.outputTranscription) setCurrentTranscript(prev => ({ ...prev, model: prev.model + message.serverContent?.outputTranscription?.text }));
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => handleDisconnect(),
          onerror: (err) => { setError("Connection error."); handleDisconnect(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
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
    cleanupAudio();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto h-[80vh] min-h-[600px]">
      <div className="flex-1 flex flex-col gap-6">
          <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 backdrop-blur-xl shadow-2xl transition-all duration-500 ${isConnected ? 'flex-1 min-h-[300px]' : 'h-64'}`}>
             <AudioVisualizer stream={mediaStreamRef.current || undefined} isRecording={isConnected} color="#22d3ee" />
             <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
                 {isConnected ? <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /><span className="text-sm font-bold text-slate-200">Live Session</span></div> : null}
             </div>
             {isConnected && (currentTranscript.user || currentTranscript.model) && (
                 <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                     {currentTranscript.user && <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-white text-lg">{currentTranscript.user}</div>}
                     {currentTranscript.model && <div className="bg-cyan-950/80 p-3 rounded-xl border border-cyan-500/20 text-cyan-100 text-lg ml-auto max-w-[90%]">{currentTranscript.model}</div>}
                 </div>
             )}
          </div>

          {!isConnected && !isConnecting && (
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 flex-1 overflow-y-auto">
                 <div className="flex items-center gap-2 mb-6 text-slate-200"><Settings2 className="w-5 h-5 text-cyan-400" /><h3 className="font-serif font-bold text-lg">Lesson Setup</h3></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">{LIVE_SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Level</label><select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none">{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                 </div>
                 <button onClick={connectToGemini} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3"><Zap className="w-5 h-5" /><span>Start Conversation</span></button>
              </div>
          )}
          {isConnecting && <div className="flex-1 flex flex-col items-center justify-center space-y-4"><Loader2 className="w-12 h-12 animate-spin text-cyan-500" /><p className="text-slate-400">{statusMessage}</p></div>}
      </div>
      
      <div className="w-full xl:w-80 bg-slate-900/40 rounded-3xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /><span className="text-xs font-bold uppercase tracking-widest">Feedback Stream</span></div></div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {feedbacks.length === 0 && <p className="text-center text-slate-600 text-xs py-20 italic">Speak to receive real-time tips</p>}
              {feedbacks.map((f, i) => (
                  <div key={f.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-cyan-400 uppercase">Grammar: {f.grammarScore}%</span><span className="text-[10px] text-slate-500">{f.sentiment}</span></div>
                      <p className="text-sm text-slate-200 leading-relaxed">{f.feedbackText}</p>
                      {f.correction && <div className="text-[10px] bg-slate-900 p-2 rounded border border-rose-500/20 text-rose-200 font-mono italic">Correction: {f.correction}</div>}
                  </div>
              ))}
          </div>
          {isConnected && <button onClick={handleDisconnect} className="m-4 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><StopCircle className="w-4 h-4" />Stop Session</button>}
      </div>
    </div>
  );
};

export default LiveConversation;
