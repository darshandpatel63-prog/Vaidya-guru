import React, { useState, useEffect, useRef } from 'react';
import { Book, User, Language, Message, CustomSource } from '../types';
// Fixed the missing export by importing generateSpeech instead of generatePodcastAudio
import { getStudyDeskResponse, generatePodcastScript, generateSpeech, decode, decodeAudioData } from '../geminiService';
import { BannerAd, BannerAdSize, TestIds, RewardedAd } from './BannerAd';
import { MOCK_BOOKS } from '../constants';

const STORAGE_PINNED = 'vaidyaguru_pinned_books';
const STORAGE_CUSTOM = 'vaidyaguru_custom_sources';

const UI_STRINGS = {
  [Language.ENGLISH]: { title: "Study Desk", add: "Add Source", upload: "Upload PDF/Img", empty: "Your desk is empty. Pin books or upload files.", podcast: "Shaastra Chintan (Audio)", synthesis: "Synthesizing Research...", ask: "Ask all sources...", sources: "Pinned Sources" },
  [Language.GUJARATI]: { title: "અભ્યાસ ડેસ્ક", add: "સ્ત્રોત ઉમેરો", upload: "PDF/ઈમેજ અપલોડ", empty: "તમારો ડેસ્ક ખાલી છે. પુસ્તકો પિન કરો અથવા ફાઇલો અપલોડ કરો.", podcast: "શાસ્ત્ર ચિંતન (ઓડિયો)", synthesis: "સંશોધનનું સંશ્લેષણ...", ask: "બધા સ્ત્રોતોને પૂછો...", sources: "પિન કરેલા સ્ત્રોતો" },
  [Language.HINDI]: { title: "अध्ययन डेस्क", add: "स्रोत जोड़ें", upload: "PDF/इमेज अपलोड", empty: "आपका डेस्क खाली है। किताबें पिन करें या फाइलें अपलोड करें।", podcast: "शास्त्र चिंतन (ऑडियो)", synthesis: "अनुसंधान का संश्लेषण...", ask: "सभी स्रोतों से पूछें...", sources: "पिन किए गए स्रोत" }
};

