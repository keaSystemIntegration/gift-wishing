import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Don't use this file

dotenv.config();

const mongoURI = `mongodb+srv://${process.env.AUTH_SERVICE_MONGO_USERNAME}:${process.env.MONGO_PASSWORD}
@gift-wish-auth.rpteshg.mongodb.net/${process.AUTH_SERVICE_env.MONGO_DATABASE}?retryWrites=true&w=majority`;

try {
  const connection = mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to the mongo db instance');
  });
} catch (error) {
  console.log('Unable to connect to the database:', error);
}

const connection = mongoose.connection;

export default connection;
