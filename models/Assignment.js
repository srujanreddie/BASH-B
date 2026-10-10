/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

/**
 * Schema for Course Assignment Deadlines & Problem Sets
 */
const AssignmentSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    submissionUrl: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'normal'],
      default: 'normal',
    },
    maxPoints: {
      type: Number,
      default: 20,
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

AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ courseCode: 1 });
AssignmentSchema.index({ priority: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

export default Assignment;
