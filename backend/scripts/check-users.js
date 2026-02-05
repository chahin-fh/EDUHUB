require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB\n');

    // Get all users
    const allUsers = await User.find({}).select('name username email isActive role');
    console.log(`Total users in database: ${allUsers.length}\n`);

    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      process.exit(0);
    }

    console.log('All users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.username || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   isActive: ${user.isActive}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    // Check active users
    const activeUsers = await User.find({ isActive: true });
    console.log(`\n✅ Active users: ${activeUsers.length}`);

    // Check inactive users
    const inactiveUsers = await User.find({ isActive: false });
    console.log(`❌ Inactive users: ${inactiveUsers.length}`);

    // Check users without isActive field
    const usersWithoutIsActive = await User.find({ isActive: { $exists: false } });
    console.log(`⚠️  Users without isActive field: ${usersWithoutIsActive.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
