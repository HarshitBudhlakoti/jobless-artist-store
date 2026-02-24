const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const ADMIN_PASSWORD = '!o~u*{W;4~HB\\pv%w+W_N/2KDr@y~4G(TJT(=_\';\\Y3KTJ7e4p';

const admins = [
  { name: 'Harshit', email: 'harshitbudhlakoti00@gmail.com' },
  { name: 'Jobless Artist', email: 'joblessartist99@gmail.com' },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    for (const admin of admins) {
      const existing = await User.findOne({ email: admin.email });
      if (existing) {
        existing.role = 'admin';
        await existing.save();
        console.log(`Updated existing user to admin: ${admin.email}`);
      } else {
        await User.create({
          name: admin.name,
          email: admin.email,
          password: ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log(`Created admin user: ${admin.email}`);
      }
    }

    console.log('\nAdmin seeding complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmins();
