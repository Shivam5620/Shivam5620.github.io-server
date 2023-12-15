const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

exports.signup = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "Admin already registered",
      });
    }

    const count = await User.estimatedDocumentCount();
    let role = "admin";
    if (count === 0) {
      role = "super-admin";
    }

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username: shortid.generate(),
      role,
    });

    const savedUser = await _user.save();
    if (savedUser) {
      return res.status(201).json({
        message: "Admin created Successfully..!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};


exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.authenticate(req.body.password);

    if (!isPasswordValid || (user.role !== "admin" && user.role !== "super-admin")) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { _id, firstName, lastName, email, role, fullName } = user;
    res.cookie("token", token, { expiresIn: "1d" });

    return res.status(200).json({
      token,
      user: { _id, firstName, lastName, email, role, fullName },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};
