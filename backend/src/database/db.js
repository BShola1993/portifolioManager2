// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasURI = process.env.MONGO_URI;
  const localURI = 'mongodb://127.0.0.1:27017/futureBanking';

  let currentURI = atlasURI || localURI;

  const connectWithRetry = async () => {
    try {
      console.log(`🔗 Trying to connect to MongoDB using URI: ${currentURI}`);
      const conn = await mongoose.connect(currentURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (${currentURI}): ${error.message}`);

      // fallback to local MongoDB if Atlas fails
      if (currentURI === atlasURI) {
        console.log('⚙️ Retrying with local MongoDB...');
        currentURI = localURI;
        connectWithRetry();
      } else {
        console.error('❌ Local MongoDB connection failed, retrying in 10s...');
        setTimeout(connectWithRetry, 10000);
      }
    }
  };

  connectWithRetry();

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected! Retrying connection...');
    setTimeout(connectWithRetry, 5000);
  });
};

module.exports = connectDB;
