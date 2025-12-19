const request = require("supertest");
const app = require("../../../src/app");
const { Task } = require("../../../src/models/task");

jest.mock("../../../src/models/task"); // Mock the Task model

describe("Task API", () => {
  // POST
  describe("POST /api/tasks/taskId", () => {
    it("should create a new task successfully", async () => {
      Task.prototype.save.mockResolvedValue({
        _id: "650c1f1e1c9d440000a1b1c1",
      }); // Mock the save method

      const response = await request(app).post("/api/tasks/1").send({
        title: "Complete project documentation",
        description: "Write the documentation for the project",
        status: "In Progress",
        priority: "High",
        dueDate: "2021-01-10T00:00:00.000Z", // Ensure all required properties are included
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task created successfully");
    });

    it("should return validation error for invalid status", async () => {
      const response = await request(app).post("/api/tasks/1").send({
        title: "Complete project documentation",
        description: "Write the documentation for the project",
        status: "Invalid status", // Invalid: not in enum
        priority: "High",
        dueDate: "2021-01-10T00:00:00.000Z",
      });

      expect(response.status).toBe(400);
      const errorMessages = response.body.message;

      expect(errorMessages).toContain(
        "must be equal to one of the allowed values"
      );
    });

    it("should return validation error when required field is missing", async () => {
      const response = await request(app).post("/api/tasks/1").send({
        // Missing title
        description: "Write the documentation for the project",
        status: "In Progress",
        priority: "High",
        dueDate: "2021-01-10T00:00:00.000Z",
      });

      expect(response.status).toBe(400);
      const errorMessages = response.body.message;

      expect(errorMessages).toBe("data must have required property 'title'");
    });
  });

  describe("GET /api/tasks", () => {
    it("should get all tasks", async () => {
      Task.find.mockResolvedValue([{ name: "Make List" }]); // Mock the find method
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe("Make List");
    });
    it("should handel errors", async () => {
      Task.find.mockRejectedValue(new Error("Database error")); // Mock an error
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(500);
    });
    it("handel an empty db", async () => {
      Task.find.mockResolvedValue([]); // Mock the find method
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/tasks/search", () => {
    it("should return matching tasks for a valid search term", async () => {
      const mockTasks = [
        {
          _id: "3000",
          title: "Fix login bug",
          description: "Users cannot log in",
        },
      ];

      Task.find.mockResolvedValue(mockTasks);

      const response = await request(app).get("/api/tasks/search?term=login");

      expect(Task.find).toHaveBeenCalledWith({
        $or: [
          { title: expect.any(RegExp) },
          { description: expect.any(RegExp) },
          { status: expect.any(RegExp) },
          { priority: expect.any(RegExp) },
        ],
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe("Fix login bug");
    });

    it("should return 400 if search term is missing", async () => {
      const response = await request(app).get("/api/tasks/search");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing search term");
    });

    it("should handle errors from the database", async () => {
      Task.find.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/tasks/search?term=bug");

      expect(response.status).toBe(500);
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("should update a task successfully", async () => {
      const mockTask = {
        _id: "650c1f1e1c9d440000a1b1c1",
        title: "Complete project documentation",
        description: "Write the documentation for the project",
        status: "In Progress",
        priority: "High",
        dueDate: "2021-01-10T00:00:00.000Z",
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      Task.findOne.mockResolvedValue(mockTask);

      const response = await request(app)
        .patch("/api/tasks/650c1f1e1c9d440000a1b1c1")
        .send({
          title: "Complete project documentation",
          description: "Write the documentation for the project",
          status: "In Progress",
          priority: "High",
          dueDate: "2021-01-10T00:00:00.000Z",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task updated successfully");
    });

    it("should return validation error for invalid type", async () => {
      const mockTask = {
        _id: "650c1f1e1c9d440000a1b1c1",
        title: "Complete project documentation",
        description: "Write the documentation for the project",
        status: "In Progress",
        priority: "High",
        dueDate: "2021-01-10T00:00:00.000Z",
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      Task.findOne.mockResolvedValue(mockTask);

      const response = await request(app)
        .patch("/api/tasks/1")
        .send({
          title: "T",
          description: "Test".repeat(501),
          status: "InvalidStatus", // Invalid: not in enum
          priority: "InvalidPriority", // Invalid: not in enum
          dueDate: "2021-01-10T00:00:00.000Z",
        });

      expect(response.status).toBe(400);
      const errorMessages = response.body.message;

      expect(errorMessages).toContain(
        "data/title must NOT have fewer than 3 characters"
      );
    });

    it("should return 404 if task is not found", async () => {
      const invalidTaskId = "692ca8ba8c7337c8d4931d0c";

      Task.findOne.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/tasks/${invalidTaskId}`)
        .send({
          title: "Complete project documentation",
          description: "Write the documentation for the project",
          status: "In Progress",
          priority: "High",
          dueDate: "2021-01-10T00:00:00.000Z",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Task with ID ${invalidTaskId} not found`
      );
      expect(Task.findOne).toHaveBeenCalledWith({ _id: invalidTaskId });
    });
  });

  describe("DELETE /api/tasks/:tasktId", () => {
    it("should delete a task successfully", async () => {
      Task.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const response = await request(app).delete(
        "/api/tasks/507f1f77bcf86cd799439011"
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully");
      expect(response.body.id).toBe("507f1f77bcf86cd799439011");
    });
    it("should handle errors during deletion", async () => {
      Task.deleteOne.mockRejectedValue(new Error("Database error"));
      const response = await request(app).delete(
        "/api/tasks/507f1f77bcf86cd799439011"
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Not Found");
    });
  });
});
