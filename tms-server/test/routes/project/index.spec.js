const request = require("supertest");
const app = require("../../../src/app");
const { Project } = require("../../../src/models/project");

jest.mock("../../../src/models/project"); // Mock the Project model

describe("Project API", () => {
  describe("GET /api/tasks", () => {

    it("should get all projects", async () => {
      Project.find.mockResolvedValue([{ name: "Make List" }]); // Mock the find method
      const response = await request(app).get("/api/projects");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should handel errors", async () => {
      Project.find.mockRejectedValue(new Error("Database error")); // Mock an error
      const response = await request(app).get("/api/projects");
      expect(response.status).toBe(500);
    });

    it("handel an empty db", async () => {
      Project.find.mockResolvedValue([]); // Mock the find method
      const response = await request(app).get("/api/projects");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/projects", () => {
      it("should create a new project successfully", async () => {
          Project.prototype.save.mockResolvedValue({ _id: 1 }); // Mock the save method

          const response = await request(app).post("/api/projects").send({
              name: "Project Alpha",
              description: "Initial phase of the project",
              startDate: "2021-01-01T00:00:00.000Z",
              endDate: "2021-06-01T00:00:00.000Z",
              dateCreated: "2021-01-01T00:00:00.000Z",
          });

          expect(response.status).toBe(201);
          expect(response.body.message).toBe("Project created successfully");
      });

      it("should return validation errors for invalid input", async () => {
          const response = await request(app).post("/api/projects").send({
              name: "", // Invalid: empty
              description: "Initial phase of the project",
              startDate: "2021-01-01T00:00:00.000Z",
              endDate: "2021-06-01T00:00:00.000Z",
              dateCreated: "invalid-date", // Invalid: not a date
          });

          expect(response.status).toBe(400);
          expect(response.body.message).toContain("must NOT have fewer than 3 characters");
      });

      it("should return 400 if dateCreated is not a valid date", async () => {
          const response = await request(app).post("/api/projects").send({
              name: "Invalid Date Project",
              description: "Testing invalid date",
              dateCreated: "invalid-date",
          });

          expect(response.status).toBe(400);
          expect(response.body.message).toContain("must match pattern");
      });

      describe("PATCH /api/projects/:id", () => {
          it("should update a project successfully", async () => {
              const mockProject = {
                  _id: "693f4e2877c9322b37298f4c",
                  name: "Dog Walk",
                  description: "A beautiful walk.",
                  startDate: "2021-01-05T00:00:00.000Z",
                  endDate: "2021-01-05T00:00:00.000Z",
                  set: jest.fn(),
                  save: jest.fn().mockResolvedValue(true),
              };

              Project.findOne.mockResolvedValue(mockProject);

              const response = await request(app).patch("/api/projects/693f4e2877c9322b37298f4c").send({
                  name: "Dog Walk",
                  description: "A beautiful walk.",
                  startDate: "2021-01-05T00:00:00.000Z",
                  endDate: "2021-01-05T00:00:00.000Z",
              });

              expect(response.status).toBe(200);
              expect(response.body.message).toBe("Project updated successfully");
          });

          it("should return validation error for invalid type", async () => {
              const mockProject = {
                  _id: "693f4e2877c9322b37298f4c",
                  name: "Dog Walk",
                  description: "A beautiful walk.",
                  startDate: "2021-01-05T00:00:00.000Z",
                  endDate: "2021-01-05T00:00:00.000Z",
                  set: jest.fn(),
                  save: jest.fn().mockResolvedValue(true),
              };

              Project.findOne.mockResolvedValue(mockProject);

              const response = await request(app).patch("/api/projects/1").send({
                  name: "T",
                  description: "Test".repeat(501),
              });

              expect(response.status).toBe(400);
              const errorMessages = response.body.message;

              expect(errorMessages).toContain("must NOT have fewer than 3 characters");
          });

          it("should return 404 if project is not found", async () => {
              const invalidProjectId = "692ca8ba8c7337c8d4931d0c"

              Project.findOne.mockResolvedValue(null);

              const response = await request(app).patch(`/api/projects/${invalidProjectId}`).send({
                  name: "Dog Walk",
                  description: "A beautiful walk.",
                  startDate: "2021-01-05T00:00:00.000Z",
                  endDate: "2021-01-05T00:00:00.000Z",
              });

              expect(response.status).toBe(404);
              expect(response.body.message).toBe(`Project with ID ${invalidProjectId} not found`);
              expect(Project.findOne).toHaveBeenCalledWith({ _id: invalidProjectId
              });
          })
      })
  })
});
