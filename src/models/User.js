import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Create User schema
// Fields:
// - email (String, required, unique)
// - password (String, required, minlength 6)
// - createdAt (default Date.now)

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving to database
userSchema.pre("save", async function() {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return ;
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
  } catch (error) {
    console.log(error);
  }
});

// Method to compare entered password with hashed password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;