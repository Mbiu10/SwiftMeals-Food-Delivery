import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://victormbiu:QWERTYUIOP123@cluster0.ovscq.mongodb.net/swift-meals').then(()=>console.log("DB Connected"));
}