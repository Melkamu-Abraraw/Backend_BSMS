const cloudinary = require('cloudinary').v2;
const { response } = require('express');
const EmployeeRelative= require('../models/EmployeeRelative');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
cloudinary.config({
  cloud_name: 'ds3wsc8as',
  api_key: '714722695687768',
  api_secret: 'iTi78ih5itaEnbiFF8oc7raVbvw',
});

const addemployeerelative = async (req, res) => {
  try {
    const imageUrls = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded.' });
    }
    if (req.files.length > 4) {
      return res.status(400).json({ success: false, error: 'Maximum of 3 files allowed.' });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        if (file.size > 10485760) {
          reject({
            success: false,
            error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
          });
        }

        const folder = 'EmployeeRelativeID';

        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: folder },
          (error, result) => {
            if (error) {
              console.error('Error uploading to Cloudinary:', error);
              reject({ success: false, error: 'Error uploading to Cloudinary' });
            }
            imageUrls.push(result.secure_url);
            resolve();
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

   
    await Promise.all(uploadPromises);

    const newEmployeeRelative = new EmployeeRelative({

      FirstName: req.body.FirstName,
      LastName:req.body.LastName,
      Relative:req.body.Relative,
      Address:req.body.Address,
      PhoneNumber:req.body.PhoneNumber,
      imageUrls: imageUrls,
    });

    const savedemployeerelative=await newEmployeeRelative.save();

    res.json({ success: true, message: 'Employee information added successfully' ,
    data: {
        newEmployeeRelative: savedemployeerelative, 
    }});
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
};

const showemployeerelative = (req,res,next) =>{
    EmployeeRelative.find() 
    .then (response =>{
        res.json({
            response
        })
    })
    .catch(error =>{
        res.json({
            message:'An error Occured!'
        })
    })
}
    const deleteemployeerelative= async (req, res) => {
        try {
          const { EmployeeRelativeId } = req.body; 
      
          const deletedemployeerelative = await EmployeeRelative.findByIdAndDelete(EmployeeRelativeId);
      
          if (!deletedemployeerelative) {
            return res.status(404).json({ success: false, error: 'EmployeeRelative not found' });
          }
      
          res.json({ success: true, message: 'Employee deleted successfully', deletedemployeerelative });
        } catch (error) {
          console.error('Server error:', error);
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
          }
        }
      };
      
      const updateemployeerelative= async (req, res) => {
        try {
          const { EmployeeRelativeId } = req.params;
      
          if (!mongoose.Types.ObjectId.isValid(EmployeeRelativeId)) {
            return res.status(400).json({ success: false, error: 'Invalid EmployeeId.' });
          }
      
          const updatedData = {
            FirstName: req.body.FirstName,
            LastName:req.body.LastName,
            Relative:req.body.Relative,
            Address:req.body.Address,
            PhoneNumber:req.body.PhoneNumber
      
          };
      
          if (req.files && req.files.length > 0) {
            const newImageUrls = [];
            const uploadPromises = req.files.map((file) => {
              return new Promise((resolve, reject) => {
                if (file.size > 10485760) {
                  reject({
                    success: false,
                    error: `File ${file.originalname} is too large. Maximum size is 10 MB.`,
                  });
                }
      
                const folder = 'EmployeeRelativeID';
                const stream = cloudinary.uploader.upload_stream(
                  { resource_type: 'auto', folder: folder },
                  (error, result) => {
                    if (error) {
                      console.error('Error uploading to Cloudinary:', error);
                      reject({ success: false, error: 'Error uploading to Cloudinary', file: file.originalname });
                    }
                    newImageUrls.push(result.secure_url);
                    resolve();
                  }
                );
      
                streamifier.createReadStream(file.buffer).pipe(stream);
              });
            });
      
            await Promise.all(uploadPromises);
            updatedData.imageUrls = newImageUrls;
          }
      
          const updatedemployeerelative = await EmployeeRelative.findByIdAndUpdate(EmployeeRelativeId, updatedData, { new: true });
      
          if (!updatedemployeerelative) {
            return res.status(404).json({ success: false, error: 'employeeRelative not found.' });
          }
      
          res.json({ success: true, message: 'employeeRelative information updated successfully', data: updatedemployeerelative });
        } catch (error) {
          console.error('Server error:', error);
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
          }
        }
      };
      
      
      module.exports = {
         addemployeerelative,
         showemployeerelative,
         deleteemployeerelative,
         updateemployeerelative
      };
    
