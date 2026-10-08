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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0">
            {isGithub ? <FolderGit2 className="w-6 h-6 text-slate-900" /> : <FileText className="w-6 h-6 text-indigo-600" />}
          </div>
          <div>
            {courseCode && (
              <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                [{courseCode}] Resource Gateway
              </span>
            )}
            <h3 id="resource-modal-title" className="text-base font-semibold text-slate-900 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          {isDrive
            ? 'This resource is hosted on the Semester 1 Centralized Google Drive repository. You can open it in full view or copy the direct link.'
            : isGithub
            ? 'This repository hosts sample code, boilerplates, and lab solutions. You can browse commits or clone the code.'
            : 'Access the official digital material, question bank, or laboratory handout.'}
        </p>

        {/* Link box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-600 truncate select-all">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 shrink-0 p-1 rounded hover:bg-slate-200 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
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
