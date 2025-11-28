import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import User from '../../../../models/User';
import { hashPassword, generateToken } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/email';
import { generateVerificationToken, getTokenExpiry } from '../../../../lib/tokens';
import { Op } from 'sequelize';
import '../../../../lib/sync'; // Auto-sync database

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, profilePicture } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationExpires = getTokenExpiry(24); // 24 hours

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePicture || null,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, username, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      // Still allow registration but note the email issue
    }

    // Don't generate JWT token until email is verified
    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      },
      // No token until email is verified
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
