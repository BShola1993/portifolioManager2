// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasURI = process.env.MONGO_URI;
  const localURI = 'mongodb://127.0.0.1:27017/futureBanking';
  const currentURI = atlasURI || localURI;

  try {
    console.log(`🔗 Connecting to MongoDB: ${currentURI}`);
    await mongoose.connect(currentURI); // modern mongoose, no extra options
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // Retry after 10s instead of exiting
    setTimeout(connectDB, 10000);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Reconnecting...');
    connectDB();
  });
};

module.exports = connectDB;
