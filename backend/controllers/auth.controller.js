const User = require("../models/user.model");
const OtpModel = require("../models/otpModel");
const otpGenerator = require("otp-generator");
const {transporter} = require("../config/mailer");
const Transaction = require("../models/transaction.model");
const Split = require("../models/split.model");
const Group = require("../models/group.model");

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets : false,upperCaseAlphabets :false, specialChars: false });

        await OtpModel.findOneAndUpdate(
            { email },
            { OTP: otp },
            { upsert: true, new: true }
        );

       
        await transporter.sendMail({
            from: "sohamslate2004@gmail.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        });

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.log(error, "sadas");
        res.status(500).json({ message: "Error sending OTP", error });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

        const otpRecord = await OtpModel.findOne({ email });
        if (!otpRecord || otpRecord.OTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await OtpModel.deleteOne({ email });

        let user = await User.findOne({ email });
        console.log(user , "ds");

        if (!user) {
            user = new User({ email , name:"" , mobile:""});
            await user.save();
        }

        res.status(200).json({
            message: "OTP verified successfully",
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};

exports.updateUserDetails = async (req, res) => {
    try {
        const { userId, mobile, name } = req.body;
        console.log(name , mobile , userId , "upadte start ");
        if (!userId || !mobile || !name) return res.status(400).json({ message: "User ID and mobile are required" });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { mobile, name },
            { new: true }
        );

        console.log(updatedUser, "updating user ");

        res.status(200).json({ message: "User details updated", user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Error updating details", error });
    }
};


exports.verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({ message: "Email is already in use", exists: true });
        } else {
            return res.status(200).json({ message: "Email is available", exists: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Error checking the email", error: error.message });
    }
};

exports.getUserDataById = async (req, res) => {
    
    try {
        const { userId } = req.params;
    
        if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
        }
    

        const user = await User.findById(userId).lean();
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }
    
        const transactions = await Transaction.find({ createdBy: userId })
        .populate({
            path: "splits",
            populate: {
            path: "participants.user",
            select: "name email",
            },
        })
        .populate("group", "name description members")
        .lean();
    
        const groups = await Group.find({ members: userId })
        .populate("members", "name email")
        .lean();
    
        const userSplits = await Split.find({
        "participants.user": userId,
        })
        .populate("transaction", "amount description category")
        .populate("group", "name description")
        .populate("paidBy", "name email")
        .populate({
            path: "participants.user",
            select: "name email",
        })
        .lean();
    
        return res.status(200).json({
        user,
        transactions,
        groups,
        userSplits,
        });
    
    } catch (err) {
        console.error("Error fetching full user data:", err);
        res.status(500).json({ message: "Internal server error" });
    }
    };
      