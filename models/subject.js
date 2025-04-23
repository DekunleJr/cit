const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  totalPoints: {
    // <-- ADD THIS FIELD
    type: Number,
    required: true,
    min: 0,
  },
});

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
  },
});

const subjectSchema = new Schema({
  title: {
    // e.g., "STAT 101: Introduction to Statistics"
    type: String,
    required: true,
  },
  code: {
    // e.g., "STAT 101"
    type: String,
    required: true,
  },
  units: {
    // e.g., 3
    type: Number,
    required: true,
  },
  // Reference to the main Course this subject belongs to
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Links to your existing Course model
    required: true,
  },
  // Define the assignments and projects for this subject
  assignments: [assignmentSchema],
  projects: [projectSchema],
  // Attendance might be handled differently (see notes below)
});

module.exports = mongoose.model("Subject", subjectSchema);
