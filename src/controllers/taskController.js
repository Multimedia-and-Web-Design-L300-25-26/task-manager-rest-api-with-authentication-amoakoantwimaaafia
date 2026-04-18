import Task from "../models/Task.js";

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      title,
      description: description || "",
      completed: completed || false,
      owner: req.user._id
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { completed, sort, limit = 10, page = 1 } = req.query;
    
    const filter = { owner: req.user._id };
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const totalTasks = await Task.countDocuments(filter);

    res.json({
      count: tasks.length,
      total: totalTasks,
      page: parseInt(page),
      pages: Math.ceil(totalTasks / parseInt(limit)),
      tasks
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);

  } catch (error) {
    console.error("Get task error:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ 
        message: "Task not found or you don't have permission to update it" 
      });
    }

    if (title !== undefined) {
      if (!title) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      task.title = title;
    }
    
    if (description !== undefined) {
      task.description = description;
    }
    
    if (completed !== undefined) {
      task.completed = completed;
    }

    await task.save();

    res.json({
      message: "Task updated successfully",
      task
    });

  } catch (error) {
    console.error("Update task error:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
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
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete all tasks for a user
// @route   DELETE /api/tasks
// @access  Private
export const deleteAllTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({ owner: req.user._id });
    
    res.json({ 
      message: "All tasks deleted successfully",
      deletedCount: result.deletedCount 
    });

  } catch (error) {
    console.error("Delete all tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};