// Component Interface
class Property {
    async fetchApprovedProperties() {}
}

// Leaf Classes
class HouseProperty extends Property {
    async fetchApprovedProperties() {
        return await House.find({ Status: 'Approved' }).populate({
            path: 'Broker',
            select: 'FirstName LastName Phone'
        });
    }
}

class LandProperty extends Property {
    async fetchApprovedProperties() {
        return await Land.find({ Status: 'Approved' }).populate({
            path: 'Broker',
            select: 'FirstName LastName Phone'
        });
    }
}

class VehicleProperty extends Property {
    async fetchApprovedProperties() {
        return await Vehicle.find({ Status: 'Approved' }).populate({
            path: 'Broker',
            select: 'FirstName LastName Phone'
        });
    }
}

// Composite Class
class CompositeProperty extends Property {
    constructor() {
        super();
        this.properties = [];
    }

    addProperty(property) {
        this.properties.push(property);
    }

    async fetchApprovedProperties() {
        const allData = {};
        for (const property of this.properties) {
            const propertyName = property.constructor.name;
            allData[propertyName] = await property.fetchApprovedProperties();
        }
        return allData;
    }
}

// Creating Instances of Leaf Classes
const houseProperty = new HouseProperty();
const landProperty = new LandProperty();
const vehicleProperty = new VehicleProperty();

// Creating Composite Object
const compositeProperty = new CompositeProperty();
compositeProperty.addProperty(houseProperty);
compositeProperty.addProperty(landProperty);
compositeProperty.addProperty(vehicleProperty);

// Fetching Approved Properties
const fetchAllValues = async (req, res) => {
    try {
        const allData = await compositeProperty.fetchApprovedProperties();
        res.json({ success: true, data: allData });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, error: 'An error occurred while fetching data' });
    }
};

module.exports = { fetchAllValues };
