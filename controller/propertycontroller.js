
const mongoose = require('mongoose');
const House = require('../models/House');
const Land = require('../models/Land');
const Vehicle = require('../models/Vehicle');


const fetchAllValues = async (req, res) => {
    try {
      
        const data1 = await House.find({ Status: 'Approved' }).populate({path: 'Broker',
        select: 'FirstName LastName Phone'})
        

       
        const data2 = await Land.find({ Status: 'Approved' }).populate({path: 'Broker',
        select: 'FirstName LastName Phone'});
        ;

       const data3 = await Vehicle.find({ Status: 'Approved' }).populate({path: 'Broker',
       select: 'FirstName LastName Phone'});

        const allData = {
            collection1: data1,
            collection2: data2,
            collection3: data3
        };

       
        res.json({ success: true, data: allData });
    } catch (error) {
       
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, error: 'An error occurred while fetching data' });
    }
};


module.exports = { fetchAllValues };
