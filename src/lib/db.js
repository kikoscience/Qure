import sql from 'mssql';

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'HospitalQueueDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true, // Recommended for modern MSSQL
    enableArithAbort: true,
  },
};

let poolPromise;

export async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config)
      .then(pool => {
        console.log('Connected to MSSQL via SQL Auth');
        return pool;
      })
      .catch(err => {
        console.error('Database Connection Failed! Check credentials: ', err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

export { sql };
