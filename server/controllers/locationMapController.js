const User = require('../models/userModel');
const getLocationMap = async (req, res) => {
    try {
        const { lat, lng, dist, role } = req.query;

        //Validation
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Please provide latitude and longitude' });
        }

        //Distance
        const distanceInMeters = (dist || 10) * 1000;

        //Query Setup
        let query = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: distanceInMeters
                }
            },
            isActive: true
        };

        //Role Filter
        if (role) {
            query.roles = role;
        }

        //Execute
        const users = await User.find(query)
            .select('name email roles location profileImage businessInfo')
            .limit(50);

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Location Map Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { getLocationMap };