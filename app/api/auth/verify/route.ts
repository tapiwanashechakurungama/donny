import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import User from '../../../../models/User';
import { generateToken } from '../../../../lib/auth';
import { isTokenExpired } from '../../../../lib/tokens';
import '../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    // Find user with the verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.emailVerificationExpires && isTokenExpired(user.emailVerificationExpires)) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please register again.' },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification token
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    // Don't generate JWT token - user must log in manually
    return NextResponse.json({
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      },
      // No token - user must log in manually
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const { generateVerificationToken, getTokenExpiry } = await import('../../../../lib/tokens');
    const verificationToken = generateVerificationToken();
    const verificationExpires = getTokenExpiry(24); // 24 hours

    // Update user with new verification token
    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const { sendVerificationEmail } = await import('../../../../lib/email');
    const emailSent = await sendVerificationEmail(email, user.username, verificationToken);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
