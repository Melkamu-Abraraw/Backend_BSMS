const User = require("./models/User");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    if (req.body.FirstName) user.FirstName = req.body.FirstName;
    if (req.body.LastName) user.LastName = req.body.LastName;
    if (req.body.Phone) user.Phone = req.body.Phone;

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 1) {
        return res
          .status(400)
          .json({ success: false, error: "Maximum of 1 file allowed." });
      }

      const file = req.files[0];
      if (file.size > 10485760) {
        return res.status(400).json({
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
            return res
              .status(500)
              .json({ success: false, error: "Error uploading to Cloudinary" });
          }
          imageUrls.push(result.secure_url);
          user.imageUrls = imageUrls;
          user.save();
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { updateProfile };