export const StudyDesk: React.FC<{ user: User }> = ({ user }) => {
  const [pinnedBooks, setPinnedBooks] = useState<Book[]>([]);
  const [customSources, setCustomSources] = useState<CustomSource[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPodcastLoading, setIsPodcastLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = UI_STRINGS[user.preferredLanguage || Language.ENGLISH];

  useEffect(() => {
    const savedPinned = localStorage.getItem(STORAGE_PINNED);
    const savedCustom = localStorage.getItem(STORAGE_CUSTOM);
    if (savedPinned) setPinnedBooks(JSON.parse(savedPinned));
    if (savedCustom) setCustomSources(JSON.parse(savedCustom));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_PINNED, JSON.stringify(pinnedBooks));
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(customSources));
  }, [pinnedBooks, customSources]);

  const handleAddBook = (book: Book) => {
    if (pinnedBooks.find(b => b.id === book.id)) return;
    setPinnedBooks([...pinnedBooks, book]);
    setShowPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        const newSource: CustomSource = {
          id: 'custom_' + Date.now() + Math.random(),
          title: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          data: base64
        };
        setCustomSources(prev => [...prev, newSource]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSource = (id: string, isCustom: boolean) => {
    if (isCustom) setCustomSources(customSources.filter(s => s.id !== id));
    else setPinnedBooks(pinnedBooks.filter(b => b.id !== id));
  };

  const handleSend = async () => {
    if (!input.trim() || (pinnedBooks.length === 0 && customSources.length === 0)) return;
    
    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getStudyDeskResponse(input, pinnedBooks, customSources, user);
      const aiMsg: Message = { role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Wisdom connection failed.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startPodcast = () => {
    if (pinnedBooks.length === 0) return;
    RewardedAd.show(async () => {
      setIsPodcastLoading(true);
      try {
        const script = await generatePodcastScript(pinnedBooks);
        // Using generateSpeech to convert script to audio
        const audio = await generateSpeech(script);
        if (audio) {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const buffer = await decodeAudioData(decode(audio), audioCtx, 24000, 1);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start();
        }
      } catch (e) {
        alert("Audio generation failed.");
      } finally {
        setIsPodcastLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f5f0] overflow-hidden relative">
      <header className="p-6 bg-amber-900 text-white shadow-xl z-20 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold serif-font">{t.title}</h2>
          <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{pinnedBooks.length + customSources.length} Sources Active</p>
        </div>
        <div className="flex gap-2">
          {pinnedBooks.length > 0 && (
            <button onClick={startPodcast} disabled={isPodcastLoading} className="p-3 bg-amber-600 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-amber-500 transition-all disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <span className="hidden sm:inline text-xs font-bold">{isPodcastLoading ? 'Loading...' : t.podcast}</span>
            </button>
          )}
          <button onClick={() => setShowPicker(true)} className="p-3 bg-white text-amber-900 rounded-2xl shadow-lg font-bold text-xs hover:bg-stone-100">+ {t.add}</button>
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-amber-800 text-white rounded-2xl shadow-lg font-bold text-xs hover:bg-amber-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="application/pdf,image/*" />
        </div>
      </header>

      {/* Desk Surface */}
      <div className="p-4 bg-amber-50 border-b border-amber-100 flex gap-4 overflow-x-auto no-scrollbar">
        {(pinnedBooks.length === 0 && customSources.length === 0) ? (
          <div className="w-full text-center py-4 opacity-40 text-sm font-bold">{t.empty}</div>
        ) : (
          <>
            {pinnedBooks.map(book => (
              <div key={book.id} className="flex-shrink-0 w-24 relative group">
                <img src={book.coverImage} className="w-full aspect-[3/4] object-cover rounded-lg shadow-md border-2 border-white" alt="" />
                <button onClick={() => handleRemoveSource(book.id, false)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <p className="text-[8px] font-bold mt-1 text-amber-900 truncate">{book.title}</p>
              </div>
            ))}
            {customSources.map(s => (
              <div key={s.id} className="flex-shrink-0 w-24 relative group">
                <div className={`w-full aspect-[3/4] flex items-center justify-center rounded-lg shadow-md border-2 border-white ${s.type === 'pdf' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  {s.type === 'pdf' ? (
                    <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /></svg>
                  ) : (
                    <img src={`data:image/jpeg;base64,${s.data}`} className="w-full h-full object-cover rounded-lg" alt="" />
                  )}
                </div>
                <button onClick={() => handleRemoveSource(s.id, true)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <p className="text-[8px] font-bold mt-1 text-amber-900 truncate">{s.title}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-48">
        <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${m.role === 'user' ? 'bg-amber-900 text-white rounded-tr-none' : 'bg-white border border-amber-100 text-stone-800 rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center py-4 animate-pulse text-amber-900 font-bold text-xs">{t.synthesis}</div>}
      </div>

      {showPicker && (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold serif-font text-amber-900">Choose Source to Pin</h3>
              <button onClick={() => setShowPicker(false)} className="text-stone-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="overflow-y-auto space-y-2 no-scrollbar">
              {MOCK_BOOKS.filter(b => b.sthanas.length > 0).map(book => (
                <button key={book.id} onClick={() => handleAddBook(book)} className="w-full flex items-center gap-4 p-3 rounded-2xl border hover:bg-amber-50 transition-all text-left">
                  <img src={book.coverImage} className="w-12 h-16 object-cover rounded-lg shadow-sm" alt="" />
                  <div>
                    <p className="font-bold text-sm text-stone-800">{book.title}</p>
                    <p className="text-[10px] text-stone-400 uppercase font-black">{book.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8f5f0] via-[#f8f5f0] to-transparent">
        <div className="max-w-4xl mx-auto flex gap-3 items-end bg-white border-2 border-amber-100 rounded-3xl shadow-xl p-2">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={pinnedBooks.length + customSources.length > 0 ? t.ask : "Pin sources first..."} 
            rows={1}
            className="flex-1 px-4 py-3 bg-transparent outline-none font-medium text-stone-700 resize-none min-h-[50px] max-h-[150px] overflow-y-auto" 
          />
          <button onClick={handleSend} disabled={isLoading} className="p-4 bg-amber-900 text-white rounded-2xl shadow-xl hover:bg-amber-800 active:scale-95 disabled:opacity-50 transition-all self-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
        </div>
      </div>
    </div>
  );
};
                  
