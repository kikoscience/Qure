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
};

const queueConfig = {
  server: process.env.QUEUE_DB_SERVER || 'localhost',
  database: process.env.QUEUE_DB_NAME || 'HospitalQueueDB',
  user: process.env.QUEUE_DB_USER,
  password: process.env.QUEUE_DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
};

let hospitalPool;
let queuePool;

export async function getHospitalPool() {
  if (!hospitalPool) {
    hospitalPool = new sql.ConnectionPool(hospitalConfig);
    await hospitalPool.connect();
    console.log('Connected to Hospital MSSQL (192.168.1.3)');
  }
  return hospitalPool;
}

export async function getQueuePool() {
  if (!queuePool) {
    queuePool = new sql.ConnectionPool(queueConfig);
    await queuePool.connect();
    console.log('Connected to Queue MSSQL (Local)');
  }
  return queuePool;
}

// Backward compatibility (defaults to queue pool)
export async function getPool() {
  return getQueuePool();
}

export { sql };
