import { NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM Queues WHERE status IN (\'Pending\', \'Calling\') ORDER BY createdAt ASC');
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { patientName, serviceType, classification, emrId, hpercode } = await request.json();
    const pool = await getPool();
    
    // Generate Prefix based on TSCODE (Service Type)
    // We take the first 3 letters and uppercase it (e.g., MEDICAL -> MED)
    const tscodePrefix = serviceType.substring(0, 3).toUpperCase();
    
    const finalPrefix = tscodePrefix;

    // Generate queue number based on this prefix today
    const countResult = await pool.request()
      .input('serviceType', sql.VarChar, serviceType)
      .query('SELECT COUNT(*) as count FROM Queues WHERE serviceType = @serviceType AND CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)');
    
    const count = countResult.recordset[0].count + 1;
    const queueNumber = `${finalPrefix}-${count.toString().padStart(3, '0')}`;

    const result = await pool.request()
      .input('queueNumber', sql.VarChar, queueNumber)
      .input('patientName', sql.VarChar, patientName)
      .input('serviceType', sql.VarChar, serviceType)
      .input('classification', sql.VarChar, classification)
      .input('emrId', sql.VarChar, emrId)
      .input('hpercode', sql.VarChar, hpercode)
      .query('INSERT INTO Queues (queueNumber, patientName, serviceType, classification, emrId, hpercode) OUTPUT INSERTED.* VALUES (@queueNumber, @patientName, @serviceType, @classification, @emrId, @hpercode)');
    
    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status, door } = await request.json();
    const pool = await getPool();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .input('door', sql.VarChar, door || null)
      .query('UPDATE Queues SET status = @status, door = ISNULL(@door, door), updatedAt = GETDATE() OUTPUT INSERTED.* WHERE id = @id');
    
    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
