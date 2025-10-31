import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { ulid } from 'ulid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Only supervisors can generate QR codes' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('supervisor_qr_codes')
      .select('*')
      .eq('supervisor_id', decoded.userId)
      .eq('valid_date', today)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        qrCode: existing.qr_code_data,
        supervisorId: decoded.userId,
        validDate: today
      });
    }

    const qrCodeData = `AFYA-${decoded.userId}-${ulid()}`;

    const { data, error } = await supabase
      .from('supervisor_qr_codes')
      .insert({
        supervisor_id: decoded.userId,
        qr_code_data: qrCodeData,
        valid_date: today
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      qrCode: qrCodeData,
      supervisorId: decoded.userId,
      validDate: today
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('supervisor_qr_codes')
      .select('*')
      .eq('supervisor_id', decoded.userId)
      .eq('valid_date', today)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ qrCode: null });
    }

    return NextResponse.json({
      qrCode: data.qr_code_data,
      supervisorId: decoded.userId,
      validDate: today
    });
  } catch (error) {
    console.error('Get QR error:', error);
    return NextResponse.json({
      error: 'Failed to fetch QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
