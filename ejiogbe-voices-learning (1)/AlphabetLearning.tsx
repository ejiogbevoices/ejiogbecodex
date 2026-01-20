
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Eraser, Info, Sparkles, Loader2, RefreshCw, PenTool, CheckCircle, BookOpen, Volume2, Activity, MousePointer2, AlertCircle } from 'lucide-react';
import { base64ToUint8Array, decodeAudioData } from '../services/audioUtils';

interface Character {
  symbol: string;
  name: string;
  phonetic: string;
}

const ALPHABETS: Record<string, Character[]> = {
  'Ge\'ez (Amharic)': [
    { symbol: 'ሀ', name: 'Ha', phonetic: '/ha/' },
    { symbol: 'ለ', name: 'La', phonetic: '/lə/' },
    { symbol: 'ሐ', name: 'Hha', phonetic: '/ħa/' },
    { symbol: 'መ', name: 'Ma', phonetic: '/mə/' },
    { symbol: 'ሠ', name: 'Ssa', phonetic: '/ɬa/' },
    { symbol: 'ረ', name: 'Ra', phonetic: '/rə/' },
    { symbol: 'ሰ', name: 'Sa', phonetic: '/sə/' },
    { symbol: 'ቀ', name: 'Qa', phonetic: '/qə/' },
    { symbol: 'በ', name: 'Ba', phonetic: '/bə/' },
    { symbol: 'ተ', name: 'Ta', phonetic: '/tə/' }
  ],
  'Tifinagh (Berber)': [
    { symbol: 'ⴰ', name: 'Ya', phonetic: '/a/' },
    { symbol: 'ⴱ', name: 'Yab', phonetic: '/b/' },
    { symbol: 'ⴳ', name: 'Yag', phonetic: '/g/' },
    { symbol: 'ⴷ', name: 'Yad', phonetic: '/d/' },
    { symbol: 'ⴻ', name: 'Ye', phonetic: '/e/' },
    { symbol: 'ⴼ', name: 'Yaf', phonetic: '/f/' },
    { symbol: 'ⴽ', name: 'Yak', phonetic: '/k/' },
    { symbol: 'ⵍ', name: 'Yal', phonetic: '/l/' },
    { symbol: 'ⵎ', name: 'Yam', phonetic: '/m/' },
    { symbol: 'ⵏ', name: 'Yan', phonetic: '/n/' }
  ],
  'Adlam (Fulani)': [
    { symbol: '𞤀', name: 'Alif', phonetic: '/a/' },
    { symbol: '𞤁', name: 'Da', phonetic: '/d/' },
    { symbol: '𞤂', name: 'La', phonetic: '/l/' },
    { symbol: '𞤃', name: 'Ma', phonetic: '/m/' },
    { symbol: '𞤄', name: 'Ba', phonetic: '/b/' },
    { symbol: '𞤅', name: 'Sin', phonetic: '/s/' },
    { symbol: '𞤆', name: 'Pe', phonetic: '/p/' },
    { symbol: '𞤇', name: 'Bhe', phonetic: '/ɓ/' },
    { symbol: '𞤈', name: 'Ra', phonetic: '/r/' },
    { symbol: '𞤉', name: 'E', phonetic: '/e/' }
  ],
  'N\'Ko (Manding)': [
    { symbol: 'ߊ', name: 'A', phonetic: '/a/' },
    { symbol: 'ߋ', name: 'Ee', phonetic: '/e/' },
    { symbol: 'ߌ', name: 'I', phonetic: '/i/' },
    { symbol: 'ߍ', name: 'E', phonetic: '/ɛ/' },
    { symbol: 'ߎ', name: 'U', phonetic: '/u/' },
    { symbol: 'ߏ', name: 'Oo', phonetic: '/o/' },
    { symbol: 'ߐ', name: 'O', phonetic: '/ɔ/' },
    { symbol: 'ߑ', name: 'Naan', phonetic: 'nasal' }
  ],
  'Vai (Liberia)': [
    { symbol: 'ꔀ', name: 'Ee', phonetic: '/e/' },
    { symbol: 'ꔁ', name: 'En', phonetic: '/ẽ/' },
    { symbol: 'ꔂ', name: 'I', phonetic: '/i/' },
    { symbol: 'ꔃ', name: 'In', phonetic: '/ĩ/' },
    { symbol: 'ꔄ', name: 'A', phonetic: '/a/' },
    { symbol: 'ꔅ', name: 'An', phonetic: '/ã/' },
    { symbol: 'ꔆ', name: 'O', phonetic: '/o/' },
    { symbol: 'ꔇ', name: 'On', phonetic: '/õ/' }
  ]
};

