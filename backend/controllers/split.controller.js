const Split = require("../models/split.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const axios = require("axios");
const crypto = require("crypto");
const { transporter } = require("../config/mailer.js");
const Group = require("../models/group.model");


const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const razorpayConfig = {
    auth: {
        username: RAZORPAY_KEY_ID,
        password: RAZORPAY_KEY_SECRET
    },
    headers: {
        "Content-Type": "application/json"
    }
};

exports.createSplit = async (req, res) => {
  try {
    const { transaction, paidBy, participants } = req.body;

    const existingTransaction = await Transaction.findById(transaction);
    if (!existingTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const payer = await User.findOne({ email: paidBy });
    if (!payer) {
      return res.status(404).json({ success: false, message: "PaidBy user not found" });
    }

    let participantDetails = [];
    let participantIds = [];

    for (let participant of participants) {
      const user = await User.findOne({ email: participant.email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: `User with email ${participant.email} not found`,
        });
      }

      participantDetails.push({
        user: user._id,
        share: participant.share,
        settled: false,
        settlementMethod: null,
        reminders: [],
      });

      participantIds.push(user._id);
    }

    const split = new Split({
      transaction,
      paidBy: payer._id,
      participants: participantDetails,
    });

    await split.save();


    await User.findByIdAndUpdate(payer._id, { $push: { splits: split._id } });
    for (const participantId of participantIds) {
      await User.findByIdAndUpdate(participantId, { $push: { splits: split._id } });
    }

    const payments = await Promise.all(
      participants.map(async (participant) => {
        try {
          const paymentLink = await axios.post(
            "https://api.razorpay.com/v1/payment_links",
            {
              amount: participant.share * 100, 
              currency: "INR",
              accept_partial: false,
              description: `Split payment for transaction ID: ${transaction}`,
              notes: {
                split_id: split._id.toString(), 
                payer_email : paidBy,
                participant_email: participant.email,
              },
              customer: {
                email: participant.email,
                contact: participant.mobile
              },
              notify: {
                email: true,
                sms: true,
              },
            },
            razorpayConfig
          );

          return {
            email: participant.email,
            payment_link: paymentLink.data.short_url,
          };
        } catch (error) {
          console.error(`Payment link generation failed for ${participant.email}:`, error.message);
          return {
            email: participant.email,
            error: "Payment link generation failed",
          };
        }
      })
    );

    res.status(201).json({
      success: true,
      message: "Split created successfully",
      split,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserSplits = async (req, res) => {
  try {
    const userId = req.params.id;

    const splits = await Split.find({
         paidBy: userId 
    })
      .populate("transaction")
      .populate("paidBy", "name email")
      .populate("group", "name")
      .populate("participants.user", "name email");


    if (!splits.length) {
      return res.status(404).json({ message: "No splits found for this user" });
    }

    res.status(200).json(splits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user splits", error });
  }
};

exports.handleWebhook = async (req, res) => {
    try {
       

        const rawBody = JSON.stringify(req.body);


        const signature = req.headers["x-razorpay-signature"];

        const secret = process.env.RAZORPAY_KEY_SECRET;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");


        if (signature !== expectedSignature) {
            console.error(" Signature Mismatch! Possible Unauthorized Request.");
            return res.status(400).json({ error: "Invalid signature" });
        }

        const event = JSON.parse(rawBody);
        console.log(" Parsed Event:", event);

        if (!event.payload?.payment?.entity) {
            console.error(" Invalid Event Payload");
            return res.status(400).json({ error: "Invalid event payload" });
        }

        const payment = event.payload.payment.entity;

       
        const { split_id, participant_email, payer_email } = payment.notes || {};


        if (!split_id || !participant_email) {
            console.error(" Missing Split ID or Friend Email in Payment Notes");
            return res.status(400).json({ error: "Missing required metadata" });
        }

       
        const split = await Split.findById(split_id).populate("participants.user");

        if (!split) {
            console.error(" Split Not Found - ID:", split_id);
            return res.status(404).json({ error: "Split not found" });
        }

        console.log(" Found Split:", split);

 
        let participantUpdated = false;
        split.participants = split.participants.map((participant) => {
          if (participant.user.email === participant_email) {
                console.log(` Marking payment settled for: ${participant_email}`);
                participant.settled = true;
                participantUpdated = true;
            }
            return participant;
        });

        if (!participantUpdated) {
            console.error(" Participant Not Found in Split");
            return res.status(404).json({ error: "Participant not found in split" });
        }

     
        await split.save();

      
        const allPaid = split.participants.every((p) => p.settled);

        if (allPaid && payer_email) {
            console.log(" Sending Payment Completion Email to:", payer_email);

            await transporter.sendMail({
                to: payer_email,
                subject: "All Payments Completed",
                text: `All participants have completed their payments for split ID: ${split_id}. The transaction is now fully settled.`,
            });

        }

        res.json({ success: true });
    } catch (error) {
        console.error(" Webhook Processing Error:", error);
        res.status(500).json({ error: "Webhook processing failed 2 3" });
    }
};

exports.getUserBalance = async (req, res) => {
  try {
    const { userId } = req.body; 


    const splits = await Split.find({
      $or: [{ paidBy: userId }, { "participants.user": userId }],
    }).populate("paidBy participants.user");

    let amountPaid = 0; 
    let amountOwed = 0; 

    splits.forEach((split) => {
      if (split.paidBy === userId) {
        amountPaid += split.participants.reduce((sum, p) => sum + p.share, 0);
      }

      split.participants.forEach((p) => {
        if (p.user._id.toString() === userId) {
          amountOwed += p.share;
        }
      });
    });

    const netBalance = amountPaid - amountOwed;

    return res.status(200).json({
      userId,
      amountPaid,
      amountOwed,
      netBalance,
      status:
        netBalance > 0 ? "User is owed" : netBalance < 0 ? "User owes" : "Settled",
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.createGroupExpenseWithSplit = async (req, res) => {
  try {
    const { amount, description, category, groupId, paidByEmail } = req.body;

  
    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

  
    const paidBy = await User.findOne({ email: paidByEmail });
    if (!paidBy) {
      return res.status(404).json({ success: false, message: "PaidBy user not found" });
    }


    const transaction = new Transaction({
      amount,
      description,
      category,
      group: groupId,
      createdBy: paidBy._id,
      type: "expense",
      splitType: "group",
    });

    await transaction.save();

 
    const numParticipants = group.members.length;
    const equalShare = parseFloat((amount / numParticipants).toFixed(2));

    const participants = await Promise.all(
      group.members.map(async (member) => ({
        user: member._id,
        share: equalShare,
        settled: false,
        settlementMethod: null,
        reminders: [],
      }))
    );


    const split = new Split({
      transaction: transaction._id,
      paidBy: paidBy._id,
      group: groupId,
      participants,
    });

    await split.save();

   
    transaction.splits.push(split._id);
    await transaction.save();

    
    for (const participant of participants) {
      await User.findByIdAndUpdate(participant.user, {
        $push: { splits: split._id },
      });
    }

    
    const payments = await Promise.all(
      participants.map(async (participant) => {
        const user = await User.findById(participant.user);

        if (String(user._id) === String(paidBy._id)) {
          return null; 
        }

        try {
          const paymentLink = await axios.post(
            "https://api.razorpay.com/v1/payment_links",
            {
              amount: participant.share * 100,
              currency: "INR",
              accept_partial: false,
              description: `Split payment for transaction: ${transaction._id}`,
              notes: {
                split_id: split._id.toString(),
                payer_email: paidByEmail,
                participant_email: user.email,
              },
              customer: {
                email: user.email,
                contact: user.mobile,
              },
              notify: {
                email: true,
                sms: true,
              },
            },
            razorpayConfig
          );

          return {
            email: user.email,
            payment_link: paymentLink.data.short_url,
          };
        } catch (err) {
          console.error(`Payment link failed for ${user.email}:`, err.message);
          return {
            email: user.email,
            error: "Failed to generate payment link",
          };
        }
      })
    );

    res.status(201).json({
      success: true,
      message: "Group expense and split created successfully",
      transaction,
      split,
      payments: payments.filter(Boolean), 
    });
  } catch (error) {
    console.error("Error in createGroupExpenseWithSplit:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserGroupSplits = async (req, res) => {
  const { userId } = req.params;

  try {
    const splits = await Split.find({
      group: { $ne: null }, 
      $or: [
        { paidBy: userId },
        { "participants.user": userId },
      ],
    })
      .populate("transaction")
      .populate("paidBy")
      .populate("group")
      .populate("participants.user");

    if (!splits || splits.length === 0) {
      return res.status(404).json({ message: "No splits found with group for this user." });
    }

    res.status(200).json({ splits });
  } catch (error) {
    console.error("Error in getUserGroupSplits:", error.message);
    res.status(500).json({ message: "Server error while fetching splits." });
  }
};