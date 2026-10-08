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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 relative text-left max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-modal-title"
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 id="print-modal-title" className="text-base font-bold text-slate-900">
                Printable Deadline Audit Sheet
              </h2>
              <p className="text-xs text-slate-500">
                Compact checklist formatted for A4 physical pin-up and dorm study desks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Paper Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs font-sans print:border-none print:shadow-none">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  CSE SEMESTER 1 — ACTIVE DEADLINES CHECKLIST
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Generated: {new Date().toLocaleDateString()} · Computer Science & Engineering
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 px-2 py-1 bg-slate-100 rounded">
                Section 2026
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 w-8">Done</th>
                  <th className="py-2 w-24">Course</th>
                  <th className="py-2">Assignment / Exam Description</th>
                  <th className="py-2 w-36 text-right">Deadline / Exam Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {activeNotices.map((n) => {
                  const id = n.id || (n as any)._id;
                  const isDone = Boolean(completedMap[id]);
                  return (
                    <tr key={id} className={isDone ? 'opacity-50 line-through' : ''}>
                      <td className="py-2.5">
                        <div className="w-4 h-4 border border-slate-400 rounded flex items-center justify-center font-bold text-[10px]">
                          {isDone ? '✓' : ''}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {n.courseCode}
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{n.description}</div>
                      </td>
                      <td className="py-2.5 font-mono tabular-nums text-right text-slate-700 whitespace-nowrap">
                        {n.deadline ? (
                          <>
                            <span className="text-[10px] text-slate-400 mr-1">
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

            <div className="border-t pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Class Noticeboard System · 9 Semester 1 Modules</span>
              <span>Verify submissions with lab instructors before deadline</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Checklist (Ctrl + P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPrintModal;
