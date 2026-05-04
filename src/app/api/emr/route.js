import { NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const pool = await getPool();
    
    // Use date from param if provided, otherwise use today's date
    const dateSql = dateParam 
      ? `'${dateParam}'` 
      : "FORMAT(GETDATE(), 'MM-dd-yyyy')";

    // Fetch currently queued patients for today to filter them out
    const queuedResult = await pool.request()
      .query(`
        SELECT emrId 
        FROM HospitalQueueDB.dbo.Queues 
        WHERE status IN ('Pending', 'Calling') 
        AND CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
      `);
    const queuedIds = new Set(queuedResult.recordset.map(r => r.emrId));

    // Fetch EMR list from medilogs
    const result = await pool.request()
      .query(`
        SELECT 
          TRIM(enccode) as id,
          TRIM(hpercode) as patientId,
          patfirst + ' ' + patlast as patientName,
          tsdesc as serviceType,
          opddate as appointmentTime
        FROM medilogs.opd.active_list(${dateSql}, 'ALL')
        WHERE tsdesc NOT LIKE '%DIALYSIS%'
        AND TRIM(opd_loc) = 'OPDMAIN'
        ORDER BY opddate ASC
      `);
    
    console.log(`EMR Fetch: Found ${result.recordset.length} total patients in EMR for ${dateSql}`);

    // Filter out patients who are already in the queue
    const filteredData = result.recordset.filter(p => !queuedIds.has(p.id));
    
    console.log(`EMR Fetch: ${filteredData.length} patients remaining after filtering already queued`);

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('EMR API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch EMR data' }, { status: 500 });
  }
}