const AlphabetLearning: React.FC = () => {
  const [selectedAlphabet, setSelectedAlphabet] = useState(Object.keys(ALPHABETS)[0]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [strokeGuide, setStrokeGuide] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#22d3ee';
        ctxRef.current = ctx;
      }
    }
  }, [selectedChar]);

  useEffect(() => {
    if (selectedChar) {
      fetchStrokeResources();
    }
  }, [selectedChar]);

  const fetchStrokeResources = async () => {
    if (!selectedChar) return;
    setIsGeneratingGuide(true);
    setError(null);
    setStrokeGuide(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a Typography Specialist. Provide exactly 3 clear writing steps for the character "${selectedChar.symbol}" from the ${selectedAlphabet} script.
        
        IMPORTANT:
        - Analyze the actual anatomy of "${selectedChar.symbol}".
        - Provide simple, direct physical instructions (e.g., "Draw a curve from left to right").
        - Each step should be on a new line starting with "Step X:".
        
        Return JSON:
        {
          "guide": "Step 1: ...\\nStep 2: ...\\nStep 3: ..."
        }`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              guide: { type: Type.STRING }
            },
            required: ['guide']
          }
        }
      });

      const data = JSON.parse(response.text);
      if (data && data.guide) {
        setStrokeGuide(data.guide);
      } else {
        throw new Error("Master provided incomplete guide data.");
      }
    } catch (e) {
      console.error("Guide fetch error:", e);
      setError("Unable to retrieve writing guide. Please try again.");
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const playPronunciation = async () => {
    if (!selectedChar || isAudioPlaying) return;
    
    setIsAudioPlaying(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Clearly pronounce: "${selectedChar.symbol}" (${selectedChar.name}) in ${selectedAlphabet}. Native accent.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: prompt }] }],
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
        const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsAudioPlaying(false);
        source.start();
      } else {
        throw new Error("No audio payload received.");
      }
    } catch (error) {
      console.error('Audio failure:', error);
      setIsAudioPlaying(false);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctxRef.current?.lineTo(pos.x, pos.y);
    ctxRef.current?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
      setFeedback(null);
    }
  };

  const analyzeDrawing = async () => {
    if (!selectedChar || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          {
            text: `Review this hand-drawn "${selectedChar.symbol}" (${selectedChar.name}). Does it follow the correct writing steps? Give 1-2 encouraging sentences of feedback.`
          }
        ]
      });

      setFeedback(response.text || "Your hand is growing steady.");
    } catch (err) {
      console.error("Analysis failed:", err);
      setFeedback("Keep practicing to perfect the flow.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 min-h-[70vh]">
      
      {/* Sidebar: Character Chart */}
      <div className="w-full lg:w-1/3 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 flex flex-col h-fit lg:sticky lg:top-24">
        <div className="flex items-center gap-3 mb-6 text-cyan-400">
           <BookOpen className="w-6 h-6" />
           <h3 className="text-xl font-serif font-bold text-white tracking-wide">Sacred Scripts</h3>
        </div>

        <select 
          value={selectedAlphabet}
          onChange={(e) => {
            setSelectedAlphabet(e.target.value);
            setSelectedChar(null);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 mb-6 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
        >
          {Object.keys(ALPHABETS).map(name => <option key={name} value={name}>{name}</option>)}
        </select>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 overflow-y-auto max-h-[400px] lg:max-h-[500px] pr-2 scrollbar-hide">
          {ALPHABETS[selectedAlphabet].map((char) => (
            <button
              key={char.symbol}
              onClick={() => {
                setSelectedChar(char);
                clearCanvas();
              }}
              className={`
                aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all group
                ${selectedChar?.symbol === char.symbol 
                  ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-950/20 scale-105' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}
              `}
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform text-white">{char.symbol}</span>
              <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500 group-hover:text-slate-300">{char.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
              Heritage Preservation Protocol
           </p>
        </div>
      </div>

      {/* Main Panel: Learning Lab */}
      <div className="flex-1 space-y-8">
        {selectedChar ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">
                        <span className="text-4xl text-white">{selectedChar.symbol}</span>
                    </div>
                    <div>
                        <h2 className="text-4xl font-serif font-bold text-white mb-1">Learning {selectedChar.name}</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-slate-400 font-mono tracking-widest uppercase text-xs">
                                {selectedAlphabet} • {selectedChar.phonetic}
                            </p>
                            <button 
                                onClick={playPronunciation}
                                disabled={isAudioPlaying}
                                className={`
                                    flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                    ${isAudioPlaying 
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 border border-slate-700'}
                                `}
                            >
                                {isAudioPlaying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                                <span>{isAudioPlaying ? 'Chanting' : 'Listen'}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 shadow-sm">
                   <Activity className="w-4 h-4 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Master Session Active</span>
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Section C: Writing Guide & Practice */}
                <div className="flex flex-col gap-6">
                   <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
                         <Info className="w-5 h-5 text-cyan-400" />
                         <h4 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Writing Steps</h4>
                      </div>
                      
                      {error && (
                        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
                           <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                           <p className="text-xs text-rose-200">{error}</p>
                        </div>
                      )}

                      {isGeneratingGuide ? (
                         <div className="flex flex-col gap-3 py-4">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm italic font-serif">Generating steps...</span>
                            </div>
                         </div>
                      ) : (
                         <div className="space-y-4 py-2">
                             {strokeGuide?.split('\n').filter(s => s.trim()).map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4 group animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 150}ms` }}>
                                   <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 group-hover:border-cyan-500/50 transition-colors shadow-inner">
                                      {idx + 1}
                                   </div>
                                   <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                                      {step.replace(/^\d+\.\s*/, '').replace(/^Step \d+:\s*/i, '')}
                                   </p>
                                </div>
                             ))}
                         </div>
                      )}
                   </div>

                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PenTool className="w-3.5 h-3.5" />
                            Practice Pad
                         </label>
                         <button 
                           onClick={clearCanvas}
                           className="text-[10px] font-black text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest active:scale-95"
                         >
                            <Eraser className="w-3.5 h-3.5" />
                            Clear Pad
                         </button>
                      </div>
                      <div className="relative aspect-square w-full max-w-[400px] bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl group mx-auto xl:mx-0">
                         <canvas
                           ref={canvasRef}
                           onMouseDown={startDrawing}
                           onMouseMove={draw}
                           onMouseUp={stopDrawing}
                           onMouseLeave={stopDrawing}
                           onTouchStart={startDrawing}
                           onTouchMove={draw}
                           onTouchEnd={stopDrawing}
                           className="w-full h-full touch-none cursor-crosshair"
                         />
                         
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                            <span className="text-[240px] font-serif">{selectedChar.symbol}</span>
                         </div>
                      </div>
                      
                      <button
                       onClick={analyzeDrawing}
                       disabled={isAnalyzing}
                       className={`
                           w-full max-w-[400px] mx-auto xl:mx-0 py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                           ${isAnalyzing ? 'bg-slate-700 text-slate-500 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/30 active:scale-[0.98]'}
                       `}
                      >
                         {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                         <span>{isAnalyzing ? 'Evaluating...' : 'Submit to Master'}</span>
                      </button>
                   </div>
                </div>

                {/* Feedback Panel */}
                <div className="space-y-6">
                   <div className="bg-slate-800/20 backdrop-blur border border-slate-700/50 rounded-3xl p-8 h-fit flex flex-col items-center text-center">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center mb-6 shadow-inner transition-transform hover:scale-105 duration-500 cursor-default">
                           <span className="text-7xl text-white">{selectedChar.symbol}</span>
                        </div>
                        <button 
                            onClick={playPronunciation}
                            className="absolute -bottom-2 -right-2 p-2.5 bg-cyan-600 rounded-xl text-white shadow-lg hover:bg-cyan-500 transition-colors active:scale-90"
                        >
                            <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-xl font-serif font-bold text-slate-200 mb-3">Lineage of {selectedChar.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">
                        Follow the steps provided to master the geometry of this character. This phonetic vibration is key to unlocking ancestral wisdom.
                      </p>
                   </div>

                   {feedback && (
                      <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-3xl p-6 animate-in slide-in-from-bottom-2 duration-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-500/10 rounded-xl">
                               <CheckCircle className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h4 className="font-black text-cyan-200 uppercase text-[10px] tracking-[0.2em]">Master's Verdict</h4>
                         </div>
                         <p className="text-cyan-50 font-serif text-xl leading-relaxed italic">
                            "{feedback}"
                         </p>
                      </div>
                   )}
                   
                   {!feedback && !isAnalyzing && (
                      <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 h-48 group hover:bg-slate-900/60 transition-colors">
                         <div className="p-3 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform">
                            <RefreshCw className="w-8 h-8 text-slate-700" />
                         </div>
                         <div>
                            <h5 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Awaiting Practice</h5>
                            <p className="text-slate-600 text-xs">Read the steps, then replicate below.</p>
                         </div>
                      </div>
                   )}
                </div>

             </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-slate-800 rounded-[40px] text-center p-12 transition-all hover:bg-slate-900/10">
             <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-700 shadow-inner group">
                <Sparkles className="w-10 h-10 text-slate-700 group-hover:text-cyan-400 transition-colors animate-pulse" />
             </div>
             <div className="space-y-3">
                <h3 className="text-3xl font-serif font-bold text-slate-400 tracking-tight">Master Ancient Scripts</h3>
                <p className="text-slate-600 max-w-sm leading-relaxed text-sm">
                   Select a character from the script chart to begin your initiation.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlphabetLearning;
