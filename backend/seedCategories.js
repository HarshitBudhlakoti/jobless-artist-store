const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const categories = [
  { name: 'Oil Paintings', description: 'Classic oil paintings on canvas', type: 'painting', displayOrder: 1 },
  { name: 'Watercolor', description: 'Delicate watercolor artwork', type: 'painting', displayOrder: 2 },
  { name: 'Acrylic Paintings', description: 'Bold acrylic paintings', type: 'painting', displayOrder: 3 },
  { name: 'Portraits', description: 'Custom and ready-made portraits', type: 'portrait', displayOrder: 4 },
  { name: 'Landscapes', description: 'Beautiful landscape paintings', type: 'painting', displayOrder: 5 },
  { name: 'Abstract Art', description: 'Modern abstract art pieces', type: 'painting', displayOrder: 6 },
  { name: 'Crafts', description: 'Handmade craft items', type: 'craft', displayOrder: 7 },
  { name: 'Custom Art', description: 'Commission your own custom artwork', type: 'custom', displayOrder: 8 },
];

const seed = async () => {
  await connectDB();

  const existing = await Category.countDocuments();
  if (existing > 0) {
    console.log(`Already ${existing} categories in DB. Skipping seed.`);
    process.exit(0);
  }

  for (const cat of categories) {
    await Category.create(cat);
    console.log(`  Created: ${cat.name}`);
  }

  console.log(`\nSeeded ${categories.length} categories.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
