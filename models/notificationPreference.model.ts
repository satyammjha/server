import mongoose from "mongoose";

const NotifcationPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true
    },
    receiveJobOnEmail: {
        type: Boolean
    },
    name: {
        type: String
    },
    emailId: {
        type: String
    },
    isJobEmailSend: {
        type: Boolean
    }
})

export const NotificationPreferenceModel = mongoose.model("NotificationPreferenceModel", NotifcationPreferenceSchema);