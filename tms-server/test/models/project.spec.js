const mongoose = require("mongoose");
const { Project } = require("../../src/models/project");

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
  await Project.deleteMany({});
});
// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log("Database connection closed");
});
describe("Project Model Test", () => {
  it("should create a project successfully", async () => {
    const projectData = {
      projectId: 6000,
      name: "Dog Walk",
      location: "Central Park",
      description: "A beautiful walk.",
      startDate: "2021-01-05T00:00:00.000Z",
      endDate: "2021-01-05T00:00:00.000Z",
      dateCreated: "2021-01-05T00:00:00.000Z",
      dateModified: "2021-01-05T00:00:00.000Z",
    };
    const project = new Project(projectData);
    const savedProject = await project.save();
    expect(savedProject._id).toBeDefined();
    expect(savedProject.name).toBe(projectData.name);
    expect(savedProject.startDate.toISOString()).toBe(projectData.startDate);
    expect(savedProject.description).toBe(projectData.description);
  });
});
