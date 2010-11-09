exports.is = function is(condition1, condition2, message) {
  if (condition1 !== condition2) {
    throw new Error(message + " - got " + condition1 + ", expected " + condition2);
  }
}

