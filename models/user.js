const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subjectProgressSchema = new Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    assignments: [
      {
        assignmentId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to assignment in Subject.assignments._id implicitly
        status: {
          type: String,
          enum: ["Pending", "Submitted", "Graded"],
          default: "Pending",
        },
        submittedDate: Date,
        grade: Number,
        feedback: String,
        fileUrl: String, // Link to submitted file
      },
    ],
    projects: [
      {
        projectId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to project in Subject.projects._id implicitly
        status: {
          type: String,
          enum: ["Pending", "Submitted", "Graded"],
          default: "Pending",
        },
        submittedDate: Date,
        grade: Number,
        feedback: String,
        fileUrl: String,
      },
    ],
    attendance: [
      {
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Present", "Absent", "Late", "Excused"],
          required: true,
        },
      },
    ],
  },
  { _id: false }
); // Prevent Mongoose from creating an _id for this subdocument

const user = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  subjectProgress: [subjectProgressSchema],
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", user);
