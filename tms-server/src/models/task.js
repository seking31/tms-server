const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: {
      type: String,
      required: [true, "Task name is required"],
      minlength: [3, "Task name must be at least 3 characters"],
      maxlength: [100, "Task name cannot not exceed 100 characters"],
      unique: true
  },
  description: {
    type: String,
    required: [true, "Task description is required"],
    maxlength: [500, "Task description cannot exceed 500 characters"]
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    required: [true, "Task status is required"],
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: [true, "Task priority is required"],
  },
  dueDate: {
      type: Date
  },
  dateCreated: {
      type: Date,
      default: Date.now
  },
  dateModified: {
      type: Date
  },
  projectId: {
      type: Number,
      required: [true, "Project ID is required"]
  },
});

taskSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.dateModified = new Date();
  }
  next();
});

module.exports = {
  Task: mongoose.model("Task", taskSchema),
};
