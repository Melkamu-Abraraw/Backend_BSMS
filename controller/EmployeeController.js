const cloudinary = require('cloudinary').v2;
const { response } = require('express');
const Employee = require('../models/Employee');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
cloudinary.config({
  cloud_name: 'ds3wsc8as',
  api_key: '714722695687768',
  api_secret: 'iTi78ih5itaEnbiFF8oc7raVbvw',
});

const addemployee = async (req, res) => {
  console.log(req.body)
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

        const folder = 'EmployeeID';

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

    const relativesUploadPromises = req.body.Relatives.map(async (relative) => {
      const relativeImageUrls = [];
      
      if (relative.imageUrls && relative.imageUrls.length > 0) {
          const relativeUploadPromises = relative.imageUrls.map((relativeFile) => {
              return new Promise((resolve, reject) => {
                  const folder = 'RelativeID';

                  const relativeStream = cloudinary.uploader.upload_stream(
                      { resource_type: 'auto', folder: folder },
                      (error, result) => {
                          if (error) {
                              console.error('Error uploading relative image to Cloudinary:', error);
                              reject({ success: false, error: 'Error uploading relative image to Cloudinary' });
                          }
                          relativeImageUrls.push(result.secure_url);
                          resolve();
                      }
                  );

                  streamifier.createReadStream(relativeFile.buffer).pipe(relativeStream);
              });
          });

          await Promise.all(relativeUploadPromises);
      }

      relativeImageUrls.push(relativeImageUrls);
  });

  await Promise.all(relativesUploadPromises);

  const relatives = req.body.Relatives.map((relative, index) => {
    return {
        FirstName: relative.FirstName,
        LastName: relative.LastName,
        Relative: relative.Relative,
        Address: relative.Address,
        PhoneNumber: relative.PhoneNumber,
        imageUrls: relativesImageUrls[index] || [], 
    };
});


const newEmployee = new Employee({
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    phoneNumber: req.body.phoneNumber,
    DOB: req.body.DOB,
    Experience: req.body.Experience,
    Gender: req.body.Gender,
    JobType: req.body.JobType,
    Skill: req.body.Skill,
    Description: req.body.Description,
    imageUrls: imageUrls,
    Relatives: relatives,
});
    const savedemployee=await newEmployee.save();

    res.json({ success: true, message: 'Employee information added successfully' ,
    data: {
        newEmployee: savedemployee, 
    }});
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
};

const showemployee = (req,res,next) =>{
    Employee.find() 
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
    const deleteemployee= async (req, res) => {
        try {
          const { EmployeeId } = req.body; 
      
          const deletedemployee = await Employee.findByIdAndDelete(EmployeeId);
      
          if (!deletedemployee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
          }
      
          res.json({ success: true, message: 'Employee deleted successfully', deletedemployee });
        } catch (error) {
          console.error('Server error:', error);
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
          }
        }
      };
      
      const updateemployee= async (req, res) => {
        try {
          const { EmployeeId } = req.params;
      
          if (!mongoose.Types.ObjectId.isValid(EmployeeId)) {
            return res.status(400).json({ success: false, error: 'Invalid EmployeeId.' });
          }
      
          const updatedData = {
      FirstName: req.body.FirstName,
      LastName:req.body.LastName,
      phoneNumber:req.body.phoneNumber,
      DOB:req.body.DOB,
      Experience:req.body.Experience,
      Gender:req.body.Gender,
      JobType:req.body.JobType,
      Skill: req.body.Skill,
      Description:req.body.Description,
      
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
      
                const folder = 'EmployeeID';
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
      
          const updatedemployee = await Employee.findByIdAndUpdate(EmployeeId, updatedData, { new: true });
      
          if (!updatedemployee) {
            return res.status(404).json({ success: false, error: 'employee not found.' });
          }
      
          res.json({ success: true, message: 'employee information updated successfully', data: updatedemployee });
        } catch (error) {
          console.error('Server error:', error);
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
          }
        }
      };
      
      
      module.exports = {
         addemployee,
         showemployee,
         deleteemployee,
         updateemployee
      };
    
