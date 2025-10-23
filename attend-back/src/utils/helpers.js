const crypto = require('crypto');
const prisma = require('../config/prisma');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate next sequence ID for a model
 * @param {string} modelName - Name of the model (e.g., 'user', 'institution', 'invite')
 * @returns {Promise<string>} Formatted ID (e.g., USR000001)
 */
async function getNextSequenceId(modelName) {
  const prefixes = {
    user: 'USR',
    institution: 'INS',
    invite: 'INV',
    section: 'SEC',
    attendance_session: 'ATT',
  };

  const prefix = prefixes[modelName.toLowerCase()] || 'GEN';

  // Use transaction to ensure atomicity
  const sequence = await prisma.$transaction(async (tx) => {
    // Try to get existing sequence
    let seq = await tx.sequence.findUnique({
      where: { model: modelName.toLowerCase() },
    });

    if (!seq) {
      // Create new sequence if it doesn't exist
      seq = await tx.sequence.create({
        data: {
          model: modelName.toLowerCase(),
          next: 2, // Start from 2, use 1 for current
        },
      });
      return 1;
    }

    // Get current value and increment
    const currentValue = seq.next;
    await tx.sequence.update({
      where: { model: modelName.toLowerCase() },
      data: { next: currentValue + 1 },
    });

    return currentValue;
  });

  // Format with leading zeros (e.g., USR000001)
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
}

/**
 * Calculate OTP expiry time (default: 10 minutes from now)
 * @param {number} minutes - Minutes until expiry
 * @returns {Date} Expiry date
 */
function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = {
  generateOTP,
  getNextSequenceId,
  getOTPExpiry,
};
