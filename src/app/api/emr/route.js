import { NextResponse } from 'next/server';
import { getHospitalPool, getQueuePool, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // 1. Get Connections
    let hospitalPool, queuePool;
    try {
      hospitalPool = await getHospitalPool();
      queuePool = await getQueuePool();
    } catch (connErr) {
      return NextResponse.json({ error: `Connection Phase Failed: ${connErr.message}` }, { status: 500 });
    }
    
    const dateSql = dateParam 
      ? `'${dateParam}'` 
      : "FORMAT(GETDATE(), 'yyyy-MM-dd')";

    // 2. Fetch from Queue DB
    let queuedIds = new Set();
    try {
      const queuedResult = await queuePool.request()
        .query(`
          SELECT emrId 
          FROM HospitalQueueDB.dbo.Queues 
          WHERE CAST(updatedAt AS DATE) = CAST(GETDATE() AS DATE)
        `);
      queuedIds = new Set(queuedResult.recordset.map(r => r.emrId));
    } catch (queueErr) {
      return NextResponse.json({ error: `Queue DB Query Failed: ${queueErr.message}` }, { status: 500 });
    }

    // 3. Fetch from Hospital DB
    try {
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
      
      const filteredData = result.recordset.filter(p => !queuedIds.has(p.id));
      return NextResponse.json(filteredData);
    } catch (hospErr) {
      return NextResponse.json({ error: `Hospital DB Query Failed: ${hospErr.message}` }, { status: 500 });
    }

  } catch (error) {
    console.error('EMR API Fatal Error:', error);
    return NextResponse.json({ error: `Fatal API Crash: ${error.message}` }, { status: 500 });
  }
}
