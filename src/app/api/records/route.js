import { NextResponse } from 'next/server';
import { getQueuePool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getQueuePool();
    // Get all records for today
    const result = await pool.request()
      .query(`
        SELECT * FROM HospitalQueueDB.dbo.Queues 
        WHERE CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY createdAt ASC
      `);
    
    return NextResponse.json({
      records: result.recordset
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch records data' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, recordStatus, recordRetrievedBy } = await request.json();
    const pool = await getQueuePool();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('recordStatus', sql.VarChar, recordStatus)
      .input('recordRetrievedBy', sql.VarChar, recordRetrievedBy)
      .query(`
        UPDATE HospitalQueueDB.dbo.Queues 
        SET recordStatus = @recordStatus, 
            recordRetrievedBy = @recordRetrievedBy, 
            updatedAt = GETDATE() 
        OUTPUT INSERTED.* 
        WHERE id = @id
      `);
    
    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
