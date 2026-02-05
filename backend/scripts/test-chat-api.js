require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function testChatAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB\n');

    // Simulate the listUsers query (what happens when you click +)
    const testUserId = '6984db1152a8d502a3bc733d'; // Admin user ID from check-users
    
    console.log('Testing listUsers query (what the + button calls):\n');
    
    const query = {
      _id: { $ne: testUserId },
      isActive: true,
    };

    const users = await User.find(query)
      .select('name username email avatar')
      .sort({ username: 1, name: 1, createdAt: -1 })
      .limit(20);

    console.log(`Query: ${JSON.stringify(query, null, 2)}`);
    console.log(`\nResults: ${users.length} users found\n`);

    if (users.length === 0) {
      console.log('❌ No users returned! This is why the picker is empty.');
      console.log('\nPossible reasons:');
      console.log('1. All users have isActive: false');
      console.log('2. The only active user is the current user (excluded by _id: { $ne: ... })');
      console.log('3. No users exist in database');
    } else {
      console.log('✅ Users found:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || user.username || 'No name'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });
    }

    // Now test with the other user
    console.log('\n--- Testing from the other user\'s perspective ---\n');
    const otherUserId = '6984db96cfa81a5daf40fac1'; // malek user ID
    
    const query2 = {
      _id: { $ne: otherUserId },
      isActive: true,
    };

    const users2 = await User.find(query2)
      .select('name username email avatar')
      .sort({ username: 1, name: 1, createdAt: -1 })
      .limit(20);

    console.log(`Query: ${JSON.stringify(query2, null, 2)}`);
    console.log(`\nResults: ${users2.length} users found\n`);

    if (users2.length > 0) {
      console.log('✅ Users found:');
      users2.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || user.username || 'No name'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testChatAPI();
