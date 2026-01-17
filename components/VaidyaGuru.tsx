import React, { useState, useRef, useEffect } from 'react';
import { getVaidyaGuruResponse, generateAyurvedicImage, generateSpeech, encode, decode, decodeAudioData } from '../geminiService';
import { FilePart, ChatSession, Message, User, Language, Role, MedicalField } from '../types';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, RewardedAd } from './BannerAd';

const LOGO_URL = 'assets/logo.png';
const STORAGE_KEY_SESSIONS = 'vaidyaguru_chat_sessions';

const UI_STRINGS = {
  [Language.ENGLISH]: { consult: "Consulting Shastras...", clinical: "Analyzing Clinical Data...", case: "New Case", history: "History", ask: "Ask VaidyaGuru...", clinicalAsk: "Ask Consultant...", welcome: "Jay Dhanvantari", welcomeMed: "Clinical Center", del: "Delete Session" },
  [Language.GUJARATI]: { consult: "શાસ્ત્રોની સલાહ...", clinical: "ક્લિનિકલ ડેટા વિશ્લેષણ...", case: "નવો કેસ", history: "ઇતિહાસ", ask: "વૈદ્યગુરુને પૂછો...", clinicalAsk: "કન્સલ્ટન્ટને પૂછો...", welcome: "જય ધન્વંતરિ", welcomeMed: "ક્લિનિકલ સેન્ટર", del: "સત્ર કાઢી નાખો" },
  [Language.HINDI]: { consult: "शास्त्रों का परामर्श...", clinical: "क्लिनिकल डेटा विश्लेषण...", case: "नया केस", history: "इतिहास", ask: "वैद्यगुरु से पूछें...", clinicalAsk: "कंसल्टेंट से पूछें...", welcome: "जय धन्वंतरि", welcomeMed: "क्लिनिकल सेंटर", del: "शास्त्रों का परामर्श..." }
};

const FlippingBook: React.FC<{ lang: Language, isBAMS: boolean }> = ({ lang, isBAMS }) => {
  const s = UI_STRINGS[lang];
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="book-animation relative w-8 h-6">
        <div className={`absolute inset-0 border-2 ${isBAMS ? 'border-green-800' : 'border-blue-800'} rounded-sm`}></div>
        <div className={`absolute inset-y-0 left-1/2 w-0.5 ${isBAMS ? 'bg-green-800' : 'bg-blue-800'}`}></div>
        <div className={`page-flip absolute top-0 right-0 w-1/2 h-full bg-white border-y-2 border-r-2 ${isBAMS ? 'border-green-800' : 'border-blue-800'} origin-left`}></div>
      </div>
      <span className={`text-sm font-bold serif-font ${isBAMS ? 'text-green-900' : 'text-blue-900'} tracking-wide`}>{isBAMS ? s.consult : s.clinical}</span>
      <style>{`
        .book-animation { perspective: 100px; }
        .page-flip { animation: flip 1.2s infinite ease-in-out; transform-style: preserve-3d; }
        @keyframes flip { 0% { transform: rotateY(0deg); } 50% { transform: rotateY(-180deg); } 100% { transform: rotateY(-180deg); opacity: 0; } }
      `}</style>
    </div>
  );
};

