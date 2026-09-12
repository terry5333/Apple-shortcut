'use client';
import { useState } from 'react';

export default function ShortcutPreview() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    let shortcutId = inputUrl.trim();
    const urlMatch = inputUrl.match(/shortcuts\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      shortcutId = urlMatch[1];
    }

    if (!shortcutId) {
      setError('請輸入有效的捷徑網址或 ID');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/shortcut?id=${shortcutId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 使用微漸層背景
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6 md:p-12 font-sans selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* 標題與搜尋區塊 */}
        <div className="text-center space-y-2 pt-8 mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            捷徑預覽器
          </h1>
          <p className="text-gray-500">免下載，直接看透朋友傳來的 Apple 捷徑在做什麼</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-sm border border-white/50">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="貼上 https://www.icloud.com/shortcuts/..."
              className="flex-1 px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-700"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
            />
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-medium rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95 flex justify-center items-center gap-2 min-w-[120px]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : '開始解析'}
            </button>
          </div>
          {error && <p className="text-rose-500 mt-4 text-sm px-2 flex items-center gap-1">⚠️ {error}</p>}
        </div>

        {/* 結果渲染區塊 */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 捷徑標題卡片 */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-3xl">🤖</span> {result.name}
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-1.5 rounded-full">
                共 {result.actionCount} 個動作
              </span>
            </div>

            {/* 動作列表 */}
            <div className="space-y-3">
              {result.actions.map((action) => (
                <div 
                  key={action.step} 
                  className="group bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex gap-4 md:gap-5 items-center"
                >
                  {/* Apple 風格的圓角漸層 Icon */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl text-white font-bold text-lg shadow-inner">
                    {action.step}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-lg truncate">
                      {action.displayName}
                    </p>
                    <p className="text-sm text-gray-400 truncate mt-0.5 font-mono">
                      {action.rawId.replace('is.workflow.actions.', '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
