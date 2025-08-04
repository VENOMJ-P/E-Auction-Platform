import { AppError } from "../utils/error.handler.js";

export const validateSignup = (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("Please provide all required fields", 400));
  }

  if (fullName.length < 3) {
    return next(
      new AppError("Full Name must be at least 3 characters long", 400)
    );
  }

  if (password.length < 6) {
    return next(
      new AppError("Password must be at least 6 characters long", 400)
    );
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return next(new AppError("Please provide a valid email", 400));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide username and password", 400));
  }

  next();
};