const MarkdownRenderer: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  const renderText = (text: string) => {
    const formatted = text
      .replace(/^# (.*?)(\n|$)/gm, '<h1 class="text-[20px] font-bold mt-4 mb-2 text-[#1a1a1a] leading-tight">$1</h1>')
      .replace(/^## (.*?)(\n|$)/gm, '<h2 class="text-[18px] font-bold mt-4 mb-2 text-[#1a1a1a] leading-tight">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1a1a1a]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n/g, '<br/>');
    return <span className="inline text-[16px] leading-relaxed" style={{ color: isUser ? '#ffffff' : '#1a1a1a' }} dangerouslySetInnerHTML={{ __html: formatted }} />;
  };
  return <div>{renderText(content)}</div>;
};

export const VaidyaGuru: React.FC<{ user: User }> = ({ user }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FilePart[]>([]);
  const [useThinking, setUseThinking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appLang = user.preferredLanguage || Language.ENGLISH;
  const isBAMS = user.medicalField === MedicalField.BAMS;
  const s = UI_STRINGS[appLang];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) { startNewConsultation(); }
    } else { startNewConsultation(); }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [sessions, currentSessionId, isTyping]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  const messages = currentSession?.messages || [];

  const startNewConsultation = () => {
    const newSession: ChatSession = {
      id: 'case_' + Date.now(),
      title: s.case + " " + (sessions.length + 1),
      messages: [],
      lastModified: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setInput('');
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(s.del + "?")) return;
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      if (filtered.length === 0) startNewConsultation();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        setPendingFiles(prev => [...prev, { mimeType: file.type, data: base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && pendingFiles.length === 0) return;
    const userMsg = input || (pendingFiles.length > 0 ? "Analyze clinical documents." : "");
    const currentFiles = [...pendingFiles];
    const newMessage: Message = { role: 'user', content: userMsg, attachments: currentFiles.length > 0 ? currentFiles : undefined, timestamp: Date.now() };
    const updatedMessages = [...messages, newMessage];
    
    setSessions(prev => prev.map(session => session.id === currentSessionId ? { ...session, messages: updatedMessages, lastModified: Date.now() } : session));
    setInput('');
    setPendingFiles([]);
    setIsTyping(true);

    try {
      const historyForAI = updatedMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model' as 'user' | 'model', parts: [{ text: m.content }] }));
      const response = await getVaidyaGuruResponse(userMsg, user, historyForAI, currentFiles, useThinking);
      const assistantMessage: Message = { role: 'assistant', content: response.text, timestamp: Date.now() };
      setSessions(prev => prev.map(session => session.id === currentSessionId ? { ...session, messages: [...updatedMessages, assistantMessage], lastModified: Date.now() } : session));
    } catch (error) {
      setSessions(prev => prev.map(session => session.id === currentSessionId ? { ...session, messages: [...updatedMessages, { role: 'assistant', content: "Connection issue. Please retry.", timestamp: Date.now() }], lastModified: Date.now() } : session));
    } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#fdfaf5] overflow-hidden relative">
      <header className={`sticky top-0 ${isBAMS ? 'bg-green-900' : 'bg-blue-900'} text-white p-6 flex justify-between items-center z-30 shadow-lg`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 bg-white/10 rounded-xl transition-transform active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
          <img src={LOGO_URL} className="w-10 h-10 object-contain" alt="" />
          <h2 className="hidden sm:block font-bold serif-font">{isBAMS ? s.welcome : s.welcomeMed}</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setUseThinking(!useThinking)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-md active:scale-95 ${useThinking ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200' : (isBAMS ? 'bg-green-800' : 'bg-blue-800') + ' text-white/50'}`}>{useThinking ? 'Deep ON' : 'Deep OFF'}</button>
           <button onClick={startNewConsultation} className="p-3 bg-white text-stone-900 rounded-2xl shadow-lg transition-transform active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
        </div>
      </header>

      {showHistory && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-[85%] max-w-sm h-full bg-white p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold serif-font text-stone-800">{s.history}</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 text-stone-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
              {sessions.map(sess => (
                <div key={sess.id} onClick={() => { setCurrentSessionId(sess.id); setShowHistory(false); }} className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${sess.id === currentSessionId ? (isBAMS ? 'bg-green-50 border-green-800' : 'bg-blue-50 border-blue-800') + ' shadow-sm' : 'bg-white border-stone-100 hover:border-stone-200'}`}>
                  <p className="font-bold text-sm truncate flex-1 text-stone-700">{sess.title}</p>
                  <button onClick={(e) => deleteSession(sess.id, e)} className="p-2 text-stone-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fdfaf5] no-scrollbar pb-48">
        <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2.5rem] shadow-sm animate-in zoom-in-95 duration-200 ${m.role === 'user' ? (isBAMS ? 'bg-green-900' : 'bg-blue-900') + ' text-white rounded-tr-none' : 'bg-white border border-stone-100 text-stone-800 rounded-tl-none'}`}>
              <div className="flex flex-wrap gap-2 mb-3">
                {m.attachments?.map((att, aIdx) => (
                  att.mimeType.includes('pdf') ? 
                  <div key={aIdx} className="bg-white/10 p-3 rounded-xl text-[10px] font-bold border border-white/20 flex items-center gap-2">📄 PDF Document</div> :
                  <img key={aIdx} src={`data:${att.mimeType};base64,${att.data}`} className="w-32 rounded-xl border border-white/20 shadow-md" alt="" />
                ))}
              </div>
              <MarkdownRenderer content={m.content} isUser={m.role === 'user'} />
            </div>
          </div>
        ))}
        {isTyping && <FlippingBook lang={appLang} isBAMS={isBAMS} />}
        <div ref={scrollRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fdfaf5] via-[#fdfaf5] to-transparent">
        <div className="max-w-4xl mx-auto space-y-3">
          {pendingFiles.length > 0 && (
            <div className="flex gap-2 p-3 bg-white/80 backdrop-blur rounded-3xl overflow-x-auto shadow-sm border border-stone-100 no-scrollbar">
              {pendingFiles.map((f, i) => (
                <div key={i} className="relative flex-shrink-0 animate-in zoom-in-50 duration-200">
                  {f.mimeType.includes('pdf') ? <div className="w-14 h-20 bg-red-100 rounded-xl flex items-center justify-center text-[10px] font-black text-red-700 border border-red-200 shadow-sm uppercase">PDF</div> : <img src={`data:${f.mimeType};base64,${f.data}`} className="w-14 h-20 object-cover rounded-xl border border-white shadow-sm" alt="" />}
                  <button onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 items-end bg-white border-2 border-stone-100 rounded-[2.5rem] shadow-2xl p-2 transition-all focus-within:border-stone-800/10">
            <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-stone-100 text-stone-600 rounded-[2rem] hover:bg-stone-200 transition-all self-center shadow-inner"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="application/pdf,image/*" />
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={isBAMS ? s.ask : s.clinicalAsk} 
              rows={1}
              className="flex-1 px-4 py-4 bg-transparent outline-none font-medium text-stone-800 resize-none min-h-[55px] max-h-[180px] overflow-y-auto serif-font text-lg" 
            />
            <button onClick={handleSend} disabled={isTyping} className={`p-5 ${isBAMS ? 'bg-green-900' : 'bg-blue-900'} text-white rounded-[2rem] shadow-xl hover:opacity-90 transition-all self-center disabled:opacity-50 active:scale-90`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};
  
