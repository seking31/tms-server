const express = require("express");
const router = express.Router();
const { Project } = require("../../models/project");
const { addProjectSchema, updateProjectSchema } = require("../../schemas");
const Ajv = require("ajv");
const createError = require("http-errors");
const { nanoid } = require("nanoid"); // common usage

const ajv = new Ajv({ allErrors: true });
const validateAddProject = ajv.compile(addProjectSchema);
const validateUpdateProject = ajv.compile(updateProjectSchema);

// helper: escape regex special chars
function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/projects/search?term=foo
router.get("/search", async (req, res, next) => {
  try {
    const term = String(req.query.term || "").trim();
    if (!term) return next(createError(400, "Missing search term"));

    const regex = new RegExp(escapeRegex(term), "i");

    const results = await Project.find({
      $or: [{ name: regex }, { description: regex }],
    });

    return res.status(200).send(results);
  } catch (err) {
    return next(err);
  }
});

// GET /api/projects (all)
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({});
    return res.status(200).send(projects);
  } catch (err) {
    return next(err);
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return next(createError(404, "Project not found"));

    return res.status(200).send(project);
  } catch (err) {
    // Mongoose cast error => bad id format
    if (err?.name === "CastError")
      return next(createError(400, "Invalid project id"));
    return next(err);
  }
});

// POST /api/projects
router.post("/", async (req, res, next) => {
  try {
    const valid = validateAddProject(req.body);
    if (!valid) {
      return next(createError(400, ajv.errorsText(validateAddProject.errors)));
    }

    const projectWithId = {
      ...req.body,
      projectId: nanoid(10), // optional custom id
    };

    const newProject = await Project.create(projectWithId);

    return res.status(201).send({
      message: "Project created successfully",
      id: newProject._id,
      projectId: newProject.projectId,
    });
  } catch (err) {
    console.log(err, "e;lrkjad;lfkja;dlkfja");
    return next(err);
  }
});

// PATCH /api/projects/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const valid = validateUpdateProject(req.body);
    if (!valid) {
      return next(
        createError(400, ajv.errorsText(validateUpdateProject.errors))
      );
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return next(createError(404, `Project with ID ${id} not found`));

    return res.status(200).send({
      message: "Project updated successfully",
      id: updated._id,
    });
  } catch (err) {
    if (err?.name === "CastError")
      return next(createError(400, "Invalid project id"));
    return next(err);
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Project.deleteOne({ _id: id });
    if (!result?.deletedCount)
      return next(createError(404, "Project not found"));

    return res.status(200).send({
      message: "Project deleted successfully",
      id,
    });
  } catch (err) {
    if (err?.name === "CastError")
      return next(createError(400, "Invalid project id"));
    return next(err);
  }
});

module.exports = router;
