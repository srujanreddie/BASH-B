/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, CheckSquare, Calendar, Download } from 'lucide-react';
import { Notice } from '../types';

interface QuickPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  completedMap: Record<string, boolean>;
}

export const QuickPrintModal: React.FC<QuickPrintModalProps> = ({
  isOpen,
  onClose,
  notices,
  completedMap,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeNotices = notices.filter((n) => n.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800 relative text-left max-h-[90vh] flex flex-col overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-[#1e1e1e] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#d2f34c] flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5 text-[#d2f34c]" />
            </div>
            <div>
              <h2 id="print-modal-title" className="text-base font-extrabold text-white tracking-tight">
                Printable Deadline Audit Sheet
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Compact checklist formatted for A4 physical pin-up and dorm study desks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Paper Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#f2f2f4] dark:bg-[#121214] space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4 text-xs font-sans print:border-none print:shadow-none text-zinc-950">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-zinc-950 tracking-tight">
                  CSE SEMESTER 1 — ACTIVE DEADLINES CHECKLIST
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Generated: {new Date().toLocaleDateString()} · Computer Science & Engineering
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-950 px-3 py-1 bg-[#d2f34c] rounded-full">
                Section 2026
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2 w-8">Done</th>
                  <th className="py-2 w-24">Course</th>
                  <th className="py-2">Assignment / Exam Description</th>
                  <th className="py-2 w-36 text-right">Deadline / Exam Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {activeNotices.map((n) => {
                  const id = n.id || (n as any)._id;
                  const isDone = Boolean(completedMap[id]);
                  return (
                    <tr key={id} className={isDone ? 'opacity-40 line-through text-zinc-400' : ''}>
                      <td className="py-2.5">
                        <div className="w-4 h-4 border border-zinc-400 rounded-md flex items-center justify-center font-bold text-[10px]">
                          {isDone ? '✓' : ''}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono font-black text-zinc-950">
                        {n.courseCode}
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="font-extrabold text-zinc-950">{n.title}</div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1">{n.description}</div>
                      </td>
                      <td className="py-2.5 font-mono tabular-nums text-right text-zinc-700 whitespace-nowrap">
                        {n.deadline ? (
                          <>
                            <span className="text-[10px] text-zinc-400 mr-1 font-sans">
                              {n.category === 'Exam' ? 'Exam:' : 'Due:'}
                            </span>
                            <span>
                              {new Date(n.deadline).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="border-t pt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Class Noticeboard System · 9 Semester 1 Modules</span>
              <span>Verify submissions with lab instructors before deadline</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-[#f2f2f4] dark:bg-[#171719] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 transition-colors shadow-xs cursor-pointer uppercase tracking-wider"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Checklist (Ctrl + P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPrintModal;
