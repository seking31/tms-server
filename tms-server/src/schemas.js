const addTaskSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", maxLength: 500 },
    status: { type: "string", enum: ["Pending", "In Progress", "Completed"] },
    priority: { type: "string", enum: ["Low", "Medium", "High"] },
    dueDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
    dateCreated: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
  },
  required: ["title", "status", "priority"],
  additionalProperties: false,
};

const updateTaskSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", maxLength: 500 },
    status: { type: "string", enum: ["Pending", "In Progress", "Completed"] },
    priority: { type: "string", enum: ["Low", "Medium", "High"] },
    dueDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
  },
  required: ["title", "status", "priority"],
  additionalProperties: false,
};

const addProjectSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", maxLength: 500 },
    startDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
    endDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
    dateCreated: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
  },
};

const updateProjectSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", maxLength: 500 },
    startDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
    endDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
    },
  },
  required: [], // Updates should NOT force any field to be required
  additionalProperties: false,
};

module.exports = {
  updateProjectSchema,
  addTaskSchema,
  updateTaskSchema,
  addProjectSchema,
};
