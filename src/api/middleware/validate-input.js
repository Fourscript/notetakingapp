/*
  @description Validates the email and password input from the user
*/
export function user(email, password) {
  if (!email || !password) {
    throw { error: "Empty field in form input." };
  }

  if (!email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)) {
    throw { error: "Invalid email address." };
  }

  if (password.length < 6 || password.length > 40) {
    console.error("Password sizing error.");
    throw { error: "Password must be between 6 and 40 characters." };
  }
}

const validateInput = { user };
export default validateInput;
