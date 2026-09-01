import React from 'react';

interface MountainLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'slip';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const MountainLogo: React.FC<MountainLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  theme = 'auto',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return { width: 'w-6 h-6', px: 24 };
      case 'sm':
        return { width: 'w-8 h-8 sm:w-9 sm:h-9', px: 36 };
      case 'md':
        return { width: 'w-12 h-12 sm:w-14 sm:h-14', px: 56 };
      case 'lg':
        return { width: 'w-20 h-20 sm:w-24 sm:h-24', px: 96 };
      case 'xl':
        return { width: 'w-28 h-28 sm:w-32 sm:h-32', px: 128 };
      case '2xl':
        return { width: 'w-36 h-36 sm:w-44 sm:h-44', px: 176 };
      case 'slip':
        return { width: 'w-16 h-16 sm:w-20 sm:h-20', px: 80 };
      default:
        return { width: 'w-12 h-12', px: 48 };
    }
  };

  const { width } = getDimensions();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${width}`}>
        <img
          src="./mss-logo.png"
          alt="MOUNTAIN SECURITY SERVICES (MSS)"
          className="w-full h-full object-contain select-none drop-shadow-sm transition-transform duration-200"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showText && (
        <div className={`flex flex-col select-none ${textClassName}`}>
          <span className={`font-black tracking-tight leading-tight text-base sm:text-lg flex flex-wrap items-center gap-1.5 ${
            theme === 'light' ? 'text-slate-900' : theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}>
            <span className="text-red-600 font-black">MOUNTAIN</span>
            <span className="text-blue-900 dark:text-blue-400 font-black">SECURITY SERVICES</span>
          </span>
          <span className={`text-[11px] font-bold tracking-wider uppercase mt-0.5 ${
            theme === 'light' ? 'text-slate-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
          }`}>
            MSS Security Management System
          </span>
        </div>
      )}
    </div>
  );
};

