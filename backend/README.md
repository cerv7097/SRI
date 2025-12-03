# Stucco Rite Inc. - Backend API

Node.js/Express backend with MongoDB for the Stucco Rite Digital Forms Portal.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the MongoDB connection string if needed.

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally:
   - macOS: `brew install mongodb-community`
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Linux: Follow instructions at [mongodb.com](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. Start MongoDB:
   ```bash
   # macOS/Linux
   brew services start mongodb-community

   # Or manually
   mongod --config /usr/local/etc/mongod.conf
   ```

3. The default connection string is already set in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/stucco_rite
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stucco_rite?retryWrites=true&w=majority
   ```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Forms
All form endpoints support the following form types:
- `safety-meeting`
- `vehicle-inspection`
- `daily-log`
- `scaffold-inspection`

**Endpoints:**
- `POST /api/forms/:formType` - Create a new form
- `GET /api/forms/:formType` - Get all forms of a type (supports `?limit=10&status=completed`)
- `GET /api/forms/:formType/:id` - Get a specific form by ID
- `PUT /api/forms/:formType/:id` - Update a form
- `DELETE /api/forms/:formType/:id` - Delete a form
- `GET /api/forms/:formType/:id/export` - Export form to PDF (coming soon)

### Signatures
- `POST /api/signatures/upload` - Upload a signature image

## Database Models

### SafetyMeeting
- jobSite, date, time, conductedBy
- safetyTopics (array)
- attendees (array with signatures)
- additionalNotes, status

### VehicleInspection
- vehicleNumber, date, inspectorName, mileage
- inspectionItems (tires, lights, brakes, etc.)
- defectsNoted, correctiveAction
- signature, status

### DailyLog
- jobSite, date, weather
- crewMembers (array)
- workPerformed, materialsUsed, equipmentUsed
- visitorsOnSite, safetyIncidents, delaysOrIssues
- supervisorName, signature, status

### ScaffoldInspection
- jobSite, date, inspectorName, scaffoldLocation, scaffoldType
- inspectionItems (foundationStable, basePlates, etc.)
- deficienciesNoted, correctiveAction
- signature, status

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── formController.js    # Form CRUD operations
│   └── signatureController.js
├── models/
│   ├── SafetyMeeting.js
│   ├── VehicleInspection.js
│   ├── DailyLog.js
│   └── ScaffoldInspection.js
├── routes/
│   ├── formRoutes.js
│   └── signatureRoutes.js
├── middleware/               # (Future: auth, validation)
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment template
├── server.js                # Main application file
└── package.json
```

## Example API Requests

### Create a Safety Meeting Form
```bash
curl -X POST http://localhost:3001/api/forms/safety-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "jobSite": "Mountain View Plaza",
    "date": "2025-10-29",
    "time": "8:00 AM",
    "conductedBy": "John Martinez",
    "safetyTopics": [
      {
        "topic": "Fall Protection",
        "discussionNotes": "Reviewed proper harness usage"
      }
    ],
    "attendees": [
      {
        "name": "John Martinez",
        "signature": "data:image/png;base64,..."
      }
    ],
    "status": "completed"
  }'
```

### Get All Forms
```bash
curl http://localhost:3001/api/forms/safety-meeting?limit=10&status=completed
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally or your Atlas connection string is correct
- Check firewall settings
- Verify network access in MongoDB Atlas (add your IP)

### Port Already in Use
- Change the PORT in `.env` to a different number
- Or kill the process using port 3001: `lsof -ti:3001 | xargs kill`

## Next Steps

- [ ] Add authentication/authorization
- [ ] Implement PDF export functionality
- [ ] Add input validation middleware
- [ ] Add file upload for photos/attachments
- [ ] Add email notifications
- [ ] Add data backup/export features
