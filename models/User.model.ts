import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

export const UserModel = mongoose.model("User", UserSchema);
export type UserDocument = mongoose.InferSchemaType<typeof UserSchema> & mongoose.Document;
