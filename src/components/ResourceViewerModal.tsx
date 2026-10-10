/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, FileText, FolderGit2 } from 'lucide-react';

interface ResourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  courseCode?: string;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  courseCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const isDrive = url.includes('drive.google.com');
  const isGithub = url.includes('github.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200/80 dark:border-zinc-800 relative text-left transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1e1e1e] dark:bg-zinc-800 text-[#d2f34c] flex items-center justify-center shrink-0 border border-zinc-800 dark:border-zinc-700">
            {isGithub ? <FolderGit2 className="w-6 h-6 text-[#d2f34c]" /> : <FileText className="w-6 h-6 text-[#d2f34c]" />}
          </div>
          <div>
            {courseCode && (
              <span className="font-mono text-xs font-black text-zinc-950 bg-[#d2f34c] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                {courseCode} Vault
              </span>
            )}
            <h3 id="resource-modal-title" className="text-base font-extrabold text-zinc-950 dark:text-white leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed font-medium">
          {isDrive
            ? 'This resource is hosted on the Semester 1 Centralized Google Drive repository. You can open it in full view or copy the direct link.'
            : isGithub
            ? 'This repository hosts sample code, boilerplates, and lab solutions. You can browse commits or clone the code.'
            : 'Access the official digital material, question bank, or laboratory handout.'}
        </p>

        {/* Link box */}
        <div className="px-4 py-2.5 bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-full mb-6 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate select-all">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-zinc-950 bg-[#d2f34c] hover:bg-[#c2e43b] rounded-full shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceViewerModal;
