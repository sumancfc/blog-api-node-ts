import mongoose from "mongoose";

const connectToDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Connected to Database!");
    } catch (error) {
        console.error("Database Connection Error:", error);
        process.exit(1);
    }
};

export default connectToDatabase;
