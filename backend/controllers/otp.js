const otpModel = require("../model/otpModel.js");
const otpGenerator = require("otp-generator");
const { transporter } = require("../config/mailer.js");
const user = require("../model/user");


exports.sentOtp = async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  
  if (!email)
    return res.status(401).json({
      message: "TimeOut",
    });

  const existingUser = await user.findOne({ email });

  if (!existingUser)
    return res.status(500).json({
      message: "UNAUTHORIZED USER",
    });

  const OTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  console.log(email, OTP);
  const otpData = new otpModel({ email, OTP });
  await otpData.save();

  const info = await transporter.sendMail({
    from: "sstar0wifi@gmail.com",
    to: `${email}`,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${OTP}`,
    html: `<b>${OTP}</b>`,
  });

  console.log("Message sent: %s", info.messageId);
  res.send("OTP sent successfully");
};

exports.verifyOtp = async (req, res, next) => {
  const { email, OTP } = req.body;

  if (!email || !OTP)
    return res.status(401).json({
      message: "TimeOut",
    });

  console.log(email, OTP);
  const otpData = await otpModel.findOne({ email, OTP });

  if (otpData) {
    const existingUser = await user.findOne({ email });
    console.log(existingUser);
    res.user = existingUser;
    next();
  } else {
    res.status(400).send("Invalid OTP");
  }
};
