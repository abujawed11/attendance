const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendOTPEmail } = require('../services/email.service');
const { generateOTP, getNextSequenceId, getOTPExpiry } = require('../utils/helpers');

/**
 * Step 1: Signup - Generate OTP and send to email
 * POST /api/auth/signup
 */
async function signup(req, res) {
  try {
    const { inviteCode, user, institution, profile } = req.body;

    // Validate required fields
    if (!user || !user.email || !user.password || !user.fullName || !user.roleType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Verify invite code (if required - not for parents)
    if (user.roleType !== 'PARENT') {
      if (!inviteCode) {
        return res.status(400).json({
          success: false,
          message: 'Invite code is required',
        });
      }

      const invite = await prisma.invite.findUnique({
        where: { code: inviteCode },
      });

      if (!invite) {
        return res.status(400).json({
          success: false,
          message: 'Invalid invite code',
        });
      }

      // Check if invite is expired
      if (invite.expiresAt && new Date() > invite.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Invite code has expired',
        });
      }

      // Check if invite has reached max uses
      if (invite.usedCount >= invite.maxUses) {
        return res.status(400).json({
          success: false,
          message: 'Invite code has reached maximum uses',
        });
      }

      // Check if role is allowed
      const allowedRoles = JSON.parse(invite.allowedRoles || '[]');
      if (!allowedRoles.includes(user.roleType)) {
        return res.status(400).json({
          success: false,
          message: `Role ${user.roleType} is not allowed by this invite code`,
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry(10); // 10 minutes

    // Store OTP in database (delete any existing OTPs for this email)
    await prisma.oTP.deleteMany({
      where: {
        email: user.email,
        purpose: 'signup',
      },
    });

    await prisma.oTP.create({
      data: {
        email: user.email,
        otp,
        purpose: 'signup',
        expiresAt,
      },
    });

    // Store signup data temporarily in session/cache
    // For now, we'll send it back to frontend to resend in verify step
    // In production, consider using Redis or session storage

    // Send OTP email
    await sendOTPEmail(user.email, otp, 'signup');

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: user.email,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process signup',
      error: error.message,
    });
  }
}

/**
 * Step 2: Verify OTP and create account
 * POST /api/auth/verify-otp
 */
async function verifyOTP(req, res) {
  try {
    const { email, otp, inviteCode, user, institution, profile } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        purpose: 'signup',
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Start transaction to create user and profile
    const result = await prisma.$transaction(async (tx) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Generate public ID
      const publicId = await getNextSequenceId('user');

      // Find or create institution
      let institutionRecord = null;
      if (institution && institution.type && institution.name) {
        institutionRecord = await tx.institution.findFirst({
          where: {
            name: institution.name,
            type: institution.type,
          },
        });

        if (!institutionRecord) {
          const instPublicId = await getNextSequenceId('institution');
          institutionRecord = await tx.institution.create({
            data: {
              publicId: instPublicId,
              name: institution.name,
              type: institution.type,
            },
          });
        }
      }

      // Create user
      const newUser = await tx.user.create({
        data: {
          publicId,
          email: user.email,
          fullName: user.fullName,
          password: hashedPassword,
          roleType: user.roleType,
          phone: user.phone || null,
          institutionId: institutionRecord?.id || null,
        },
      });

      // Create role-specific profile
      if (profile && profile.kind) {
        switch (profile.kind) {
          case 'studentSchool':
            await tx.studentSchoolProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
                dob: new Date(profile.data.dob),
              },
            });
            break;

          case 'studentCollege':
            await tx.studentCollegeProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
              },
            });
            break;

          case 'facultySchool':
            await tx.facultySchoolProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
              },
            });
            break;

          case 'facultyCollege':
            await tx.facultyCollegeProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
              },
            });
            break;

          case 'parent':
            await tx.parentProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
                provisionalStudentDob: profile.data.provisionalStudentDob
                  ? new Date(profile.data.provisionalStudentDob)
                  : null,
              },
            });
            break;

          case 'admin':
            await tx.adminProfile.create({
              data: {
                userId: newUser.id,
                ...profile.data,
              },
            });
            break;
        }
      }

      // Update invite usage count (if invite was used)
      if (inviteCode && user.roleType !== 'PARENT') {
        await tx.invite.updateMany({
          where: { code: inviteCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return newUser;
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.id,
        publicId: result.publicId,
        email: result.email,
        roleType: result.roleType,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          publicId: result.publicId,
          email: result.email,
          fullName: result.fullName,
          roleType: result.roleType,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP and create account',
      error: error.message,
    });
  }
}

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry(10);

    // Delete old OTPs and create new one
    await prisma.oTP.deleteMany({
      where: {
        email,
        purpose: 'signup',
      },
    });

    await prisma.oTP.create({
      data: {
        email,
        otp,
        purpose: 'signup',
        expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, otp, 'signup');

    res.status(200).json({
      success: true,
      message: 'OTP resent to your email',
      data: {
        email,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
}

/**
 * Login
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institution: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        publicId: user.publicId,
        email: user.email,
        roleType: user.roleType,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userData = {
      publicId: user.publicId,
      email: user.email,
      fullName: user.fullName,
      roleType: user.roleType,
      phone: user.phone,
      institution: user.institution ? {
        name: user.institution.name,
        type: user.institution.type,
      } : null,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
}

module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  login,
};
