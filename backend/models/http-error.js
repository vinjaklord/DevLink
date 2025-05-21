// class HttpError extends Error {
//   constructor(message, errorCode) {
//     super(message);
//     this.errorCode = errorCode;
//   }
// }

// export default HttpError;

class HttpError extends Error {
  constructor(message, errorCode, messageArray) {
    super(message);
    this.errorCode = errorCode;
    this.messageArray = messageArray;
  }
  toJSON() {
    return {
      message: this.message,
      messageArray: this.messageArray,
    };
  }
}
export default HttpError;
