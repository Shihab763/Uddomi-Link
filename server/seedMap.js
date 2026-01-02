const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

dotenv.config();

const BD_LOCATIONS = [
    { 
        name: "Jamal Uddin", 
        business: "Ctg Shipbreakers Art",
        city: "Chittagong",
        coords: [91.8210, 22.3569] 
    },
    { 
        name: "Fatema Begum", 
        business: "Sylhet Tea Crafts",
        city: "Sylhet",
        coords: [91.8687, 24.8949] 
    },
    { 
        name: "Rahim Sheikh", 
        business: "Rajshahi Silk House",
        city: "Rajshahi",
        coords: [88.6034, 24.3636] 
    },
    { 
        name: "Arifa Akter", 
        business: "Sundarbans Honey Co.",
        city: "Khulna",
        coords: [89.5403, 22.8456] 
    },
    { 
        name: "Kamal Hossain", 
        business: "River Weavers",
        city: "Barisal",
        coords: [90.3705, 22.7010] 
    },
    { 
        name: "Nazma Khatun", 
        business: "Shatranji Carpets",
        city: "Rangpur",
        coords: [89.2372, 25.7439] 
    },
    { 
        name: "Bulbul Ahmed", 
        business: "Nakshi Kantha Store",
        city: "Mymensingh",
        coords: [90.4023, 24.7471] 
    },
    { 
        name: "Sultana Razia", 
        business: "Comilla Khadi Cloths",
        city: "Comilla",
        coords: [91.1715, 23.4607] 
    },
    { 
        name: "Abdul Malek", 
        business: "Cox's Shell Crafts",
        city: "Cox's Bazar",
        coords: [91.9881, 21.4272] 
    },
    { 
        name: "Tania Rahman", 
        business: "Dhaka Muslin",
        city: "Dhaka",
        coords: [90.4120, 23.7925] 
    }
];

const seedLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 MongoDB Connected...');

        const shihab = await User.findOne({ name: { $regex: 'shihab', $options: 'i' } });
        if (shihab) {
            shihab.location = {
                type: 'Point',
                coordinates: [67.0011, 24.8607],
                city: 'Karachi',
                address: 'Pakistan'
            };
            await shihab.save();
        }

        console.log('🗺️ Seeding unique users across Bangladesh...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        for (let i = 0; i < BD_LOCATIONS.length; i++) {
            const data = BD_LOCATIONS[i];
            const email = `artisan_bd_${i}@demo.com`;

            await User.findOneAndUpdate(
                { email: email },
                {
                    name: data.name, 
                    password: hashedPassword,
                    roles: ['artist'],
                    isActive: true,
                    businessInfo: { type: data.business }, 
                    location: {
                        type: 'Point',
                        coordinates: data.coords,
                        city: data.city,
                        address: `${data.city} Main Road`
                    }
                },
                { upsert: true, new: true, runValidators: false }
            );
            
            console.log(`📍 Created/Updated: ${data.name} in ${data.city}`);
        }

        console.log('🎉 Seeding Complete! Refresh your map.');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedLocations();