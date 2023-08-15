import mongoose from 'mongoose';
import { MONGO_URI } from '../../config/conf';

export const dbConnection = () => {
    mongoose.set('strictQuery', true);
    mongoose
        .connect(MONGO_URI)
        .then(async (data) => {
            console.log(
                `MongoDB connected with server: ${data.connection.host}`
            );
        })
        .catch((err) => {
            console.log(`MongoDB connection error: ${err}`);
        });
};
