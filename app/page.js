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

    // 自動萃取捷徑 ID (支援貼上完整網址或純 ID)
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* 搜尋區塊 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">捷徑預覽器</h1>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="貼上 iCloud 捷徑連結..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
            />
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '解析中...' : '預覽'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>

        {/* 結果渲染區塊 */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{result.name}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                共 {result.actionCount} 個動作
              </span>
            </div>

            <div className="space-y-3">
              {result.actions.map((action) => (
                <div key={action.step} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-mono text-sm">
                    {action.step}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate">
                      {action.identifier}
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

