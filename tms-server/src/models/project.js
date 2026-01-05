const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  projectId: { type: String },
  name: { type: String, required: [true, "Project name is required"] },
  description: {
    type: String,
    required: [true, "Project description is required"],
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date },
});

// Keep validation hook simple; update dateModified on updates/saves
projectSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.dateModified = new Date();
  }
  next();
});

module.exports = {
  Project: mongoose.model("Project", projectSchema),
};
