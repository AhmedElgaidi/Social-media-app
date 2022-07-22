const crypto = require("crypto");
const bcrypt = require("bcrypt");

//=====================================================

// (1)
const generateArrayOfRandom12DigitsAndChars = async () => {
  // (1) Create array of codes
  let createdCodes = [];

  // (2) Assign codes to the array
  for (let i = 0; i < 10; i++) {
    // Generate 12 random digits and strings to be used as a backup codes
    createdCodes[i] = await crypto.randomBytes(6).toString("hex");
  }

  // (3) Return array of codes
  return createdCodes;
};

// (2)
const hashBackupCodes = async (codes) => {
  // (1) Define empty array
  let hashedCodes = [];

  // (2) Hash the array of strings received
  for (let i = 0; i < codes.length; i++) {
    code = await bcrypt.hash(codes[i], 10); // Salt is 10, so less time and higher performance
    hashedCodes.push({ code });
  }

  // (3) Return the hashed array
  return hashedCodes;
};

// (3)
const is_given_backup_code_found = (givenCode, userCodes) => {
  // (1) create empty array
  let index = -1, // -1 => (Element is not found)
    result = [];

  // (2) Check the given code against our saved user hashed codes
  for (let i = 0; i < userCodes.length; i++) {
    // (1) Save result of comparison
    let currentCode = bcrypt.compareSync(givenCode, userCodes[i].code);

    // (2) If result is true, then the element is found. So, save it's index!
    if (currentCode) index = i;

    // (3) Push element to the array
    result.push(currentCode);
  }

  // (3) Remove falsy values
  result = result.filter(Boolean);

  // (4) Return result and matched code index
  if (result.length == 0) {
    // It means no truthy values found in the array
    return {
      value: false,
      index,
    };
  }

  return { value: true, index }; // It means there is a match
};

module.exports = {
  generateArrayOfRandom12DigitsAndChars,
  hashBackupCodes,
  is_given_backup_code_found,
};
