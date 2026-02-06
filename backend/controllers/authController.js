import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// Generate temporary token for 2FA verification (short-lived)
const generateTempToken = (userId) => {
  return jwt.sign(
    { id: userId, temp: true },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '5m' }
  );
};

// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, inviteCode } = req.body;

    // Validate invite code
    const validInviteCode = process.env.INVITE_CODE || 'STUCCO2024';
    if (!inviteCode || inviteCode.toUpperCase() !== validInviteCode.toUpperCase()) {
      return res.status(403).json({
        message: 'Invalid invite code. Please contact your administrator.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      role: 'user'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return temp token for 2FA verification
      const tempToken = generateTempToken(user._id);
      return res.status(200).json({
        message: 'Two-factor authentication required',
        requiresTwoFactor: true,
        tempToken
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Logout (client-side will remove token)
export const logout = async (req, res) => {
  res.status(200).json({
    message: 'Logout successful'
  });
};

// Setup 2FA - Generate secret and QR code
export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Generate new secret using OTPAuth
    const secret = new OTPAuth.Secret({ size: 20 });

    // Create TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: 'Stucco Rite Inc',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    // Get the otpauth URL for QR code
    const otpauthUrl = totp.toString();

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      message: 'Scan this QR code with your authenticator app',
      qrCode: qrCodeDataUrl,
      secret: secret.base32 // Allow manual entry if QR scan fails
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      message: 'Error setting up 2FA',
      error: error.message
    });
  }
};

// Verify 2FA setup - Enable 2FA after verifying code
export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.userId).select('+twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        message: 'Please set up 2FA first'
      });
    }

    // Create TOTP object with stored secret
    const totp = new OTPAuth.TOTP({
      issuer: 'Stucco Rite Inc',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
    });

    // Verify the code (allow 1 period window for clock drift)
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({
        message: 'Invalid verification code'
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA and save backup codes
    user.twoFactorEnabled = true;
    user.backupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes: backupCodes // Show once, user should save these
    });
  } catch (error) {
    console.error('2FA verify setup error:', error);
    res.status(500).json({
      message: 'Error verifying 2FA',
      error: error.message
    });
  }
};

// Verify 2FA during login
export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        message: 'Token and code are required'
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(
        tempToken,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid or expired token. Please login again.'
      });
    }

    if (!decoded.temp) {
      return res.status(401).json({
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret +backupCodes');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if it's a backup code
    const backupCodeIndex = user.backupCodes.indexOf(code.toUpperCase());
    if (backupCodeIndex !== -1) {
      // Remove used backup code
      user.backupCodes.splice(backupCodeIndex, 1);
      await user.save();
    } else {
      // Create TOTP object with stored secret
      const totp = new OTPAuth.TOTP({
        issuer: 'Stucco Rite Inc',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
      });

      // Verify the code (allow 1 period window for clock drift)
      const delta = totp.validate({ token: code, window: 1 });

      if (delta === null) {
        return res.status(400).json({
          message: 'Invalid verification code'
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate full token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('2FA login verify error:', error);
    res.status(500).json({
      message: 'Error verifying 2FA',
      error: error.message
    });
  }
};

// Disable 2FA
export const disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify password before disabling 2FA
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    res.status(200).json({
      message: 'Two-factor authentication disabled'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      message: 'Error disabling 2FA',
      error: error.message
    });
  }
};
