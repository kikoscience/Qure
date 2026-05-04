import { NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function POST(request) {
  try {
    const { employeeName } = await request.json();
    const pool = await getPool();
    
    const result = await pool.request()
      .input('employeeName', sql.VarChar, employeeName)
      .query(`
        INSERT INTO RecordsStaff (employeeName) 
        OUTPUT INSERTED.* 
        VALUES (@employeeName)
      `);
    
    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pool = await getPool();
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM RecordsStaff WHERE id = @id');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to remove staff' }, { status: 500 });
  }
}
