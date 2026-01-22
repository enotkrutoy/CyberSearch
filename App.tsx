
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LogEntry {
  id: number;
  message: string;
  type: 'system' | 'user' | 'info';
}

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: Date.now(), message: 'SYSTEM CORE ONLINE', type: 'system' },
    { id: Date.now() + 1, message: 'ORIGINAL PATTERN LOGIC LOADED', type: 'system' }
  ]);
  const outputRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: 'system' | 'user' | 'info' = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs]);

  const executeSearch = useCallback(() => {
    const term = input.trim();
    if (!term) return;

    addLog(`INITIALIZING SEARCH: ${term}`, 'user');

    // --- ИЗНАЧАЛЬНАЯ ЛОГИКА ФОРМИРОВАНИЯ ЗАПРОСА (v1.3.37) ---
    // Strict preservation of the requested logic
    const wordCount = term.split(' ').length;
    let o = Math.max(32 - wordCount, 1);
    const template = 'site:*.*.%NUM%.* |';
    const urls: string[] = [];
    const maxUrls = 10;

    for (let i = 0; i < maxUrls; i++) {
      let queryPart = '';
      // Цикл генерации гигантского запроса
      for (let ii = 0; ii < (257 - (i * o)); ii++) {
        queryPart += template.replace('%NUM%', ii.toString());
      }
      queryPart = queryPart.slice(0, -1);
      const finalQuery = `(${term}) (${queryPart})`;
      urls.push('https://www.google.com/search?q=' + encodeURIComponent(finalQuery));
    }
    // -------------------------------------------------------

    addLog(`GENERATED ${urls.length} COMPLEX PATTERNS`);
    
    // Launching the primary portal
    addLog("LAUNCHING PORTAL 1...");
    window.open(urls[0], '_blank', 'noopener,noreferrer');

    if (urls.length > 1) {
      addLog("HINT: SYSTEM PREPARED 10 VARIANTS. PORTAL 1 IS ACTIVE.");
    }

    setInput('');
  }, [input, addLog]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl border-2 border-[#00ff00] p-6 md:p-10 shadow-[0_0_25px_rgba(0,255,0,0.2)] bg-black/90 relative overflow-hidden">
      {/* Aesthetic terminal border glow */}
      <div className="absolute inset-0 border border-[#00ff00]/20 pointer-events-none"></div>
      
      <div className="text-center mb-8 tracking-[0.2em] uppercase font-bold text-xl md:text-2xl crt-glow">
        CyberSearch Terminal v2.1.0
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="WAITING FOR COMMAND..."
          autoComplete="off"
          className="flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] p-3 outline-none focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] placeholder:text-[#00ff00]/30 transition-all"
        />
        <button
          onClick={executeSearch}
          className="bg-[#00ff00] text-black px-8 py-3 font-bold hover:bg-[#00ff00]/80 hover:shadow-[0_0_15px_#00ff00] transition-all active:scale-95"
        >
          EXECUTE
        </button>
      </div>

      <div 
        ref={outputRef}
        className="h-48 md:h-64 overflow-y-auto font-mono text-sm border-t border-[#00ff00]/30 pt-4 custom-scrollbar"
      >
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`mb-1 ${
              log.type === 'system' ? 'text-gray-500' : 
              log.type === 'user' ? 'text-[#00ff00]' : 
              'text-[#00ff00]/70'
            }`}
          >
            {`> ${log.message}`}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-[10px] opacity-40 uppercase tracking-widest">
        <span>Kernel: 1.3.37-LTS</span>
        <span>Secure Connection: Active</span>
      </div>
    </div>
  );
};

export default App;
