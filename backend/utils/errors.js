class AccountLockedError extends Error {
    constructor(message = "Account is locked") {
      super(message);
      this.name = "AccountLockedError";
      this.statusCode = 403;
    }
  }
  
  class InvalidOTPError extends Error {
    constructor(message = "Invalid OTP") {
      super(message);
      this.name = "InvalidOTPError";
      this.statusCode = 401;
    }
  }
  
  class DuplicateCredentialError extends Error {
    constructor(message = "Credential already in use") {
      super(message);
      this.name = "DuplicateCredentialError";
      this.statusCode = 409;
    }
  }
  
  module.exports = {
    AccountLockedError,
    InvalidOTPError,
    DuplicateCredentialError,
  };