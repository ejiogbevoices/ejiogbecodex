
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Play, Pause, Loader2, Volume2, Sparkles, Download, Wand2, Music, Mic2, Star, Disc, AlertCircle, FastForward } from 'lucide-react';
import { base64ToUint8Array, pcmToWavBlob } from '../services/audioUtils';

const VOICES = [
    { id: 'Zephyr', name: 'Zephyr', hint: 'Balanced, Standard' },
    { id: 'Kore', name: 'Kore', hint: 'Calm, Soothing' },
    { id: 'Puck', name: 'Puck', hint: 'Energetic, Bright' },
    { id: 'Charon', name: 'Charon', hint: 'Deep, Authoritative' },
    { id: 'Fenrir', name: 'Fenrir', hint: 'Strong, Intense' },
];

const MELODIC_STYLES = [
    { id: 'rhythmic', name: 'Rhythmic/Upbeat', prompt: 'Sing this rhythmically with melodic energy' },
    { id: 'chant', name: 'Traditional Chant', prompt: 'Perform this as a steady rhythmic chant' }
];

const MAX_CHARS = 500; // Even stricter limit to prevent 500 errors in preview

const TTS: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [isSinging, setIsSinging] = useState(false);
  const [melodicStyle, setMelodicStyle] = useState('rhythmic');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioUrl]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateSpeech = async () => {
    if (!text.trim() || isGenerating) return;
    
    setError(null);
    setIsGenerating(true);
    
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const styleInstruction = MELODIC_STYLES.find(s => s.id === melodicStyle)?.prompt || MELODIC_STYLES[0].prompt;
      
      // Ultra-simplified prompt to avoid 500 errors. 
      // Multi-line or complex JSON prompts are more likely to fail in the current preview.
      const promptText = isSinging 
        ? `${styleInstruction}: "${text.trim().slice(0, MAX_CHARS)}"`
        : `Speak clearly: "${text.trim().slice(0, MAX_CHARS)}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!base64Audio) {
        throw new Error("Audio generation failed. Try a shorter sentence or a different voice. This usually happens when the model cannot harmonize the specific text length.");
      }

      const bytes = base64ToUint8Array(base64Audio);
      const wavBlob = pcmToWavBlob(bytes, 24000); 
      const url = URL.createObjectURL(wavBlob);
      
      setAudioUrl(url);

    } catch (err: any) {
      console.error("TTS Error:", err);
      setError(err.message || "A server error occurred. Try reducing text complexity.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
        audioRef.current.pause();
    } else {
        audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
        audioRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `ejiogbe-audio-${selectedVoice}-${isSinging ? 'singing' : 'speech'}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
        <div className={`
            backdrop-blur-xl rounded-3xl shadow-2xl border transition-all duration-700 overflow-hidden
            ${isSinging ? 'bg-indigo-900/20 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-slate-800/50 border-slate-700'}
        `}>
            <div className={`
                border-b px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-500
                ${isSinging ? 'border-indigo-500/20 bg-indigo-950/40' : 'border-slate-700 bg-slate-900/30'}
            `}>
                 <div className="flex items-center gap-2 font-semibold font-serif transition-colors">
                    {isSinging ? (
                        <div className="relative">
                            <Music className="w-5 h-5 text-indigo-400 animate-bounce" />
                            <Star className="absolute -top-1 -right-1 w-2 h-2 text-yellow-400 animate-pulse" />
                        </div>
                    ) : (
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                    )}
                    <h3 className={isSinging ? 'text-indigo-200' : 'text-slate-300'}>
                        {isSinging ? 'Melodic Studio' : 'Text to Speech Lab'}
                    </h3>
                 </div>
                 
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsSinging(!isSinging)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                            isSinging 
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                        }`}
                    >
                        {isSinging ? <Disc className="w-3 h-3 animate-spin" /> : <Music className="w-3 h-3" />}
                        <span>Sing Mode</span>
                    </button>

                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <div className="relative w-full sm:w-40">
                            <select 
                                value={selectedVoice} 
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className={`
                                    w-full appearance-none border text-sm rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors
                                    ${isSinging ? 'bg-indigo-950/50 border-indigo-500/30 text-indigo-100' : 'bg-slate-900 border-slate-700 text-slate-200'}
                                `}
                            >
                                {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <Volume2 className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="p-6 space-y-6">
                {isSinging && (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        {MELODIC_STYLES.map(style => (
                            <button
                                key={style.id}
                                onClick={() => setMelodicStyle(style.id)}
                                className={`
                                    px-3 py-2 rounded-xl text-[10px] font-bold text-center border transition-all
                                    ${melodicStyle === style.id 
                                        ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100' 
                                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    }
                                `}
                            >
                                {style.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative group">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                        placeholder={isSinging ? "Paste lyrics or a rhythmic passage to hear it sung..." : "Paste text to hear it spoken."}
                        className={`
                            w-full h-56 p-6 text-xl text-slate-200 bg-slate-900/50 border rounded-2xl focus:ring-2 outline-none resize-none transition-all placeholder:text-slate-700 leading-relaxed font-light
                            ${isSinging ? 'border-indigo-500/20 focus:ring-indigo-500/40' : 'border-slate-700 focus:ring-cyan-500/40'}
                        `}
                    />
                    <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 bg-black/40 backdrop-blur px-2 py-1 rounded">
                        {text.length} / {MAX_CHARS}
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in zoom-in">
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-rose-200 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <p className="text-xs text-slate-500 italic max-w-xs text-center sm:text-left">
                        {isSinging 
                          ? `Styles work best with short poetic passages (under 150 chars).` 
                          : "High-fidelity natural speech synthesis."}
                     </p>
                     <button
                        onClick={generateSpeech}
                        disabled={isGenerating || !text.trim()}
                        className={`
                            flex items-center gap-3 px-10 py-4 rounded-full font-black uppercase tracking-widest text-white transition-all shadow-xl group
                            ${isGenerating || !text.trim()
                                ? 'bg-slate-700 cursor-not-allowed text-slate-500' 
                                : isSinging 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:-translate-y-1'
                                    : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/30 hover:-translate-y-1'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                {isSinging ? <Mic2 className="w-5 h-5 group-hover:animate-bounce" /> : <Wand2 className="w-5 h-5" />}
                                <span>{isSinging ? 'Sing It!' : 'Generate Voice'}</span>
                            </>
                        )}
                    </button>
                </div>

                {audioUrl && (
                    <div className="mt-8 pt-8 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-500">
                         <div className={`
                             rounded-3xl p-5 border flex flex-col gap-5 relative overflow-hidden
                             ${isSinging ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-900/60 border-slate-700'}
                         `}>
                            {isSinging && (
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                    <Disc className="w-32 h-32 animate-spin-slow" />
                                </div>
                            )}
                            <audio 
                                ref={audioRef} 
                                src={audioUrl} 
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={handleEnded}
                                className="hidden"
                            />

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <button 
                                        onClick={togglePlayback}
                                        className={`
                                            w-14 h-14 flex items-center justify-center rounded-2xl text-white shadow-2xl transition-all flex-shrink-0
                                            ${isSinging ? 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/40' : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/40'}
                                        `}
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </button>
                                    
                                    {/* Speed Controls */}
                                    <div className="flex items-center bg-black/30 p-1 rounded-xl gap-1">
                                        {[1.0, 1.25, 1.5].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setPlaybackSpeed(speed)}
                                                className={`
                                                    px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                                    ${playbackSpeed === speed 
                                                        ? 'bg-slate-700 text-white' 
                                                        : 'text-slate-500 hover:text-slate-300'
                                                    }
                                                `}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center gap-2 w-full">
                                    <div className="relative group/range">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max={duration || 100} 
                                            value={currentTime}
                                            onChange={handleSeek}
                                            className={`
                                                w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all
                                                ${isSinging ? 'accent-indigo-400 bg-indigo-900/40' : 'accent-cyan-400 bg-slate-800'}
                                            `}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono tracking-widest text-slate-500">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleDownload}
                                        className={`p-3 rounded-xl transition-all border ${isSinging ? 'text-indigo-400 hover:text-indigo-200 bg-indigo-500/10 border-indigo-500/20' : 'text-slate-400 hover:text-cyan-400 bg-slate-800 border-slate-700'}`}
                                        title="Download WAV"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            Harmonic Core • Gemini Flash 2.5 TTS
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
            .animate-spin-slow { animation: spin 8s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            input[type=range]::-webkit-slider-thumb {
              appearance: none;
              height: 12px;
              width: 12px;
              border-radius: 50%;
              background: currentColor;
              cursor: pointer;
              transition: transform 0.1s ease-in-out;
            }
            input[type=range]:active::-webkit-slider-thumb {
              transform: scale(1.5);
            }
        `}} />
    </div>
  );
};

export default TTS;
