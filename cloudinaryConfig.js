const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ds3wsc8as',
  api_key: '714722695687768',
  api_secret: 'iTi78ih5itaEnbiFF8oc7raVbvw',
});

module.exports = cloudinary;