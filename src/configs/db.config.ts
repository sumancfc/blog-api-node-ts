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

connectToDatabase.closeConnection = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (error) {
        console.error("Error closing database connection:", error);
        throw error;
    }
};

export default connectToDatabase;
