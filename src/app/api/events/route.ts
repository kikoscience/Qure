import { NextResponse } from 'next/server';
import { getQueuePool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      let lastData = '';

      const checkData = async () => {
        try {
          const pool = await getQueuePool();
          const result = await pool.request().query('SELECT * FROM Queues ORDER BY updatedAt DESC');
          const currentData = JSON.stringify(result.recordset);
          
          if (currentData !== lastData) {
            lastData = currentData;
            controller.enqueue(encoder.encode(`data: ${currentData}\n\n`));
          }
        } catch (error) {
          console.error('SSE Check Error:', error);
        }
      };

      // Initial check
      await checkData();

      // Poll every 1 second
      const interval = setInterval(checkData, 1000);

      // Clean up on close
      // Note: controller.close() or some cancellation logic might be needed
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
