import {
  Download,
  Laptop,
  Maximize2,
  Minus,
  Smartphone,
  Square,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { MountainLogo } from '../common/MountainLogo';

interface WindowsTitleBarProps {
  onOpenAppsHub: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({ onOpenAppsHub }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsMaximized(false);
      }
    }
  };

  return (
    <div className="no-print bg-slate-950 border-b border-slate-800/80 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 select-none">
      {/* Left: App Title and Icon */}
      <div className="flex items-center gap-2">
        <MountainLogo size="xs" showText={false} />
        <span className="font-bold text-slate-300 font-mono tracking-tight">
          Mountain SGMS v2.5
        </span>
        <span className="hidden sm:inline-block text-slate-400">•</span>
        <span className="hidden sm:inline-block text-slate-400">
          Windows & Android Desktop Edition
        </span>
      </div>

      {/* Right: Windows Action Controls and App Hub link */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAppsHub}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/70 text-blue-300 rounded font-bold text-[10px] cursor-pointer transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>App Download Center</span>
        </button>

        {/* Windows Standard Window Buttons */}
        <div className="flex items-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Minimize"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={toggleMaximize}
            title={isMaximized ? 'Restore Down' : 'Maximize'}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (confirm('Exit Mountain Security Services SGMS window?')) {
                window.close();
              }
            }}
            title="Close"
            className="p-1 hover:bg-red-600 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
