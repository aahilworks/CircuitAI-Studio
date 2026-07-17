'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import AuthModal from '@/lib/components/AuthModal';
import { 
  Cpu, Terminal, List, ArrowRight, ShieldAlert, Sparkles, RefreshCw, 
  Wrench, Plus, MonitorPlay, ShoppingCart, Code2, Download, Edit3
} from 'lucide-react';

interface BOMItem { item: string; quantity: number; }
interface Connection { from: string; to: string; }
interface ProjectData {
  project_title: string; target_board: string; bill_of_materials: BOMItem[]; tools_needed: string[]; 
  connections: Connection[]; warnings: string[]; steps: string[]; code: string;
  secondary_code?: string; secondary_language?: string;
  youtube_search_query?: string; assistant_response?: string;
}
interface ChatSession { id: string; title: string; target_board: string; lastUpdated: string; projectData: ProjectData | null; }

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState(''); 
  const [board, setBoard] = useState('Arduino Uno');
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false); 
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  
  const [activeTab, setActiveTab] = useState<'code' | 'secondary' | 'wiring' | 'guide'>('code');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Synchronize Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => { 
      setCurrentUser(user);
      if (!user) { setHistorySessions([]); resetWorkspace(); }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Sidebar Thread List (Static Firestore Implementation)
  const fetchSidebarHistory = async (userId: string) => {
    try {
      const q = query(collection(db, 'users', userId, 'chatSessions'), orderBy('lastUpdated', 'desc'));
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatSession[];
      setHistorySessions(sessions);
    } catch (err) { 
      console.error("Sidebar history loading failed:", err); 
    }
  };

  useEffect(() => {
    if (currentUser) fetchSidebarHistory(currentUser.uid);
  }, [currentUser]);

  // Write Data Matrix to User Profile Root (Static Firestore Implementation)
  const saveProjectToFirestore = async (userId: string, sessionId: string, project: ProjectData) => {
    try {
      const docRef = doc(db, 'users', userId, 'chatSessions', sessionId);
      await setDoc(docRef, {
        id: sessionId,
        title: project.project_title || "Untitled Matrix Build",
        target_board: project.target_board,
        lastUpdated: new Date().toISOString(),
        projectData: project
      }, { merge: true });
      
      // Forces immediate local visual refresh on the UI thread
      fetchSidebarHistory(userId);
    } catch (err) { 
      console.error("Firestore persistence layer transaction error:", err); 
    }
  };

  const resetWorkspace = () => {
    setCurrentSessionId(null);
    setData(null);
    setPrompt('');
    setModifyPrompt('');
  };

  const resumeSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setData(session.projectData);
    setBoard(session.target_board || 'Arduino Uno');
    setPrompt('');
    setModifyPrompt('');
    setActiveTab('code');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await executeAIBuild(prompt, false);
  };

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyPrompt.trim() || !data) return;
    
    const contextPrompt = `I have an existing project called "${data.project_title}". 
    Original prompt was: ${prompt || 'Unknown'}. 
    Please MODIFY this build with the following updates: ${modifyPrompt}. 
    Ensure you return the FULL updated project schema, including any new wiring or code needed.`;
    
    await executeAIBuild(contextPrompt, true);
    setModifyPrompt(''); 
  };

  const executeAIBuild = async (queryToSend: string, isModification: boolean) => {
    if (isModification) setModifying(true);
    else setLoading(true);
    
    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!isModification) setCurrentSessionId(sessionId);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryToSend, board }),
      });
      
      if (!response.ok) throw new Error("API Route rejection");
      
      const result = (await response.json()) as ProjectData;
      setData(result);
      setActiveTab('code');

      // Patched: Auto-saves modifications to the exact same database key structure instantly
      if (currentUser) {
        await saveProjectToFirestore(currentUser.uid, sessionId, result);
      }
    } catch (error) {
      console.error(error);
      alert("Compilation or save pipeline execution failure.");
    } finally {
      setLoading(false);
      setModifying(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const openCartTab = (item: string) => {
    const cleanItem = encodeURIComponent(item);
    window.open(`https://www.amazon.com/s?k=${cleanItem}+electronic+component`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-cyan-500/30">
      
      {/* App Header Bar */}
      <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-950 z-20">
        <div className="flex items-center gap-3">
          <span className="font-black text-xs text-cyan-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">⚡ CAI</span>
          <h1 className="text-lg font-black tracking-wider">CIRCUIT<span className="text-cyan-400">AI</span></h1>
        </div>
        <button type="button" onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 border border-slate-800 px-4 py-1.5 rounded-xl text-xs bg-slate-900 text-slate-400 hover:text-slate-200 transition">
          {currentUser ? currentUser.email?.split('@')[0] : 'Sign In'}
        </button>
      </header>

      {/* Debugger Connection Anchor Check */}
      <div className="bg-slate-900/40 px-6 py-1 text-[10px] text-slate-500 border-b border-slate-900">
        Database Status Monitor: {currentUser ? `🟢 Secure Link Established (UID: ${currentUser.uid.slice(0,6)}...)` : "🔴 Offline / Storage Intercept Mode Enabled"}
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation History Sidebar Component */}
        <aside className="w-64 border-r border-slate-900 bg-slate-950/40 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4">
            <button onClick={resetWorkspace} className="w-full h-10 border border-dashed border-slate-800 rounded-xl text-xs flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-400 transition">
              <Plus className="h-3.5 w-3.5" /> New Project Thread
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {historySessions.map(s => (
              <button key={s.id} onClick={() => resumeSession(s)} className={`w-full px-3 py-2 rounded-xl text-left text-xs truncate transition ${currentSessionId === s.id ? 'bg-slate-900 text-cyan-400 border border-slate-800' : 'text-slate-400 hover:bg-slate-900/60'}`}>
                📁 {s.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Primary Interactive Workspace Dashboard Console */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
          
          {/* Main Initial Generation Form Console Module */}
          {!data && (
            <form onSubmit={handleGenerate} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-end">
              <div className="w-full flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Matrix Blueprint Specs</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="E.g., Create an ultrasonic radar using Processing GUI..." className="w-full h-16 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none resize-none" required />
              </div>
              <div className="w-full lg:w-64">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Target Hardware</label>
                <input type="text" value={board} onChange={(e) => setBoard(e.target.value)} className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-slate-100 text-xs focus:outline-none" required />
              </div>
              <button type="submit" disabled={loading} className="w-full lg:w-auto h-11 px-5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition shrink-0">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Compile Build
              </button>
            </form>
          )}

          {data ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Workspace Main Output Segment Panels */}
              <div className="xl:col-span-8 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex border border-slate-900 bg-slate-950 p-1 rounded-xl max-w-xl overflow-x-auto">
                    <button type="button" onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-xs uppercase rounded-lg transition shrink-0 ${activeTab === 'code' ? 'bg-slate-900 text-cyan-400' : 'text-slate-500'}`}>Primary Code</button>
                    
                    {data.secondary_code && (
                      <button type="button" onClick={() => setActiveTab('secondary')} className={`px-4 py-1.5 text-xs uppercase rounded-lg transition shrink-0 ${activeTab === 'secondary' ? 'bg-slate-900 text-cyan-400 font-bold border border-slate-800/80' : 'text-slate-400 hover:text-slate-200'}`}>Companion UI</button>
                    )}
                    
                    <button type="button" onClick={() => setActiveTab('wiring')} className={`px-4 py-1.5 text-xs uppercase rounded-lg transition shrink-0 ${activeTab === 'wiring' ? 'bg-slate-900 text-cyan-400' : 'text-slate-500'}`}>Wiring</button>
                    <button type="button" onClick={() => setActiveTab('guide')} className={`px-4 py-1.5 text-xs uppercase rounded-lg transition shrink-0 ${activeTab === 'guide' ? 'bg-slate-900 text-cyan-400' : 'text-slate-500'}`}>Assembly</button>
                  </div>
                </div>

                {/* Primary Board Output Display Container */}
                {activeTab === 'code' && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-900 text-xs">
                      <span className="text-slate-400">firmware.ino</span>
                      <button type="button" onClick={() => downloadFile(data.code, 'firmware.ino')} className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 px-2 py-1 rounded-md flex items-center gap-1 transition"><Download className="h-3 w-3" /> Download</button>
                    </div>
                    <pre className="p-4 text-xs text-emerald-400 max-h-96 overflow-y-auto whitespace-pre-wrap"><code>{data.code}</code></pre>
                  </div>
                )}

                {/* Companion Subsystem Processing Script Window */}
                {activeTab === 'secondary' && data.secondary_code && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-900 text-xs">
                      <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" /> Companion System ({data.secondary_language || 'script'})</span>
                      <button type="button" onClick={() => downloadFile(data.secondary_code!, `companion.${data.secondary_language || 'txt'}`)} className="bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-400 px-2 py-1 rounded-md flex items-center gap-1 transition"><Download className="h-3 w-3" /> Download</button>
                    </div>
                    <pre className="p-4 text-xs text-indigo-400 max-h-96 overflow-y-auto whitespace-pre-wrap"><code>{data.secondary_code}</code></pre>
                  </div>
                )}

                {/* Pin Connection Maps */}
                {activeTab === 'wiring' && (
                  <div className="space-y-2">
                    {data.connections?.map((conn, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-cyan-400 font-bold">{conn.from}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-700" />
                        <span className="text-indigo-400 font-bold">{conn.to}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step Instructions Assembly Panels */}
                {activeTab === 'guide' && (
                  <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4 text-xs">
                    <h3 className="text-cyan-400 font-bold uppercase tracking-wider">Construction Routine</h3>
                    <div className="space-y-3">
                      {data.steps?.map((step, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex gap-3 text-slate-300">
                          <span className="text-cyan-500 font-black">[{idx + 1}]</span>
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-Time Live Revision Command Node Input */}
                <form onSubmit={handleModify} className="bg-cyan-950/10 border border-cyan-900/30 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-cyan-900/20 rounded-lg text-cyan-500"><Edit3 className="h-5 w-5" /></div>
                  <input 
                    type="text" 
                    value={modifyPrompt} 
                    onChange={(e) => setModifyPrompt(e.target.value)} 
                    placeholder="Modify this build (e.g., 'Add a buzzer', 'Switch GUI theme colors to Red')..." 
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                  <button type="submit" disabled={modifying} className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 rounded-xl text-xs font-bold uppercase transition flex items-center gap-2">
                    {modifying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Update Build'}
                  </button>
                </form>

                {/* Video Resource Lookups with Safe MonitorPlay Icon Injection */}
                {data.youtube_search_query && (
                  <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 shrink-0"><MonitorPlay className="h-5 w-5" /></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Video Tutorials</h4>
                        <p className="text-[11px] text-slate-500">Launch targeted video walk-through lookups.</p>
                      </div>
                    </div>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtube_search_query)}`} target="_blank" rel="noopener noreferrer" className="h-9 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-1.5 transition shrink-0">
                      Open YouTube
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar Accessory Elements Columns */}
              <div className="xl:col-span-4 space-y-4 text-xs">
                {data.warnings && data.warnings.length > 0 && (
                  <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl">
                    <h3 className="text-red-400 font-bold uppercase mb-2 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Safeguards</h3>
                    <ul className="list-disc pl-4 space-y-1 text-red-300/90">
                      {data.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                  <h3 className="text-slate-400 mb-2 uppercase font-bold">Required Materials</h3>
                  <div className="space-y-2">
                    {data.bill_of_materials?.map((bom, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-950/80 py-1.5 text-slate-300">
                        <span className="truncate pr-2">{bom.item} <span className="text-cyan-500 font-bold">x{bom.quantity}</span></span>
                        <button type="button" onClick={() => openCartTab(bom.item)} className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-900/50 transition shrink-0" title="Find on Store">
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {data.tools_needed && data.tools_needed.length > 0 && (
                  <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                    <h3 className="text-slate-400 mb-2 uppercase font-bold flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> Workspace Tools</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.tools_needed.map((tool, i) => (
                        <span key={i} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-slate-400 text-[11px]">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-900 rounded-2xl flex items-center justify-center text-slate-600 text-xs">SYSTEM CONSOLE IDLE</div>
          )}
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
    </div>
  );
}