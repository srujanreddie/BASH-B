/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

/**
 * Schema for Semester 1 Computer Science and Engineering courses.
 */
const CourseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Theory', 'Lab', 'Drawing', 'Practical/Drawing'],
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    syllabusUrl: {
      type: String,
      default: '',
    },
    pyqUrl: {
      type: String,
      default: '',
    },
    lectureSlidesUrl: {
      type: String,
      default: '',
    },
    labManualUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    instructor: {
      type: String,
      default: 'Faculty Dept. of CSE',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development reloads
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

export default Course;
