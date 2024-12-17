const bcrypt = require('bcrypt');

// Function to create a hashed password
async function createHashPassword(plainPassword) {
  try {
    // Generate a salt with 10 rounds (you can adjust the rounds based on your needs)
    const saltRounds = 10;
    
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    return hashedPassword;  // Return the hashed password
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

// Function to compare a plain password with a hashed password
async function comparePassword(plainPassword, hashedPassword) {
  try {
    // Compare the plain password with the stored hashed password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    
    return isMatch;  // Return true if passwords match, false otherwise
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
}

// Example usage:
(async () => {
  const password = 'mySecretPassword123';
  
  // Hash the password
  const hashedPassword = await createHashPassword(password);
  console.log('Hashed Password:', hashedPassword);

  // Compare the plain password with the hashed one
  const isPasswordCorrect = await comparePassword(password, hashedPassword);
  console.log('Password is correct:', isPasswordCorrect);  // Should return true
})();

exports.createHashPassword = createHashPassword;
exports.comparePassword = comparePassword;