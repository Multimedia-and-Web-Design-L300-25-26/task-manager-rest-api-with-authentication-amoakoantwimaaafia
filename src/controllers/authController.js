import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: "User already exists with this email" 
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
    });

    // Send response (exclude password)
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Compare password using the method we created in User model
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Send response (exclude password)
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: error.message 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user._id).select("-password");
    
    res.status(200).json({
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ 
      message: "Server error fetching profile" 
    });
  }
};