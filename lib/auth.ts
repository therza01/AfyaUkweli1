import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase, User, UserRole } from './supabase';
import { isSimpleMode } from './config';
import { getUserById as getUserByIdStore } from './simple-store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_for_demo_only';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  if (isSimpleMode()) {
    return await getUserByIdStore(payload.userId);
  } else {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as User;
  }
}

export function hashConsentCode(code: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(code).digest('hex');
}
