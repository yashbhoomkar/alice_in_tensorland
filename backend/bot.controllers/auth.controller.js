const User = require("../models/user.model");
const OTPModel = require("../models/otpModel");
const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const {
  AccountLockedError,
  InvalidOTPError,
  DuplicateCredentialError,
} = require("../utils/errors");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class AuthController {
  constructor(handler) {
    this.handler = handler;
    this.states = {
      INITIAL: "AUTH:INITIAL",
      REGISTER_EMAIL: "AUTH:REGISTER_EMAIL",
      VERIFY_OTP: "AUTH:VERIFY_OTP",
      REGISTER_MOBILE: "AUTH:REGISTER_MOBILE",
      LOGIN_OTP: "AUTH:LOGIN_OTP",
    };
  }

  // Generate 6-digit numeric OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // auth.controller.js
  async handleInput(user, text) {
    const [_, state] = user.currState?.split(":") || [];
    const handlers = {
      REGISTER_EMAIL: () => this.handleEmailInput(user, text),
      VERIFY_OTP: () => this.handleOTPVerification(user, text),
      REGISTER_MOBILE: () => this.handleMobileInput(user, text),
      LOGIN_OTP: () => this.handleLoginOTP(user, text),
    };

    if (handlers[state]) {
      await handlers[state]();
    } else {
      this.handler.sendMessage(
        user.chatId,
        "❌ Invalid authentication state",
        this.handler.getMainKeyboard()
      );
    }
  }

  async sendOTPEmail(email, otp) {
    try {
      await transporter.sendMail({
        from: `FinanceBot <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Your Verification Code",
        text: `Your OTP is ${otp}. Valid for 10 minutes.`,
        html: `<b>${otp}</b> is your verification code. It expires in 10 minutes.`,
      });
      logger.info(`OTP sent to ${email}`);
    } catch (error) {
      logger.error("Email sending failed:", error);
      throw new Error("Failed to send OTP email");
    }
  }

  // Manage OTP records in database
  async manageOTPRecord(email, otp) {
    try {
      await OTPModel.findOneAndUpdate(
        { email },
        { OTP: otp, createdAt: Date.now() },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error("OTP record management failed:", error);
      throw new Error("OTP service unavailable");
    }
  }

  // Verify OTP against database
  async verifyOTP(email, otp) {
    try {
      const record = await OTPModel.findOne({ email });

      if (!record || record.OTP !== otp) {
        throw new InvalidOTPError("Invalid verification code");
      }

      const TEN_MINUTES = 600000;
      if (Date.now() - record.createdAt > TEN_MINUTES) {
        await OTPModel.deleteOne({ _id: record._id });
        throw new InvalidOTPError("Code expired. Please request new one.");
      }

      await OTPModel.deleteOne({ _id: record._id });
      return true;
    } catch (error) {
      logger.error("OTP verification failed:", error);
      throw error;
    }
  }

  // Start new user registration flow
  async startRegistration(user) {
    try {
      console.log("REG ERROR", user);
      if (user.inProgressData?.email) {
        // user.currState = "INITMENU";
        user.email = user.inProgressData?.email;
        user.name = user.email.split("@")[0];
        user.inProgressData = {};
        user.isVerified = true;
        user.markModified("inProgressData");
        await user.save();
        this.handler.sendMessage(
          user.chatId,
          "Login Successfully !",
          this.handler.getCancelKeyboard()
        );

        return;
      }
      if (user.currState === this.states.REGISTER_EMAIL)
        return this.handleEmailInput(user);
      if (user.currState === this.states.VERIFY_OTP)
        return this.handleOTPVerification(user);
      user.currState = this.states.REGISTER_EMAIL;
      await user.save();
      this.handler.sendMessage(
        user.chatId,
        "📧 Please enter your email address to begin:",
        this.handler.getCancelKeyboard()
      );
    } catch (error) {
      logger.error("Registration start failed:", error);
      this.handler.sendMessage(user.chatId, "🚨 Failed to start registration");
    }
  }

  // Handle email input during registration
  async handleEmailInput(user, text) {
    try {
      const email = text.trim().toLowerCase();

      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        throw new Error("❌ Invalid email format");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.chatId !== user.chatId) {
        const temp = user.chatId;
        await User.deleteOne({ chatId: user.chatId });
        user = existingUser;
        user.chatId = temp;
        await user.save();
      }

      const otp = this.generateOTP();
      await this.manageOTPRecord(email, otp);
      await this.sendOTPEmail(email, otp);

      // Update user state
      user.inProgressData.email = email;
      user.markModified("inProgressData");
      user.currState = this.states.VERIFY_OTP;
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        `📨 Verification code sent to ${email}. Enter it here:`,
        this.handler.getCancelKeyboard()
      );
    } catch (error) {
      this.handleAuthError(user, error, "email validation");
    }
  }

  // Verify registration OTP
  async handleOTPVerification(user, text) {
    try {
      const { email } = user.inProgressData;
      const otp = text.trim();

      await this.verifyOTP(email, otp);

      // Check if mobile needs collection
      if (!user.mobile) {
        user.currState = this.states.REGISTER_MOBILE;
        await user.save();
        return this.handler.sendMessage(
          user.chatId,
          "📱 Please enter your mobile number (10 digits):",
          this.handler.getCancelKeyboard()
        );
      }

      user.email = email;
      user.name = email.split("@")[0];
      await user.save();

      // Complete registration
      await this.completeRegistration(user);
    } catch (error) {
      this.handleAuthError(user, error, "OTP verification");
    }
  }

  // Handle mobile number input
  async handleMobileInput(user, text) {
    try {
      const mobile = text.trim();

      // Validate mobile format
      if (!/^\d{10}$/.test(mobile)) {
        throw new Error("❌ Invalid format. 10 digits required.");
      }

      // Check existing mobile
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser.chatId !== user.chatId) {
        throw new DuplicateCredentialError("Mobile number already registered");
      }

      // Save and complete registration
      user.mobile = mobile;
      // user.currState = this.states.REGISTER_EMAIL;
      return this.startRegistration(user);
      // await this.completeRegistration(user);
    } catch (error) {
      this.handleAuthError(user, error, "mobile validation");
    }
  }

  // Finalize user registration
  async completeRegistration(user) {
    try {
      user.isVerified = true;
      user.inProgressData = {};
      user.currState = "";
      user.markModified("inProgressData");
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        "🎉 Registration complete! Use /help for commands.",
        this.handler.getMainKeyboard()
      );
    } catch (error) {
      logger.error("Registration completion failed:", error);
      this.handler.sendMessage(user.chatId, "🚨 Error completing registration");
    }
  }

  // Initiate login process
  async startLogin(user) {
    try {
      if (!user.email) return this.startRegistration(user);

      const otp = this.generateOTP();
      await this.manageOTPRecord(user.email, otp);
      await this.sendOTPEmail(user.email, otp);

      user.currState = this.states.LOGIN_OTP;
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        `🔑 Login code sent to ${user.email}. Enter it here:`,
        this.handler.getCancelKeyboard()
      );
    } catch (error) {
      this.handleAuthError(user, error, "login initiation");
    }
  }

  // Verify login OTP
  async handleLoginOTP(user, text) {
    try {
      const otp = text.trim();
      await this.verifyOTP(user.email, otp);

      user.isVerified = true;
      user.currState = "INITMENU";
      await user.save();

      this.handler.sendMessage(
        user.chatId,
        "✅ Login successful!",
        this.handler.getMainKeyboard()
      );
    } catch (error) {
      this.handleAuthError(user, error, "login verification");
    }
  }

  // Complete logout process
  async logoutUser(user) {
    try {
      // Reset all authentication-related fields
      // user.isVerified = false;
      user.currState = this.states.INITIAL;
      // user.inProgressData = {};
      // user.email = undefined;
      // user.mobile = undefined;
      // user.name = undefined;
      const temp = user.chatId;
      user.chatId = null;
      user.markModified("inProgressData");
      await user.save();

      this.handler.sendMessage(
        temp,
        "🔒 Successfully logged out. Send /start to register again.",
        this.handler.createKeyboard(["/start"])
      );
      logger.info(`User ${user.chatId} logged out`);
    } catch (error) {
      logger.error("Logout failed:", error);
      this.handler.sendMessage(
        user.chatId,
        "🚨 Failed to logout. Please try again."
      );
    }
  }

  // Handle back navigation
  async handleBack(user) {
    try {
      const stateTransitions = {
        [this.states.REGISTER_EMAIL]: this.states.INITIAL,
        [this.states.VERIFY_OTP]: this.states.REGISTER_EMAIL,
        [this.states.REGISTER_MOBILE]: this.states.VERIFY_OTP,
        [this.states.LOGIN_OTP]: this.states.INITIAL,
      };

      const newState = stateTransitions[user.currState] || this.states.INITIAL;
      user.currState = newState;
      await user.save();

      if (newState === this.states.INITIAL) {
        this.handler.sendMessage(
          user.chatId,
          "🏠 Returning to start...",
          this.handler.getMainKeyboard()
        );
      } else {
        this.handler.showCurrentMenu(user);
      }
    } catch (error) {
      logger.error("Back navigation error:", error);
      await this.handler.resetUserState(user);
    }
  }

  // Display user profile
  showProfile(user) {
    const profileInfo = [
      "👤 Your Profile",
      `Name: ${user.name || "Not set"}`,
      `Email: ${user.email || "Not registered"}`,
      `Mobile: ${user.mobile || "Not provided"}`,
      `Status: ${user.isVerified ? "Verified ✅" : "Unverified ❌"}`,
      `Registered: ${user.createdAt.toLocaleDateString()}`,
    ].join("\n");

    this.handler.sendMessage(
      user.chatId,
      profileInfo,
      this.handler.getMainKeyboard()
    );
  }

  // Central error handler
  handleAuthError(user, error, context) {
    logger.error(`Auth Error (${context}): ${error.stack}`);

    const errorMessages = {
      [DuplicateCredentialError.name]: "📢 Credential already exists",
      [InvalidOTPError.name]: "⚠️ Invalid/expired code",
      [AccountLockedError.name]: "🔒 Account locked",
      default: "❌ Authentication failed. Try again.",
    };

    const message =
      errorMessages[error.constructor.name] || errorMessages.default;

    this.handler.sendMessage(
      user.chatId,
      `${message}\nCurrent step: ${user.currState.split(":")[1] || "Main"}`,
      this.handler.getCancelKeyboard()
    );

    // Reset state for security errors
    if (error instanceof AccountLockedError) {
      this.handler.resetUserState(user);
    }
  }
}

module.exports = AuthController;
