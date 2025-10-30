import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { comparePassword, generateToken } from '@/lib/auth';
import { isSimpleMode } from '@/lib/config';
import { getUserByEmail as storeGetUserByEmail, verifyPassword as storeVerifyPassword } from '@/lib/simple-store';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    let user: any = null;
    let isValidPassword = false;
    if (isSimpleMode()) {
      user = await storeGetUserByEmail(email);
      if (user) {
        isValidPassword = !!(await storeVerifyPassword(email, password));
      }
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      user = data;
      if (error || !user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      isValidPassword = await comparePassword(password, user.password_hash);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
