import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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

    const { action, chwId, qrCode, supervisorId } = await request.json();

    if (action === 'supervisor-check-in') {
      if (decoded.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: 'Only supervisors can sign in CHWs' }, { status: 403 });
      }

      const { data: qrData } = await supabase
        .from('supervisor_qr_codes')
        .select('*')
        .eq('qr_code_data', qrCode)
        .eq('supervisor_id', decoded.userId)
        .eq('valid_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (!qrData) {
        return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('chw_id', chwId)
        .eq('date', new Date().toISOString().split('T')[0])
        .eq('status', 'CHECKED_IN')
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'CHW already checked in today' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          chw_id: chwId,
          supervisor_id: decoded.userId,
          qr_code: qrCode,
          date: new Date().toISOString().split('T')[0],
          status: 'CHECKED_IN',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'CHW checked in successfully',
        attendanceId: data.id
      });
    }

    if (action === 'supervisor-check-out') {
      if (decoded.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: 'Only supervisors can sign out CHWs' }, { status: 403 });
      }

      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('chw_id', chwId)
        .eq('supervisor_id', decoded.userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .eq('status', 'CHECKED_IN')
        .maybeSingle();

      if (!attendance) {
        return NextResponse.json({ error: 'No active check-in found for this CHW' }, { status: 400 });
      }

      const checkInTime = new Date(attendance.check_in_time);
      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const pointsEarned = Math.floor(hoursWorked * 10);

      await supabase
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'CHECKED_OUT',
          points_earned: pointsEarned
        })
        .eq('id', attendance.id);

      return NextResponse.json({
        success: true,
        message: 'CHW checked out successfully',
        pointsEarned,
        hoursWorked: hoursWorked.toFixed(2)
      });
    }

    if (action === 'chw-check-in') {
      const { data: qrData } = await supabase
        .from('supervisor_qr_codes')
        .select('*')
        .eq('qr_code_data', qrCode)
        .eq('supervisor_id', supervisorId)
        .eq('valid_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (!qrData) {
        return NextResponse.json({ error: 'Invalid QR code or expired' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('chw_id', decoded.userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .eq('status', 'CHECKED_IN')
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          chw_id: decoded.userId,
          supervisor_id: supervisorId,
          qr_code: qrCode,
          date: new Date().toISOString().split('T')[0],
          status: 'CHECKED_IN',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Checked in successfully',
        attendanceId: data.id
      });
    }

    if (action === 'chw-check-out') {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('chw_id', decoded.userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .eq('status', 'CHECKED_IN')
        .maybeSingle();

      if (!attendance) {
        return NextResponse.json({ error: 'No active check-in found' }, { status: 400 });
      }

      const checkInTime = new Date(attendance.check_in_time);
      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const pointsEarned = Math.floor(hoursWorked * 10);

      await supabase
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'CHECKED_OUT',
          points_earned: pointsEarned
        })
        .eq('id', attendance.id);

      return NextResponse.json({
        success: true,
        message: 'Checked out successfully',
        pointsEarned,
        hoursWorked: hoursWorked.toFixed(2)
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json({
      error: 'Failed to process attendance',
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (type === 'my-status') {
      const { data } = await supabase
        .from('attendance')
        .select('*, supervisor:users!attendance_supervisor_id_fkey(name)')
        .eq('chw_id', decoded.userId)
        .eq('date', date)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        attendance: data || null
      });
    }

    if (type === 'supervisor-view') {
      const { data } = await supabase
        .from('attendance')
        .select('*, chw:users!attendance_chw_id_fkey(name, email)')
        .eq('supervisor_id', decoded.userId)
        .eq('date', date)
        .order('check_in_time', { ascending: false });

      const formatted = data?.map(a => ({
        ...a,
        chw_name: a.chw?.name,
        chw_email: a.chw?.email
      }));

      return NextResponse.json({ attendance: formatted || [] });
    }

    if (type === 'supervisor-chws') {
      const { data: allChws } = await supabase
        .from('users')
        .select('id, name, email, county')
        .eq('role', 'CHW')
        .order('name');

      return NextResponse.json({ chws: allChws || [] });
    }

    if (type === 'admin-stats') {
      const { data: allAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date);

      const uniqueChws = new Set(allAttendance?.map(a => a.chw_id) || []);
      const currentlyWorking = allAttendance?.filter(a => a.status === 'CHECKED_IN').length || 0;
      const checkedOut = allAttendance?.filter(a => a.status === 'CHECKED_OUT').length || 0;
      const totalPoints = allAttendance?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

      const { data: dailyData } = await supabase
        .from('attendance')
        .select('date, chw_id')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      const dailyTrend = Object.entries(
        dailyData?.reduce((acc: any, item) => {
          if (!acc[item.date]) acc[item.date] = new Set();
          acc[item.date].add(item.chw_id);
          return acc;
        }, {}) || {}
      ).map(([date, chws]: [string, any]) => ({
        date,
        chws: chws.size
      }));

      return NextResponse.json({
        stats: {
          total_checked_in: uniqueChws.size,
          currently_working: currentlyWorking,
          checked_out: checkedOut,
          total_points_today: totalPoints
        },
        dailyTrend
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({
      error: 'Failed to fetch attendance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
