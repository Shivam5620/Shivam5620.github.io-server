const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already registered",
      });
    }

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const username = shortid.generate();
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username,
    });

    const savedUser = await _user.save();

    if (savedUser) {
      const token = generateJwtToken(savedUser._id, savedUser.role);
      const { _id, firstName, lastName, email, role, fullName } = savedUser;
      return res.status(201).json({
        token,
        user: { _id, firstName, lastName, email, role, fullName },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPassword = await user.authenticate(req.body.password);
    if (isPassword && user.role === "user") {
      const token = generateJwtToken(user._id, user.role);
      const { _id, firstName, lastName, email, role, fullName } = user;
      return res.status(200).json({
        token,
        user: { _id, firstName, lastName, email, role, fullName },
      });
    } else {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
