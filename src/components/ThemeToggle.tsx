import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'segmented' | 'floating';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center p-1 rounded-full bg-zinc-200/90 dark:bg-zinc-800/90 border border-zinc-300/80 dark:border-zinc-700/80 shadow-2xs transition-all ${className}`}
        role="group"
        aria-label="Theme selector (switch between light and dark mode)"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-zinc-950 shadow-xs ring-1 ring-black/5 font-extrabold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40'
          }`}
          title="Switch to Light mode"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? 'bg-[#1e1e1e] text-[#d2f34c] shadow-xs ring-1 ring-zinc-700 font-extrabold'
              : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/40'
          }`}
          title="Switch to Dark mode"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-[#d2f34c] fill-[#d2f34c]' : 'text-zinc-500'}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div 
        className={`fixed bottom-5 right-5 z-40 hidden sm:inline-flex items-center p-1 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700 shadow-xl transition-all duration-200 hover:shadow-2xl ${className}`}
        role="group"
        aria-label="Theme selector (switch between light and dark mode)"
      >
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pl-2.5 pr-1 font-mono uppercase tracking-wider">
          Theme
        </span>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isDark
              ? 'bg-amber-100 text-amber-950 font-black shadow-2xs'
              : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          title="Switch to Light mode"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-800 text-[#d2f34c] font-black shadow-2xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          title="Switch to Dark mode"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-[#d2f34c] fill-[#d2f34c]' : 'text-zinc-500'}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer select-none group ${
          isDark
            ? 'bg-zinc-800/90 hover:bg-zinc-700/90 text-white border-zinc-700/80 shadow-xs'
            : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200/80 shadow-2xs'
        } ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <div className="w-5 h-5 rounded-full bg-[#d2f34c]/20 flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-[#d2f34c] transition-transform duration-300 group-hover:rotate-45" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-zinc-700 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
          )}
          <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
        </div>

        {/* Small toggled badge */}
        <div className="flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider">
          <span
            className={`px-2 py-0.5 rounded-full transition-colors ${
              isDark
                ? 'bg-[#d2f34c] text-zinc-950 font-black'
                : 'bg-zinc-100 text-zinc-700'
            }`}
          >
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative h-9 px-3 rounded-full flex items-center gap-1.5 transition-all duration-200 border cursor-pointer group shadow-2xs ${
        isDark
          ? 'bg-[#1e1e1e] hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-zinc-700'
          : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200/80 hover:text-zinc-950'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode (Currently ${isDark ? 'Dark' : 'Light'})`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 transition-all duration-300 text-[#d2f34c] group-hover:rotate-45 group-hover:scale-110" />
          <span className="text-xs font-bold text-zinc-200">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 transition-all duration-300 text-zinc-700 group-hover:-rotate-12 group-hover:scale-110" />
          <span className="text-xs font-bold text-zinc-700">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
