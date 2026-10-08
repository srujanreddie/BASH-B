/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

/**
 * Schema for Noticeboard Items (Assignments, Exams, and Study Materials)
 */
const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: [true, 'Notice description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Assignment', 'Exam', 'Material'],
      default: 'Assignment',
    },
    courseCode: {
      type: String,
      required: [true, 'Course Code is required'],
      trim: true,
      uppercase: true,
    },
    courseTitle: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    resourceLink: {
      type: String,
      trim: true,
      default: '',
    },
    resourceLabel: {
      type: String,
      trim: true,
      default: 'Reference Material',
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting by deadline and query filtering
NoticeSchema.index({ deadline: 1 });
NoticeSchema.index({ courseCode: 1 });
NoticeSchema.index({ category: 1 });

const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

export default Notice;
