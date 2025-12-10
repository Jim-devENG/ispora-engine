import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.js';
import { UserProfile, AuthTokens, LoginRequest, RegisterRequest } from '../types/index.js';

export class AuthService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async register(data: RegisterRequest): Promise<{ user: Omit<UserProfile, 'password'>; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = this.db.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const now = new Date().toISOString();
    const user: UserProfile = {
      id: uuidv4(),
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: hashedPassword,
      phone: '',
      bio: '',
      location: '',
      company: '',
      position: '',
      title: '',
      website: '',
      linkedIn: '',
      university: '',
      graduationYear: '',
      program: '',
      skills: [],
      expertise: [],
      role: 'student',
      experience: 0,
      isVerified: false,
      isOnline: true,
      lastActive: now,
      interests: [],
      mutualConnections: 0,
      responseRate: 0,
      isDiaspora: false,
      availability: {
        mentoring: false,
        collaboration: false,
        consultation: false,
      },
      openTo: [],
      socialLinks: {},
      achievements: [],
      universities: [],
      privacy: {
        profileVisibility: 'public',
        contactVisibility: 'alumni',
        professionalVisibility: 'public',
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
      },
      createdAt: now,
      updatedAt: now,
    };

    const createdUser = this.db.createUser(user);
    const tokens = this.generateTokens(createdUser);

    // Remove password from response
    const { password, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async login(data: LoginRequest): Promise<{ user: Omit<UserProfile, 'password'>; tokens: AuthTokens }> {
    const user = this.db.getUserByEmail(data.email);
    
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last active
    this.db.updateUser(user.id, { isOnline: true, lastActive: new Date().toISOString() });

    const tokens = this.generateTokens(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  generateTokens(user: UserProfile): AuthTokens {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const accessTokenOptions: SignOptions = {
      expiresIn: expiresIn as any
    };

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      accessTokenOptions
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    const refreshTokenOptions: SignOptions = {
      expiresIn: refreshExpiresIn as any
    };

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      refreshSecret,
      refreshTokenOptions
    );

    // Parse expiresIn to seconds
    const expiresInSeconds = this.parseExpiresIn(expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string; email: string };
      const user = this.db.getUserById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: return 7 * 24 * 60 * 60;
    }
  }
}

