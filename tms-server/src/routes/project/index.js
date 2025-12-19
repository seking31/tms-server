const express = require("express");
const router = express.Router();
const { Project } = require("../../models/project");
const { addProjectSchema, updateProjectSchema } = require("../../schemas");
const Ajv = require("ajv");
const createError = require("http-errors");

const ajv = new Ajv();
const validateAddProject = ajv.compile(addProjectSchema);
const validateUpdateProject = ajv.compile(updateProjectSchema);

// GET return task that matches search term
router.get("/search", async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).send({ message: "Missing search term" });
    }

    const regex = new RegExp(term, "i");

    const results = await Project.find({
      $or: [{ name: regex }, { description: regex }],
    });

    res.send(results);
  } catch (err) {
    console.error(`Error while creating task: ${err}`);
    next(err);
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }

    return res.status(200).send(project);
  } catch (err) {
    console.error(`Error while getting project by id: ${err}`);
    return res.status(500).send({ message: "Server error" });
  }
});

// DELETE /api/projects/:id - delete a project by id
router.delete("/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const result = await Project.deleteOne({ _id: projectId });

    if (!result || result.deletedCount === 0) {
      return next(createError(404, "Not Found"));
    }

    return res.status(200).send({
      message: "Project deleted successfully",
      id: projectId,
    });
  } catch (err) {
    return next(createError(404, "Not Found"));
  }
});

// GET /api/projects  Return all projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({});
    return res.status(200).send(projects);
  } catch (err) {
    console.error(`Error while getting projects: ${err}`);
    return res.status(500).send({ message: "Server error" });
  }
});

// PATCH request to update a project document in the project's collection
router.patch("/:id", async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findOne({ _id: projectId });

    const valid = validateUpdateProject(req.body);

    if (!project) {
      return next(createError(404, `Project with ID ${projectId} not found`));
    }

    if (!valid) {
      return next(
        createError(400, ajv.errorsText(validateUpdateProject.errors))
      );
    }

    project.set(req.body);
    await project.save();

    res.send({
      message: "Project updated successfully",
      id: project._id,
    });
  } catch (err) {
    console.error(`Error while updating project: ${err}`);
    next(err);
  }
});

// POST request to add a new project
router.post("/", async (req, res) => {
  try {
    const valid = validateAddProject(req.body);

    console.log(req.body);
    console.log(valid);
    if (!valid) {
      return res.status(400).send({
        message: ajv.errorsText(validateAddProject.errors),
      });
    }

    const projectWithId = {
      ...req.body,
      projectId: Math.floor(1000 + Math.random() * 9000),
    };

    const newProject = new Project(projectWithId);
    await newProject.save();

    return res.status(201).send({
      message: "Project created successfully",
      projectId: newProject._id,
    });
  } catch (err) {
    console.error(`Error while creating project: ${err}`);
    return res.status(500).send({ message: "Server error" });
  }
});
// PATCH request to update a project
router.patch("/:id", async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findOne({ _id: projectId });

    const valid = validateUpdateProject(req.body);

    if (!project) {
      return next(createError(404, `Project with ID ${projectId} not found`));
    }

    if (!valid) {
      return next(
        createError(400, ajv.errorsText(validateUpdateProject.errors))
      );
    }

    project.set(req.body);
    await project.save();

    res.send({
      message: "Project updated successfully",
      id: project._id,
    });
  } catch (err) {
    console.error(`Error while updating project: ${err}`);
    next(err);
  }
});

module.exports = router;
