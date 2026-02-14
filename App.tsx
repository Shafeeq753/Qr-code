
import React, { useState, useCallback, useRef } from 'react';
import { QRState, ExportFormat, QRMetadata } from './types';
import { getLinkMetadata } from './services/geminiService';
import QRGenerator from './components/QRGenerator';

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [state, setState] = useState<QRState>({
    url: '',
    metadata: null,
    isGenerating: false,
    error: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl) return;

    let validUrl = inputUrl;
    if (!inputUrl.startsWith('http')) {
      validUrl = `https://${inputUrl}`;
    }

    try {
      new URL(validUrl); // Validate format
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      // Parallelize generation and metadata fetching for UX
      const meta = await getLinkMetadata(validUrl);
      setState({
        url: validUrl,
        metadata: meta,
        isGenerating: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      // Fallback if AI fails
      const domain = new URL(validUrl).hostname;
      setState({
        url: validUrl,
        metadata: {
          title: domain,
          category: 'Link',
          suggestedFileName: 'qr_code',
          description: `QR Code for ${validUrl}`
        },
        isGenerating: false,
        error: null,
      });
    }
  };

  const download = (format: ExportFormat) => {
    if (!canvasRef.current || !state.metadata) return;

    const extension = format === ExportFormat.PNG ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.download = `${state.metadata.suggestedFileName}.${extension}`;
    link.href = canvasRef.current.toDataURL(format, 1.0);
    link.click();
  };

  const onCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
            <i className="fa-solid fa-qrcode text-3xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">QuickQR AI</h1>
          <p className="text-slate-500 mt-2">Generate elegant, AI-labeled QR codes in seconds.</p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-100/50">
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Paste your link here (e.g., google.com)"
                className="w-full pl-4 pr-32 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={state.isGenerating || !inputUrl}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium rounded-xl transition-all flex items-center gap-2"
              >
                {state.isGenerating ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    <span>Generate</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
            </div>
            {state.error && <p className="text-red-500 text-sm pl-2">{state.error}</p>}
          </form>

          {state.url && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* QR Display */}
                <div className="flex flex-col items-center">
                  <QRGenerator url={state.url} onCanvasReady={onCanvasReady} />
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => download(ExportFormat.PNG)}
                      className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-download"></i> PNG
                    </button>
                    <button 
                      onClick={() => download(ExportFormat.JPEG)}
                      className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-download"></i> JPG
                    </button>
                  </div>
                </div>

                {/* Info Display */}
                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-md mb-2">
                      {state.metadata?.category || 'Link'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                      {state.metadata?.title || 'Generated QR'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      {state.metadata?.description || 'Scan the code to visit the linked URL.'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target URL</div>
                    <p className="text-xs text-indigo-600 font-medium truncate">{state.url}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
                    <span>AI Enhanced Metadata</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <p>© {new Date().getFullYear()} QuickQR AI. Simple, clean, and private.</p>
          <div className="flex items-center gap-1 font-medium text-slate-500">
            <span>Built by</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100/50">Shafeeq</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
