import React, { useState, useEffect } from 'react';
import { Search, Trash2, Bookmark, Mic, Languages, Calendar, AlertCircle, X, CheckCircle2, Plus, Target, BarChart3, Clock } from 'lucide-react';
import { SavedItem, LearningGoal, SessionLog } from '../types';

const Notebook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memory' | 'goals' | 'progress'>('memory');
  
  // Memory State
  const [items, setItems] = useState<SavedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'vocabulary' | 'pronunciation'>('all');

  // Goals State
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');

  // Progress State
  const [sessions, setSessions] = useState<SessionLog[]>([]);

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = () => {
    try {
      const storedItems = localStorage.getItem('ejiogbe_memory');
      if (storedItems) setItems(JSON.parse(storedItems));

      const storedGoals = localStorage.getItem('ejiogbe_goals');
      if (storedGoals) setGoals(JSON.parse(storedGoals));

      const storedSessions = localStorage.getItem('ejiogbe_sessions');
      if (storedSessions) setSessions(JSON.parse(storedSessions));

    } catch (e) {
      console.error("Failed to load notebook data", e);
    }
  };

  // --- MEMORY LOGIC ---
  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('ejiogbe_memory', JSON.stringify(newItems));
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const searchLower = searchQuery.toLowerCase();
    
    let matchesSearch = false;
    if (item.type === 'vocabulary') {
        matchesSearch = (item.sourceText?.toLowerCase().includes(searchLower) || false) || 
                        (item.translatedText?.toLowerCase().includes(searchLower) || false);
    } else {
        matchesSearch = (item.phrase?.toLowerCase().includes(searchLower) || false) || 
                        (item.correction?.word.toLowerCase().includes(searchLower) || false);
    }

    return matchesFilter && matchesSearch;
  }).sort((a, b) => b.timestamp - a.timestamp);

  // --- GOALS LOGIC ---
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal: LearningGoal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        status: 'active',
        createdAt: Date.now()
    };
    const updatedGoals = [newGoal, ...goals];
    setGoals(updatedGoals);
    localStorage.setItem('ejiogbe_goals', JSON.stringify(updatedGoals));
    setNewGoalText('');
  };

  const toggleGoalStatus = (id: string) => {
      const updatedGoals = goals.map(g => {
          if (g.id === id) {
              return { ...g, status: g.status === 'active' ? 'completed' : 'active' } as LearningGoal;
          }
          return g;
      });
      setGoals(updatedGoals);
      localStorage.setItem('ejiogbe_goals', JSON.stringify(updatedGoals));
  };

  const deleteGoal = (id: string) => {
      const updatedGoals = goals.filter(g => g.id !== id);
      setGoals(updatedGoals);
      localStorage.setItem('ejiogbe_goals', JSON.stringify(updatedGoals));
  };

  // --- PROGRESS LOGIC ---
  const totalTime = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalSessions = sessions.length;
  const avgSessionScore = sessions.length > 0 ? Math.round(sessions.reduce((acc, curr) => acc + curr.averageScore, 0) / sessions.length) : 0;

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8">
      
      {/* Tab Navigation */}
      <div className="flex justify-center">
          <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 inline-flex">
             <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'memory' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Bookmark className="w-4 h-4" />
                Saved Items
             </button>
             <button
                onClick={() => setActiveTab('goals')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'goals' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Target className="w-4 h-4" />
                Goals
             </button>
             <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'progress' ? 'bg-slate-700 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <BarChart3 className="w-4 h-4" />
                Progress
             </button>
          </div>
      </div>

      {/* --- MEMORY TAB --- */}
      {activeTab === 'memory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search vocabulary..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'vocabulary', 'pronunciation'].map((f) => (
                             <button 
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${filter === f ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400' : 'border-transparent text-slate-500 hover:bg-slate-800'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="group bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 transition-all relative flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                {item.type === 'vocabulary' ? (
                                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Languages className="w-4 h-4" /></span>
                                ) : (
                                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Mic className="w-4 h-4" /></span>
                                )}
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.type}</span>
                            </div>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 space-y-2">
                            {item.type === 'vocabulary' ? (
                                <>
                                    <p className="text-slate-300 font-medium line-clamp-2">"{item.sourceText}"</p>
                                    <div className="border-t border-slate-700/50 pt-2">
                                        <p className="text-xl font-serif text-emerald-100 line-clamp-2">{item.translatedText}</p>
                                        <div className="flex justify-between mt-1"><span className="text-xs text-slate-500">{item.sourceLang} → {item.targetLang}</span></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-300 font-serif text-lg">"{item.phrase}"</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className={`text-xl font-bold ${item.score! >= 80 ? 'text-cyan-400' : 'text-orange-400'}`}>{item.score}%</div>
                                        {item.correction && <div className="text-xs bg-slate-900/50 px-2 py-1 rounded text-orange-200 border border-slate-700">Watch: {item.correction.word}</div>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- GOALS TAB --- */}
      {activeTab === 'goals' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-3xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700 p-8">
                  <h3 className="text-xl font-serif font-bold text-slate-200 mb-2">Current Objectives</h3>
                  <p className="text-slate-400 text-sm mb-6">These goals will be shared with your AI tutor to personalize your live sessions.</p>
                  
                  <form onSubmit={handleAddGoal} className="flex gap-2 mb-8">
                      <input 
                        type="text" 
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="e.g., Improve my past tense verbs..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                      <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-colors">
                          <Plus className="w-5 h-5" />
                          <span>Add</span>
                      </button>
                  </form>

                  <div className="space-y-3">
                      {goals.length === 0 && <p className="text-center text-slate-500 py-4 italic">No active goals. Set one to guide your tutor!</p>}
                      
                      {goals.map(goal => (
                          <div key={goal.id} className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${goal.status === 'completed' ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
                              <button 
                                onClick={() => toggleGoalStatus(goal.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${goal.status === 'completed' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500' : 'border-slate-500 text-transparent hover:border-cyan-400'}`}
                              >
                                  <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <span className={`flex-1 font-medium ${goal.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{goal.text}</span>
                              <button onClick={() => deleteGoal(goal.id)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- PROGRESS TAB --- */}
      {activeTab === 'progress' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                      <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Clock className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider">Total Practice</span>
                      </div>
                      <div className="text-3xl font-serif text-slate-100">
                          {Math.floor(totalTime / 60)} <span className="text-lg text-slate-500 font-sans">mins</span>
                      </div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                       <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <Target className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider">Sessions</span>
                      </div>
                      <div className="text-3xl font-serif text-slate-100">{totalSessions}</div>
                  </div>
                   <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                       <div className="flex items-center gap-3 text-slate-400 mb-2">
                          <BarChart3 className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider">Avg. Feedback Score</span>
                      </div>
                      <div className={`text-3xl font-serif ${avgSessionScore >= 80 ? 'text-emerald-400' : avgSessionScore >= 60 ? 'text-orange-400' : 'text-slate-100'}`}>
                          {avgSessionScore}%
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900/30 rounded-3xl border border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-300 mb-4">Recent Sessions</h3>
                  <div className="space-y-4">
                      {sessions.length === 0 ? (
                          <p className="text-slate-500 italic">No sessions recorded yet.</p>
                      ) : (
                          sessions.slice(0, 10).map(session => (
                              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800/50">
                                  <div>
                                      <div className="font-bold text-slate-200">{session.category} <span className="text-slate-500 font-normal text-sm">({session.language})</span></div>
                                      <div className="text-xs text-slate-500 mt-1">{formatDate(session.timestamp)} • {Math.round(session.durationSeconds / 60)} mins</div>
                                  </div>
                                  <div className="mt-2 sm:mt-0 flex items-center gap-4">
                                      <div className="text-right">
                                          <div className="text-xs text-slate-500 uppercase">Avg Score</div>
                                          <div className={`font-mono font-bold ${session.averageScore >= 80 ? 'text-emerald-400' : 'text-orange-400'}`}>{session.averageScore}</div>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-xs text-slate-500 uppercase">Feedback</div>
                                          <div className="font-mono font-bold text-slate-300">{session.feedbackCount}</div>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Notebook;