import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import verifyToken from '../utils/verifyToken.js';

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
 
    res.status(201).json({
      message: 'User registered successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({message:"Please provide email and password"});
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful'
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get logged-in user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    message: 'User profile retrieved successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


//logout user
const logoutUser = asyncHandler(async (req, res) => {
    //desstroy cookies
    const clearCookies= await res.clearCookie("token")
    if(clearCookies){
        return res.json({message:"User logged out successfully"})
    }else{
        res.status(400).json({message:"Unable to logout user"})
        throw new Error("Unable to logout user")
    }
});
export { registerUser, authUser, getUserProfile, logoutUser };