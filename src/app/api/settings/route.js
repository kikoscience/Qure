import { NextResponse } from 'next/server';
import { getQueuePool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getQueuePool();
    const result = await pool.request()
      .query('SELECT * FROM Settings');
    
    const settings = {};
    result.recordset.forEach(row => {
      settings[row.key_name] = row.value_text;
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { key, value } = await request.json();
    const pool = await getQueuePool();
    
    await pool.request()
      .input('key', sql.VarChar, key)
      .input('value', sql.Text, value)
      .query('IF EXISTS (SELECT 1 FROM Settings WHERE key_name = @key) UPDATE Settings SET value_text = @value WHERE key_name = @key ELSE INSERT INTO Settings (key_name, value_text) VALUES (@key, @value)');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
