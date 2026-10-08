/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, Palette, LayoutGrid, List, CalendarDays, Terminal, Sparkles, BookOpen, Layers, Moon } from 'lucide-react';
import { UITheme, LayoutView } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: UITheme;
  onSelectTheme: (theme: UITheme) => void;
  currentLayout: LayoutView;
  onSelectLayout: (layout: LayoutView) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  currentLayout,
  onSelectLayout,
}) => {
  if (!isOpen) return null;

  const themes: {
    id: UITheme;
    name: string;
    tagline: string;
    previewBg: string;
    previewCard: string;
    previewAccent: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'academic',
      name: 'Academic Slate (Default)',
      tagline: 'Clean, structured university portal with high-contrast text and crisp dividers.',
      previewBg: 'bg-slate-50',
      previewCard: 'bg-white border-slate-200 text-slate-900',
      previewAccent: 'bg-slate-900 text-white',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'terminal',
      name: 'Hacker / CS Terminal',
      tagline: 'Dark mode engineering console with monospace type, amber threat indicators, and phosphor green highlights.',
      previewBg: 'bg-neutral-950',
      previewCard: 'bg-neutral-900 border-neutral-800 text-emerald-400 font-mono',
      previewAccent: 'bg-emerald-500 text-black font-mono',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'notion',
      name: 'Minimalist Paper',
      tagline: 'Warm off-white background, subtle hairline borders, and distraction-free editorial spacing.',
      previewBg: 'bg-stone-50',
      previewCard: 'bg-white border-stone-200 text-stone-900',
      previewAccent: 'bg-stone-800 text-stone-100',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'campus',
      name: 'Vibrant Indigo Campus',
      tagline: 'Modern dynamic student portal with royal indigo accents and energetic contrast.',
      previewBg: 'bg-slate-50',
      previewCard: 'bg-white border-indigo-100 text-slate-900 shadow-sm',
      previewAccent: 'bg-indigo-600 text-white',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'oled',
      name: 'OLED Midnight Cyber',
      tagline: 'True-black AMOLED background with high-contrast cyan and neon highlights for battery-saving night study.',
      previewBg: 'bg-black',
      previewCard: 'bg-neutral-900 border-neutral-800 text-cyan-300 font-mono',
      previewAccent: 'bg-cyan-400 text-black font-bold',
      icon: <Moon className="w-4 h-4" />,
    },
  ];

  const layouts: {
    id: LayoutView;
    name: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'cards',
      name: 'Standard Card Grid',
      desc: 'Dual-column cards with full descriptions, tags, and drive link previews.',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'dense',
      name: 'High-Density Ledger',
      desc: 'Compact single-line tabular rows for rapid deadline auditing before exams.',
      icon: <List className="w-4 h-4" />,
    },
    {
      id: 'timeline',
      name: 'Timeline Roadmap',
      desc: 'Chronological roadmap grouped into Immediate Threats, This Week, and Beyond.',
      icon: <CalendarDays className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative text-left max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-base font-bold text-slate-900">
                Choose UI / UX Experience
              </h2>
              <p className="text-xs text-slate-500">
                Select your preferred visual aesthetic and layout density mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Visual Theme Selection */}
        <div className="py-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            1. Visual Aesthetic (5 Themes)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTheme(t.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm bg-slate-50/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md ${t.previewAccent}`}>
                        {t.icon}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        {t.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-slate-900 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    {t.tagline}
                  </p>
                  {/* Theme swatch preview */}
                  <div className={`p-2 rounded-lg border ${t.previewBg} flex items-center justify-between text-[10px]`}>
                    <span className={`px-2 py-0.5 rounded border text-[10px] ${t.previewCard}`}>
                      Card Sample
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.previewAccent}`}>
                      Badge
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Layout & Density Mode Selection */}
        <div className="pt-2 pb-4 space-y-3 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            2. Feed Layout & Density
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {layouts.map((layout) => {
              const isSelected = currentLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => onSelectLayout(layout.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      {layout.icon}
                      <span>{layout.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>
                  <p className={`text-[11px] leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {layout.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Saved automatically in local browser preferences.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectorModal;
