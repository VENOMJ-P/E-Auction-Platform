import User from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/response.handler.js";

export const signup = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      return errorResponse(res, 400, "Please enter all fields");
    }
    if (password.length < 6) {
      return errorResponse(
        res,
        400,
        "Password must be at least 6 characters long"
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      return errorResponse(res, 400, "User already exists");
    }

    const newUser = new User({ email, fullName, password });
    newUser.genJwt(res);
    const data = {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    await newUser.save();
    return successResponse(res, 201, "Successfully created a new user", data);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, "Please enter all fields");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, "Invalid credentials");
    }
    const isPasswordCorrect = user.comparePassword(password);
    if (!isPasswordCorrect) {
      return errorResponse(res, 400, "Invalid credentials");
    }

    user.genJwt(res);
    const data = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return successResponse(res, 201, "Successfully logged in", data);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return successResponse(res, 201, "Successfully logged out");
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const checkAuth = async (req, res) => {
  try {
    return successResponse(res, 200, "Successfully get the user", req.user);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};
