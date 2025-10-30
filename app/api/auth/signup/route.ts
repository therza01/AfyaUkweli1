import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['CHW', 'SUPERVISOR', 'ADMIN']).default('CHW'),
  county: z.string().optional(),
  sub_county: z.string().optional(),
  ward: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', validatedData.email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        role: validatedData.role,
        phone: validatedData.phone,
        county: validatedData.county,
        sub_county: validatedData.sub_county,
        ward: validatedData.ward,
      })
      .select()
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const token = generateToken(newUser);

    const { password_hash, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: 'Account created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
