import mongoose from "mongoose";

// Create Task schema
// Fields:
// - title (String, required)
// - description (String)
// - completed (Boolean, default false)
// - owner (ObjectId, ref "User", required)
// - createdAt (default Date.now)

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"]
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Task must belong to a user"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: Add index for faster queries
taskSchema.index({ owner: 1, createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;