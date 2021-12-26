const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const connectDB = async () => {
  const DB = process.env.DATABASE.replace('<password>', process.env.DB_PW);
  try {
    await mongoose.connect(DB);
    console.log('Connected to database');
  } catch (e) {
    console.log('Error connecting database: ' + e.message);
  }
};

module.exports = connectDB;
