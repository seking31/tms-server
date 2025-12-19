const mongoose = require("mongoose");
const { Task } = require("../../src/models/task");

// Connect to a test database
beforeAll(async () => {
  const connectionString =
    "mongodb+srv://gms_user:HiJETfd7H7GdUbwF@bellevueuniversity.qxxmbuj.mongodb.net/";

  try {
    await mongoose.connect(connectionString, {
      dbName: "TMS-DATABASE",
    });

    console.log("Connection to the database instance was successful");
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
  }
});

// Clear the database before each test
beforeEach(async () => {
  await Task.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log("Database connection closed");
});

describe("Task Model Test", () => {
  it("should create a task successfully", async () => {
    const taskData = {
      title: "Test Task",
      description: "This is a test task",
      status: "In Progress",
      priority: "High",
      dueDate: new Date("2023-01-01T00:00:00.000Z"),
      projectId: 1000,
    };

    const task = new Task(taskData);
    const savedTask = await task.save();

    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe(taskData.title);
    expect(savedTask.description).toBe(taskData.description);
    expect(savedTask.status).toBe(taskData.status);
    expect(savedTask.priority).toBe(taskData.priority);
    expect(savedTask.dueDate).toEqual(taskData.dueDate);
    expect(savedTask.projectId).toBe(taskData.projectId);
  });

  it("should fail to create a task without required fields", async () => {
    const taskData = {
      title: "Test fields",
      description: "This is a test task",
    };

    const task = new Task(taskData);

    let err;

    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors["projectId"]).toBeDefined();
    expect(err.errors["status"]).toBeDefined();
  });

  it("should update a task's status successfully", async () => {
    const taskData = {
      title: "Test Task",
      description: "This is a test task",
      status: "In Progress",
      priority: "High",
      projectId: 1000,
    };

    const task = new Task(taskData);
    const savedTask = await task.save();

    savedTask.status = "Completed";
    const updatedTask = await savedTask.save();

    expect(updatedTask.status).toBe("Completed");
  });

  it("should fail to create a task with a name shorter than 3 characters", async () => {
    const taskData = {
      title: "T",
      description: "This is a test task",
      status: "In Progress",
    };

    const task = new Task(taskData);
    let err;

    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors["title"]).toBeDefined();
    expect(err.errors["title"].message).toBe(
      "Task name must be at least 3 characters"
    );
  });

  it("should fail to create a task with a name longer than 100 characters", async () => {
    const taskData = {
      title: "T".repeat(101),
      description: "This is a test task",
      status: "In Progress",
      priority: "High",
      projectId: 1000,
    };

    const task = new Task(taskData);
    let err;

    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors["title"]).toBeDefined();
    expect(err.errors["title"].message).toBe(
      "Task name cannot not exceed 100 characters"
    );
  });

  it("should fail to create a task with an invalid status", async () => {
    const taskData = {
      title: "Test Task",
      description: "This is a test task",
      status: "InvalidStatus",
      priority: "High",
      projectId: 1000,
    };

    const task = new Task(taskData);
    let err;

    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors["status"]).toBeDefined();
    expect(err.errors["status"].message).toBe(
      "`InvalidStatus` is not a valid enum value for path `status`."
    );
  });

  it("should fail to create a task with an invalid priority", async () => {
    const taskData = {
      title: "Test Task",
      description: "This is a test task",
      status: "In Progress",
      priority: "InvalidPriority",
      projectId: 1000,
    };

    const task = new Task(taskData);
    let err;

    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors["priority"]).toBeDefined();
    expect(err.errors["priority"].message).toBe(
      "`InvalidPriority` is not a valid enum value for path `priority`."
    );
  });
});
