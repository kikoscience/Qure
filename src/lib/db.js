import sql from 'mssql';

const hospitalConfig = {
  server: process.env.HOSPITAL_DB_SERVER || '192.168.1.3',
  database: process.env.HOSPITAL_DB_NAME || 'medilogs',
  user: process.env.HOSPITAL_DB_USER,
  password: process.env.HOSPITAL_DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const queueConfig = {
  server: process.env.QUEUE_DB_SERVER || '192.168.1.3',
  database: process.env.QUEUE_DB_NAME || 'HospitalQueueDB',
  user: process.env.QUEUE_DB_USER,
  password: process.env.QUEUE_DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let hospitalPool = null;
let queuePool = null;

export async function getHospitalPool() {
  try {
    if (hospitalPool && hospitalPool.connected) {
      return hospitalPool;
    }
    
    if (hospitalPool) {
      await hospitalPool.close();
    }

    console.log(`Connecting to Hospital DB at ${hospitalConfig.server}...`);
    hospitalPool = new sql.ConnectionPool(hospitalConfig);
    await hospitalPool.connect();
    return hospitalPool;
  } catch (err) {
    console.error('Hospital DB Connection Error:', err);
    hospitalPool = null;
    throw err;
  }
}

export async function getQueuePool() {
  try {
    if (queuePool && queuePool.connected) {
      return queuePool;
    }

    if (queuePool) {
      await queuePool.close();
    }

    console.log(`Connecting to Queue DB at ${queueConfig.server}...`);
    queuePool = new sql.ConnectionPool(queueConfig);
    await queuePool.connect();
    return queuePool;
  } catch (err) {
    console.error('Queue DB Connection Error:', err);
    queuePool = null;
    throw err;
  }
}

// Backward compatibility (defaults to queue pool)
export async function getPool() {
  return getQueuePool();
}

export { sql };
