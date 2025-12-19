const express = require("express");
const Ajv = require("ajv");
const createError = require("http-errors");
const { Task } = require("../../models/task");
const { addTaskSchema } = require("../../schemas");
const { updateTaskSchema } = require("../../schemas");
const router = express.Router();

const ajv = new Ajv();

const validateAddTask = ajv.compile(addTaskSchema);
const validateUpdateTask = ajv.compile(updateTaskSchema);

// GET return all tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (err) {
    console.error(`Error while getting tasks: ${err}`);
    next(err);
  }
});

// GET return task that matches search term
router.get("/search", async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).send({ message: "Missing search term" });
    }

    const regex = new RegExp(term, "i");

    const results = await Task.find({
      $or: [
        { title: regex },
        { description: regex },
        { status: regex },
        { priority: regex },
      ],
    });

    res.send(results);
  } catch (err) {
    console.error(`Error while creating task: ${err}`);
    next(err);
  }
});

// GET /task/:id - read a task by id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const task = await Task.findById(id);
    console.log(task);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    res.status(200).send(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - delete a task by id
router.delete("/:taskId", async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const result = await Task.deleteOne({ _id: taskId });

    if (!result || result.deletedCount === 0) {
      return next(createError(404, "Not Found"));
    }

    return res.status(200).send({
      message: "Task deleted successfully",
      id: taskId,
    });
  } catch (err) {
    return next(createError(404, "Not Found"));
  }
});

// POST request to create a new task to the task's collection
router.post("/:projectId", async (req, res, next) => {
  try {
    const valid = validateAddTask(req.body);

    if (!valid) {
      return next(createError(400, ajv.errorsText(validateAddTask.errors)));
    }

    const payload = {
      ...req.body,
      projectId: req.params.projectId,
    };

    const task = new Task(payload);
    await task.save();

    res.send({
      message: "Task created successfully",
      taskId: task._id,
    });
  } catch (err) {
    console.error(`Error while creating task: ${err}`);
    next(err);
  }
});

// PATCH request to update a task document in the task's collection
router.patch("/:id", async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOne({ _id: taskId });

    const valid = validateUpdateTask(req.body);

    if (!task) {
      return next(createError(404, `Task with ID ${taskId} not found`));
    }

    if (!valid) {
      return next(createError(400, ajv.errorsText(validateUpdateTask.errors)));
    }

    task.set(req.body);
    await task.save();

    res.send({
      message: "Task updated successfully",
      id: task._id,
    });
  } catch (err) {
    console.error(`Error while updating task: ${err}`);
    next(err);
  }
});

module.exports = router;
