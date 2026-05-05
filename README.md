# Qure Hospital Command Center V3.4

A high-fidelity, real-time medical logistics and patient queue management system.

---

## 🚀 Quick Start (Docker Deployment)

### 1. Configure the Environment
The app uses a `.env` file for all database connections. Create or edit the `.env` file in the root:

```ini
# HOSPITAL DATABASE (iHOMIS)
HOSPITAL_DB_SERVER=192.168.1.3
HOSPITAL_DB_NAME=medilogs
HOSPITAL_DB_USER=sa
HOSPITAL_DB_PASSWORD=VibeQ@123_SecurePassword

# QUEUE DATABASE
QUEUE_DB_SERVER=192.168.1.3
QUEUE_DB_NAME=HospitalQueueDB
QUEUE_DB_USER=hqdb
QUEUE_DB_PASSWORD=VibeQ@123_SecurePassword
```

### 2. Initialize the Queue Database
Connect to your SQL Server and run the following script to create the required table:

```sql
CREATE DATABASE HospitalQueueDB;
GO
USE HospitalQueueDB;
GO

CREATE TABLE Queues (
    id INT PRIMARY KEY IDENTITY(1,1),
    queueNumber NVARCHAR(50),
    patientName NVARCHAR(255),
    serviceType NVARCHAR(255),
    status NVARCHAR(50) DEFAULT 'Pending',
    classification NVARCHAR(50) DEFAULT 'Regular',
    emrId NVARCHAR(255),
    hpercode NVARCHAR(255),
    door NVARCHAR(50),
    recordStatus NVARCHAR(50) DEFAULT 'Pending',
    recordRetrievedBy NVARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO
```

### 3. Launch the App
```bash
docker compose up -d --build
```

---

## 🛠 Features

### 📂 Portals
- **Triage**: `/triage` - Assign patients to clinic doors.
- **Staff Station**: `/staff?door=1` - Call and manage patients.
- **Public Display**: `/display` - Real-time queue board with Voice AI.
- **Records**: `/records` - Track physical chart retrieval.

---

## ⚙️ Development
To run locally without Docker:
1. `npm install`
2. `npm run dev`
The app will be available at `http://localhost:3010`.
