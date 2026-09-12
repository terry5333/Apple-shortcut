'use client';
import { useState } from 'react';

export default function ShortcutPreview() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 根據動作 ID 自動判斷顏色與圖示，還原 Apple 捷徑的繽紛感
  const getActionTheme = (id) => {
    const lowerId = id.toLowerCase();
    if (lowerId.includes('text')) return { emoji: '📝', bg: 'bg-green-500' };
    if (lowerId.includes('url') || lowerId.includes('web')) return { emoji: '🌐', bg: 'bg-blue-500' };
    if (lowerId.includes('math') || lowerId.includes('count')) return { emoji: '🔢', bg: 'bg-orange-500' };
    if (lowerId.includes('menu') || lowerId.includes('choose')) return { emoji: '📋', bg: 'bg-gray-500' };
    if (lowerId.includes('run') || lowerId.includes('workflow')) return { emoji: '▶️', bg: 'bg-purple-500' };
    if (lowerId.includes('alert') || lowerId.includes('notification')) return { emoji: '💬', bg: 'bg-yellow-500' };
    if (lowerId.includes('clipboard')) return { emoji: '✂️', bg: 'bg-sky-500' };
    if (lowerId.includes('variable')) return { emoji: '🧮', bg: 'bg-rose-500' };
    if (lowerId.includes('dictionary')) return { emoji: '📖', bg: 'bg-teal-500' };
    return { emoji: '⚙️', bg: 'bg-indigo-500' };
  };

  const handlePreview = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    let shortcutId = inputUrl.trim();
    const urlMatch = inputUrl.match(/shortcuts\/([a-zA-Z0-9]+)/);
    if (urlMatch) shortcutId = urlMatch[1];

    if (!shortcutId) {
      setError('請輸入有效的捷徑網址');
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
    // iOS 風格的深淺色網底背景
    <div className="min-h-screen bg-[#F2F2F7] flex justify-center font-sans selection:bg-blue-200">
      
      {/* 模擬手機 / 桌面小工具的容器 */}
      <div className="w-full max-w-md bg-[#F2F2F7] sm:my-10 sm:rounded-[40px] sm:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] sm:border-[8px] sm:border-white sm:h-[800px] overflow-hidden flex flex-col relative">
        
        {/* iOS 風格毛玻璃 Header */}
        <div className="sticky top-0 z-10 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-gray-200/60 px-6 pt-12 pb-4">
          <h1 className="text-3xl font-bold text-black tracking-tight">捷徑預覽</h1>
          <p className="text-gray-500 text-sm mt-1">貼上 iCloud 連結，透視內部動作</p>
        </div>

        {/* 內容區塊，允許捲動 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
          
          {/* 輸入與搜尋區 */}
          <div className="space-y-3">
            <div className="relative shadow-sm rounded-2xl bg-white flex items-center p-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                placeholder="https://www.icloud.com/shortcuts/..."
                className="flex-1 px-3 py-3 bg-transparent text-black text-sm outline-none placeholder:text-gray-400"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
              />
              <button
                onClick={handlePreview}
                disabled={loading}
                className="bg-blue-600 text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center min-w-[80px]"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : '解析'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs px-2 font-medium">{error}</p>}
          </div>

          {/* 解析結果 */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              
              {/* 捷徑標題區 (仿 Apple Shortcuts App 卡片) */}
              <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-black/5 flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-[18px] shadow-sm flex items-center justify-center text-3xl">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{result.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{result.actionCount} 個動作</p>
                </div>
              </div>

              {/* 捷徑動作列表 */}
              <div className="relative mt-6">
                {/* 貫穿所有動作的左側連線 (模擬捷徑流程) */}
                <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

                <div className="space-y-3 relative z-10">
                  {result.actions.map((action) => {
                    const theme = getActionTheme(action.rawId);
                    return (
                      <div key={action.step} className="flex items-center gap-3">
                        {/* 步驟序號 (小圓點) */}
                        <div className="w-[18px] h-[18px] rounded-full bg-gray-200 border-4 border-[#F2F2F7] flex-shrink-0 ml-[30px] z-10"></div>
                        
                        {/* 動作卡片 */}
                        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-black/5 flex items-center gap-3 active:scale-[0.98] transition-transform">
                          {/* 動作 Icon (Squircle 圓角矩形) */}
                          <div className={`w-[42px] h-[42px] ${theme.bg} rounded-[10px] flex items-center justify-center text-white text-lg shadow-inner flex-shrink-0`}>
                            {theme.emoji}
                          </div>
                          
                          {/* 動作文字 */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-[15px] truncate leading-tight">
                              {action.displayName}
                            </p>
                            <p className="text-[12px] text-gray-400 truncate mt-0.5 font-mono">
                              {action.rawId.replace('is.workflow.actions.', '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
