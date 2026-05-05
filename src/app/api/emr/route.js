import { NextResponse } from 'next/server';
import { getHospitalPool, getQueuePool, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const hospitalPool = await getHospitalPool();
    const queuePool = await getQueuePool();
    
    // Use date from param if provided, otherwise use today's date
    const dateSql = dateParam 
      ? `'${dateParam}'` 
      : "FORMAT(GETDATE(), 'yyyy-MM-dd')";

    // Fetch currently queued patients for today from the LOCAL Queue DB
    const queuedResult = await queuePool.request()
      .query(`
        SELECT emrId 
        FROM Queues 
        WHERE status IN ('Pending', 'Calling') 
        AND CAST(updatedAt AS DATE) = CAST(GETDATE() AS DATE)
      `);
    const queuedIds = new Set(queuedResult.recordset.map(r => r.emrId));

    // Fetch EMR list from the HOSPITAL DB
    const result = await hospitalPool.request()
      .query(`
        SELECT 
          TRIM(enccode) as id,
          TRIM(hpercode) as patientId,
          ISNULL(patfirst, '') + ' ' + ISNULL(patlast, '') as patientName,
          tsdesc as serviceType,
          opddate as appointmentTime
        FROM medilogs.opd.active_list(${dateSql}, 'ALL')
        WHERE tsdesc NOT LIKE '%DIALYSIS%'
        ORDER BY opddate ASC
      `);
    
    console.log(`EMR Fetch: Found ${result.recordset.length} total patients in EMR for ${dateSql}`);

    // Filter out patients who are already in the queue
    const filteredData = result.recordset.filter(p => !queuedIds.has(p.id));
    
    console.log(`EMR Fetch: ${filteredData.length} patients remaining after filtering already queued`);

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('EMR API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
