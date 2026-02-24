const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const ADMIN_PASSWORD = '!o~u*{W;4~HB\\pv%w+W_N/2KDr@y~4G(TJT(=_\';\\Y3KTJ7e4p';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared.');

    // Create admin users
    const admin1 = await User.create({
      name: 'Harshit',
      email: 'harshitbudhlakoti00@gmail.com',
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin user created: ${admin1.email}`);

    const admin2 = await User.create({
      name: 'Jobless Artist',
      email: 'joblessartist99@gmail.com',
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin user created: ${admin2.email}`);

    console.log('\n--- Seed Complete ---');
    console.log(`Admin 1: harshitbudhlakoti00@gmail.com`);
    console.log(`Admin 2: joblessartist99@gmail.com`);
    console.log('--------------------\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
