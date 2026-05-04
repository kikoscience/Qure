# Qure Hospital Command Center V3.4

A high-fidelity, real-time medical logistics and patient queue management system designed for modern hospital environments. Built with Next.js, Framer Motion, and Microsoft SQL Server.

---

## 🚀 Quick Start (Docker Deployment)

The fastest way to deploy the entire stack (App + MSSQL Database) on your Proxmox/Debian server.

### Prerequisites
- Docker & Docker Compose installed.
- Minimum 4GB RAM (SQL Server requires 2GB+).

### 1. Launch the Stack
```bash
git clone <your-repo-url>
cd qure
sudo docker-compose up -d --build
```

### 2. Initialize the Database
Connect to the database at `your-server-ip:1433` (Username: `sa`, Password: `VibeQ@123_SecurePassword`) and run:

```sql
CREATE DATABASE HospitalQueueDB;
GO
USE HospitalQueueDB;
GO
CREATE TABLE Queues (
    id INT PRIMARY KEY IDENTITY(1,1),
    queueNumber NVARCHAR(50),
    patientName NVARCHAR(255),
    door NVARCHAR(50),
    status NVARCHAR(50), 
    classification NVARCHAR(50), 
    serviceType NVARCHAR(255),
    recordStatus NVARCHAR(50), 
    recordRetrievedBy NVARCHAR(255),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO
```

---

## 🛠 Features

### 📺 Public Display Board
- **Real-time SSE Streams**: Zero-latency patient calling notifications.
- **Dual-Lane Logic**: Supports Priority vs. Regular queuing across 5 stations.
- **Smart Infotainment**: Integrated YouTube stream with auto-embed conversion.
- **Voice Announcements**: Automated high-fidelity text-to-speech for patient calls.

### 🏥 Staff Station
- **Multi-Station Control**: Nurses can call/re-broadcast patients for specific doors.
- **Real-time Analytics**: Live view of pending vs. active patients in the queue.

### 📂 Records Portal
- **Logistics Pipeline**: Split-pane view for "Intake Queue" vs. "Retrieval Hub".
- **Digital Chain of Custody**: Tracks chart printing and physical retrieval status.

---

## ⚙️ Configuration

Environment variables are managed in `docker-compose.yml`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `QUEUE_DB_SERVER` | Internal hostname for the DB container | `db` |
| `QUEUE_DB_USER` | SQL Admin username | `sa` |
| `QUEUE_DB_PASSWORD` | Secure SQL Password | `VibeQ@123_SecurePassword` |
| `NODE_ENV` | Application mode | `production` |

---

## 👨‍💻 Development

To run locally without Docker:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
