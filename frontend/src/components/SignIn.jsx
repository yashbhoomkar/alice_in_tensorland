import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SignIn = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpSent, setOtpSentFlag] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(0);
  
  const refs = useRef(Array.from({ length: 6 }, () => null));
  const [userDetails, setUserDetails] = useState({ 
    email: "",
    name: "",
    mobileNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Send OTP and check if user exists
  const handleEmailSubmit = async () => {
    if (!userDetails.email) {
      setError("Please enter an email");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Send OTP
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: userDetails.email,
      });
      
      console.log(response);
      setOtpSentFlag(true); // Show OTP entry UI
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      setError("Error processing your request");
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      let OTP = otp.join("");
      if (OTP.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        return;
      }
      
      setLoading(true);
      setError("");
      console.log(userDetails);
      console.log(OTP);
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: userDetails.email,
        otp : OTP,
      });
      console.log(response, "dsfdsfds");
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.name == "" || response.data.user.mobileNumber == "" ) {
        setOtpSentFlag(false);
        setShowRegistration(true);
        setRegistrationStep(0);
      } else {
        // Otherwise, user exists, so log them in
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("OTP verification failed");
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (registrationStep === 0 && !userDetails.name) {
      setError("Please enter your name");
      return;
    }
    
    setRegistrationStep(prev => prev + 1);
    setError("");
  };

  const handlePrevStep = () => {
    setRegistrationStep(prev => prev - 1);
    setError("");
  };

  const registerUser = async () => {
    if (!userDetails.mobileNumber) {
      setError("Please enter your mobile number");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const user = JSON.parse(localStorage.getItem('user'));
      const userid = user._id;
      console.log(userid);
      const response = await axios.post("http://localhost:5000/api/auth/add-details", {
        userId : userid,
        name: userDetails.name,
        mobile: userDetails.mobileNumber
      });

      console.log(response.data , "isdfs");
      
      if (response.data) {
        // localStorage.setItem("token", response.data.data.token);
        navigate("/dashboard");
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      setError("");
      
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: userDetails.email,
      });
      
      setLoading(false);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error(err);
      setError("Failed to resend OTP");
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleOtpChange = (event, index) => {
    const inputValue = event.target.value;
    if (!/^[0-9]?$/.test(inputValue)) return;
    
    setOtp((prevState) => {
      const newState = [...prevState];
      newState[index] = inputValue;
      return newState;
    });

    if (inputValue !== "" && index < 5) refs.current[index + 1].focus();
  };

  const handleKeyPress = (e, inputField) => {
    if (e.key === 'Enter') {
      if (inputField === 'email') {
        handleEmailSubmit();
      } else if (inputField === 'otp') {
        verifyOTP();
      } else if (registrationStep < 1) {
        handleNextStep();
      } else {
        registerUser();
      }
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.3 }} 
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"
    >
      <div className="flex flex-col bg-white shadow-lg p-8 rounded-xl min-w-[320px] w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome</h1>
        
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Email Input - Always visible initially */}
        {!isOtpSent && !showRegistration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={userDetails.email} 
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, 'email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email" 
                autoFocus
              />
            </div>
            
            <button 
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? "Processing..." : "Continue"}
            </button>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account? Don't worry, we'll create one for you if needed.
            </div>
          </motion.div>
        )}

        {/* OTP Verification Form */}
        {isOtpSent && !showRegistration && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="w-full space-y-6"
          >
            <div className="text-center mb-2">
              <p className="text-gray-600">We've sent a verification code to</p>
              <p className="font-medium text-gray-800">{userDetails.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input 
                    key={index} 
                    ref={(el) => (refs.current[index] = el)} 
                    type="text" 
                    value={digit} 
                    onChange={(event) => handleOtpChange(event, index)}
                    onKeyPress={(e) => handleKeyPress(e, 'otp')}
                    inputMode="numeric" 
                    maxLength="1"
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                ))}
              </div>
            </div>
            
            <button 
              onClick={verifyOTP} 
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            
            <div className="text-center text-sm">
              <button 
                onClick={resendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-70"
              >
                Resend OTP
              </button>
            </div>
          </motion.div>
        )}

        {/* Registration Form with Name and Mobile Number */}
        {showRegistration && (
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Complete Your Profile</h2>
            
            <div className="relative h-64 overflow-hidden">
              <AnimatePresence initial={false} custom={registrationStep}>
                <motion.div
                  key={registrationStep}
                  custom={registrationStep}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute w-full"
                >
                  <div className="space-y-4">
                    <div className="mb-2">
                      <span className="text-sm text-blue-600 font-medium">
                        Step {registrationStep + 1} of 2
                      </span>
                    </div>
                    
                    {registrationStep === 0 ? (
                      <>
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                          What's your name?
                        </label>
                        <input 
                          type="text"
                          name="name"
                          value={userDetails.name}
                          onChange={handleInputChange}
                          onKeyPress={(e) => handleKeyPress(e, 'name')}
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                          What's your mobile number?
                        </label>
                        <input 
                          type="tel"
                          name="mobileNumber"
                          value={userDetails.mobileNumber}
                          onChange={handleInputChange}
                          onKeyPress={(e) => handleKeyPress(e, 'mobileNumber')}
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your mobile number"
                          autoFocus
                        />
                      </>
                    )}
                    
                    <div className="flex justify-between pt-6">
                      {registrationStep > 0 ? (
                        <button 
                          onClick={handlePrevStep}
                          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Back
                        </button>
                      ) : (
                        <div></div>
                      )}
                      
                      {registrationStep < 1 ? (
                        <button 
                          onClick={handleNextStep}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Next
                        </button>
                      ) : (
                        <button 
                          onClick={registerUser}
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                          {loading ? "Processing..." : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {[0, 1].map((step) => (
                <div 
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === registrationStep ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SignIn;