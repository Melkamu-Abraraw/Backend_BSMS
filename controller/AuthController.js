const User = require("../models/Users");
const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const {
  initiatePasswordReset,
  completePasswordReset,
  sendResetEmail,
} = require("../utils/email");

cloudinary.config({
  cloud_name: "ds3wsc8as",
  api_key: "714722695687768",
  api_secret: "iTi78ih5itaEnbiFF8oc7raVbvw",
});

const userRegister = (req, res, next) => {
  console.log(req.body);
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                });
              }
              imageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      await Promise.all(uploadPromises);

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }
      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "User",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        message: "User Added Successfully",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};
const agentRegister = async (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async function (err, hashedPass) {
      if (err) {
        return res.json({
          error: err,
        });
      }

      const imageUrls = [];

      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                });
              }
              imageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      await Promise.all(uploadPromises);
      if (
        req.body.FirstName === "" ||
        req.body.LastName === "" ||
        req.body.Password === "" ||
        req.body.Email === "" ||
        req.body.Phone === "" ||
        req.body.ConfirmPassword === ""
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }
      if (
        !/^[a-zA-Z]+$/.test(req.body.FirstName) ||
        !/^[a-zA-Z]+$/.test(req.body.LastName)
      ) {
        return res.status(400).json({
          success: false,
          message: "First name and last name must contain only letters.",
        });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      if (!/^\d+$/.test(req.body.Phone) || req.body.Phone.length > 10) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain only numbers and not exceed 10 digits.",
        });
      }
      if (
        !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          req.body.Email
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email address." });
      }
      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "Agent",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        message: "Agent Added Successfully",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const brokerAdminRegister = (req, res, next) => {
  console.log(req.body);
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                });
              }
              imageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      await Promise.all(uploadPromises);

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }
      let user = new User({
        Email: req.body.Email,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "BrokerAdmin",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        message: "BrokerAdmin Added Successfully",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};
const adminRegister = (req, res, next) => {
  try {
    bcrypt.hash(req.body.Password, 10, async (err, hashedPass) => {
      if (err) {
        return res.json({ error: err });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        if (req.files.length > 2) {
          return res
            .status(400)
            .json({ success: false, error: "Maximum of 1 file allowed." });
        }
      }
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          if (file.size > 10485760) {
            reject({
              success: false,
              error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
            });
          }

          const folder = "ProfilePicture";

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                console.error("Error uploading to Cloudinary:", error);
                reject({
                  success: false,
                  error: "Error uploading to Cloudinary",
                });
              }
              imageUrls.push(result.secure_url);
              resolve();
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });
      await Promise.all(uploadPromises);
      if (
        req.body.FirstName === "" ||
        req.body.LastName === "" ||
        req.body.Password === "" ||
        req.body.Email === "" ||
        req.body.Phone === "" ||
        req.body.ConfirmPassword === ""
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      const existingUser = await User.findOne({ Email: req.body.Email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use.",
        });
      }
      if (
        !/^[a-zA-Z]+$/.test(req.body.FirstName) ||
        !/^[a-zA-Z]+$/.test(req.body.LastName)
      ) {
        return res.status(400).json({
          success: false,
          message: "First name and last name must contain only letters.",
        });
      }
      if (req.body.Password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      if (!/^\d+$/.test(req.body.Phone) || req.body.Phone.length > 10) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain only numbers and not exceed 10 digits.",
        });
      }
      if (
        !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          req.body.Email
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email address." });
      }
      let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: hashedPass,
        ConfirmPassword: hashedPass,
        Role: "Admin",
        imageUrls: imageUrls,
      });

      const usersaved = await user.save();

      res.json({
        message: "BrokerAdmin Added Successfully",
        data: usersaved,
      });
    });
  } catch (error) {
    console.error("Error during agent registration:", error);
    res.status(500).json({
      message: "An error occurred!",
    });
  }
};

const list = (req, res, next) => {
  User.find()
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((error) => {
      res.json({
        message: "An error Occured!",
      });
    });
};
const update = (req, res, next) => {
  let userID = req.body.userID;
  let updatedData = {
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    Email: req.body.Email,
    Phone: req.body.Phone,
  };
  User.findByIdAndUpdate(userID, { $set: updatedData })
    .then(() => {
      res.json({
        message: "User updated Successfully!",
      });
    })
    .catch((error) => {
      res.json({
        message: "An error occurred!",
      });
    });
};
const Remove = (req, res, next) => {
  let userID = req.body.userID;
  User.findOneAndDelete(userID)
    .then(() => {
      res.json({
        message: "User deleted successfully!",
      });
    })
    .catch((error) => {
      res.json({
        message: "An error occurred!",
      });
    });
};

const login = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.Password;

  User.findOne({ $or: [{ Email: username }, { Phone: username }] })
    .then((User) => {
      if (User) {
        bcrypt.compare(password, User.Password, function (err, result) {
          if (err) {
            res.json({
              error: err,
            });
          } else {
            if (result) {
              let token = jwt.sign({ Email: User.Email }, "AZQ,PI)0(", {
                expiresIn: "1h",
              });
              res.json({
                message: "Login Successful",
                token,
                User,
              });
            } else {
              res.json({
                message: "Password does not Matched!",
              });
            }
          }
        });
      } else {
        res.json({
          message: "No user Found!",
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    });
};
const blacklistedTokens = [];

const logout = (req, res) => {
  const token = req.header("Authorization");

  if (token) {
    blacklistedTokens.push(token);
    res.json({ message: "Logout successful" });
  } else {
    res.status(401).json({ message: "Invalid token" });
  }
};

const initiatePassword = async (req, res) => {
  try {
    await initiatePasswordReset(req, res);
  } catch (error) {
    console.error("Error in initiatePasswordResetController:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset initiation.",
    });
  }
};

const completePassword = async (req, res) => {
  try {
    await completePasswordReset(req, res);
  } catch (error) {
    console.error("Error in completePasswordResetController:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset completion.",
    });
  }
};
const getUserById = async (req, res, next) => {
  try {
    let userid = req.params.userid;

    const user = await User.findById(userid);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error while fetching user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user.",
    });
  }
};

module.exports = {
  userRegister,
  agentRegister,
  brokerAdminRegister,
  adminRegister,
  list,
  update,
  Remove,
  login,
  logout,
  completePassword,
  initiatePassword,
  getUserById,
};
