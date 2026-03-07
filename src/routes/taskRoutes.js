import express from "express";
import Task from "../models/Task.js"; // Fixed path: remove the dot before models
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // -Create task with owner = req.user._id
    const task = await Task.create({
      title,
      description: description || "",
      completed: completed || false,
      owner: req.user._id // Attach the authenticated user's ID
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/tasks - Get all tasks for authenticated user
router.get("/", async (req, res) => {
  try {
    // - Return only tasks belonging to req.user
    const tasks = await Task.find({ owner: req.user._id })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/tasks/:id - Get single task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id // Ensure task belongs to user
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);

  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    
    // Find task and check ownership
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();

    res.json({
      message: "Task updated successfully",
      task
    });

  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    // - Check ownership and delete task
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id // This ensures only owner can delete
    });

    if (!task) {
      return res.status(404).json({ 
        message: "Task not found or you don't have permission to delete it" 
      });
    }

    res.json({ 
      message: "Task deleted successfully",
      deletedTask: task 
    });

  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;