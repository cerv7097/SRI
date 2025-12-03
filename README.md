# Stucco Rite Inc. - Digital Forms Portal

A comprehensive full-stack web application for managing construction site documentation, safety forms, and daily operations for Stucco Rite Inc. This platform digitizes traditional paper-based forms with features like digital signature capture, draft management, and persistent data storage.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Form Types](#form-types)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Stucco Rite Inc. Digital Forms Portal** is designed to streamline construction site operations by replacing paper forms with a modern digital solution. The application serves construction teams, supervisors, and safety inspectors who need to:

- Document daily work activities and crew information
- Conduct and record safety meetings
- Perform vehicle maintenance and safety inspections
- Inspect scaffolding structures for safety compliance
- Maintain searchable records of all submitted forms

**Key Benefits:**
- ✅ Eliminate paper forms and manual filing
- ✅ Capture digital signatures on any device
- ✅ Save draft forms and complete them later
- ✅ Access form history and records instantly
- ✅ Ensure compliance with safety regulations
- ✅ Mobile-responsive design for on-site use

---

## Features

### Core Functionality

#### 📋 Four Form Types
1. **Safety Meeting Form** - Document safety discussions, topics covered, attendees, and recommendations
2. **Vehicle Inspection Form** - Comprehensive 10+ point vehicle safety checklist
3. **Daily Log Form** - Track daily activities, crew members, weather, materials, and equipment
4. **Scaffold Inspection Form** - Detailed scaffold safety inspection with 10+ checkpoint items

#### ✍️ Digital Signatures
- Canvas-based signature capture using `react-signature-canvas`
- Stored as base64-encoded images
- Clear and redraw functionality
- Embedded in form submissions

#### 💾 Draft Management
- Save forms locally (localStorage) before submission
- Resume incomplete forms from the dashboard
- Automatic timestamp tracking for drafts
- Delete drafts when no longer needed

#### 📊 Dashboard
- View pending/draft forms with save timestamps
- Access completed forms with status indicators
- Monitor active job sites with crew counts
- Quick navigation to form history

#### 🎨 User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout (mobile, tablet, desktop)
- Lucide React icons for visual clarity
- Intuitive form navigation and validation
- Real-time form field updates

---

## Tech Stack

### Frontend
- **React 19.1.1** - UI framework with hooks
- **Vite 7.1.7** - Fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React 0.548.0** - Modern icon library
- **react-signature-canvas 1.1.0** - Signature capture component

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web application framework
- **MongoDB 6.20.0** - NoSQL database
- **Mongoose 8.0.0** - MongoDB object modeling (ODM)
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.3.1** - Environment variable management
- **express-validator 7.0.1** - Request validation
- **Multer 1.4.5** - File upload handling (prepared for future use)

### Development Tools
- **Nodemon 3.0.1** - Auto-restart server on file changes
- **ESLint** - Code linting and style enforcement
- **Vite Plugin React** - Fast refresh for React components

---

## Project Structure

```
Stucco_rite_app/
├── backend/
│   ├── config/
│   │   └── database.js                 # MongoDB connection configuration
│   ├── controllers/
│   │   ├── formController.js           # CRUD operations for all form types
│   │   └── signatureController.js      # Signature upload handling
│   ├── models/
│   │   ├── SafetyMeeting.js           # Safety meeting schema
│   │   ├── VehicleInspection.js       # Vehicle inspection schema
│   │   ├── DailyLog.js                # Daily log schema
│   │   └── ScaffoldInspection.js      # Scaffold inspection schema
│   ├── routes/
│   │   ├── formRoutes.js              # Form API endpoints
│   │   └── signatureRoutes.js         # Signature API endpoints
│   ├── middleware/
│   │   └── (future: auth, validation, rate limiting)
│   ├── .env                           # Environment variables (not in git)
│   ├── .env.example                   # Environment template
│   ├── server.js                      # Express app entry point
│   ├── package.json                   # Backend dependencies
│   └── README.md                      # Backend documentation
├── src/
│   ├── components/
│   │   ├── Header.jsx                 # Top navigation bar
│   │   ├── Navigation.jsx             # Tab navigation (Dashboard/Reports/History)
│   │   ├── Dashboard.jsx              # Main dashboard view
│   │   ├── forms/
│   │   │   ├── SafetyMeetingForm.jsx
│   │   │   ├── VehicleInspectionForm.jsx
│   │   │   ├── DailyLogForm.jsx
│   │   │   └── ScaffoldInspectionForm.jsx
│   │   └── shared/
│   │       ├── SignaturePad.jsx       # Reusable signature component
│   │       └── FormButtons.jsx        # Reusable form action buttons
│   ├── utils/
│   │   ├── Api.js                     # API wrapper functions
│   │   └── FormHelpers.js             # Draft management & validation
│   ├── assets/                        # Images and static assets
│   ├── App.jsx                        # Main app component with routing
│   ├── main.jsx                       # React entry point
│   ├── App.css                        # Global styles
│   └── index.css                      # Tailwind imports
├── public/
│   └── stucco-rite-logo.png          # Company logo
├── index.html                         # HTML entry point
├── package.json                       # Frontend dependencies
├── vite.config.js                     # Vite configuration
├── eslint.config.js                   # ESLint rules
├── .gitignore                         # Git ignore rules
└── README.md                          # This file
```

---

## Getting Started

### Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MongoDB** (v6.x or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Option 1: Local MongoDB instance
  - Option 2: MongoDB Atlas (cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Stucco_rite_app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Environment Setup

1. **Create backend environment file**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # MongoDB Configuration (choose one)

   # Option 1: Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/stucco_rite

   # Option 2: MongoDB Atlas (cloud)
   # MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stucco_rite?retryWrites=true&w=majority
   ```

3. **Start MongoDB** (if using local installation)
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB

   # Or run directly
   mongod
   ```

### Running the Application

#### Development Mode (Recommended)

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: `http://localhost:3001`

2. **Start the frontend dev server** (Terminal 2)
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173`

#### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

3. **Serve the frontend build**
   ```bash
   npm run preview
   ```

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Stucco Rite API is running",
  "timestamp": "2025-11-06T12:00:00.000Z"
}
```

---

#### Form Routes

All form routes use dynamic `:formType` parameter. Supported types:
- `safety-meeting`
- `vehicle-inspection`
- `daily-log`
- `scaffold-inspection`

##### Create a Form
```http
POST /api/forms/:formType
Content-Type: application/json

{
  "jobSite": "Mountain View Plaza",
  "date": "2025-11-06",
  "inspectorName": "John Doe",
  ...
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Form created successfully",
  "data": { /* created form object */ }
}
```

##### Get All Forms (with optional filters)
```http
GET /api/forms/:formType
GET /api/forms/:formType?limit=10
GET /api/forms/:formType?status=completed
GET /api/forms/:formType?limit=5&status=draft
```
**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "data": [ /* array of form objects */ ]
}
```

##### Get Form by ID
```http
GET /api/forms/:formType/:id
```
**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* form object */ }
}
```

##### Update Form
```http
PUT /api/forms/:formType/:id
Content-Type: application/json

{
  "status": "completed",
  "additionalNotes": "Updated notes"
}
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Form updated successfully",
  "data": { /* updated form object */ }
}
```

##### Delete Form
```http
DELETE /api/forms/:formType/:id
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

##### Export Form to PDF
```http
GET /api/forms/:formType/:id/export
```
**Response:** `200 OK` (Currently returns placeholder - PDF generation coming soon)
```json
{
  "success": true,
  "message": "PDF export functionality coming soon",
  "formId": "507f1f77bcf86cd799439011"
}
```

---

#### Signature Routes

##### Upload Signature
```http
POST /api/signatures/upload
Content-Type: application/json

{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Signature uploaded successfully",
  "signatureData": "data:image/png;base64,..."
}
```

---

### Error Responses

All endpoints return errors in the following format:

**400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid form type: invalid-type",
  "validTypes": ["safety-meeting", "vehicle-inspection", "daily-log", "scaffold-inspection"]
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Form not found with id: 507f1f77bcf86cd799439011"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error message details (only in development mode)"
}
```

---

## Form Types

### 1. Safety Meeting Form

**Purpose:** Document safety meetings conducted on job sites

**Key Fields:**
- Job Site (required)
- Date & Time (required)
- Conducted By (required)
- Safety Topics (array)
  - Topic name
  - Discussion notes
- Attendees (array)
  - Name
  - Signature
- Additional Notes
- Status: `draft` or `completed`

**Use Case:** Weekly or daily safety briefings before work begins

---

### 2. Vehicle Inspection Form

**Purpose:** Comprehensive vehicle safety inspection checklist

**Key Fields:**
- Vehicle Number (required)
- Date (required)
- Inspector Name (required)
- Mileage
- Inspection Items (Pass/Fail/N/A):
  - Tires
  - Lights (headlights, brake lights, turn signals)
  - Brakes
  - Fluid Levels (oil, coolant, washer)
  - Mirrors
  - Horn
  - Wipers
  - Seat Belts
  - Fire Extinguisher
  - First Aid Kit
- Defects Noted
- Corrective Action
- Inspector Signature
- Status: `draft` or `completed`

**Use Case:** Pre-trip vehicle safety checks required by DOT/OSHA regulations

---

### 3. Daily Log Form

**Purpose:** Document daily job site activities, crew, and conditions

**Key Fields:**
- Job Site (required)
- Date (required)
- Weather
  - Condition (sunny, cloudy, rainy, etc.)
  - Temperature
- Crew Members (array)
  - Name
  - Role
  - Hours Worked
- Work Performed (required)
- Materials Used (array)
  - Material name
  - Quantity
  - Unit
- Equipment Used (array)
  - Equipment name
  - Hours used
- Visitors On Site (array)
  - Name
  - Company
  - Purpose
- Safety Incidents
- Delays or Issues
- Additional Notes
- Supervisor Name (required)
- Supervisor Signature
- Status: `draft` or `completed`

**Use Case:** Daily documentation for project management and payroll

---

### 4. Scaffold Inspection Form

**Purpose:** Safety inspection of scaffold structures

**Key Fields:**
- Job Site (required)
- Date (required)
- Inspector Name (required)
- Scaffold Location (required)
- Scaffold Type (Frame, Tube and Coupler, System, Suspended, Other)
- Inspection Items (Pass/Fail/N/A):
  - Foundation Stable
  - Base Plates Level
  - Frame Secured
  - Planks Secure
  - Guardrails Installed
  - Toeboards Installed
  - Access Safe
  - Tie-ins Secure
  - No Visible Damage
  - Load Capacity Posted
- Deficiencies Noted
- Corrective Action
- Inspector Signature
- Status: `draft` or `completed`

**Use Case:** Required OSHA inspections before scaffold use and at regular intervals

---

## Database Schema

### Collections

#### SafetyMeeting
```javascript
{
  _id: ObjectId,
  jobSite: String (required),
  date: Date (required),
  time: String (required),
  conductedBy: String (required),
  safetyTopics: [{
    topic: String,
    discussionNotes: String
  }],
  attendees: [{
    name: String,
    signature: String  // base64 image data URL
  }],
  additionalNotes: String,
  status: String (enum: ['draft', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

#### VehicleInspection
```javascript
{
  _id: ObjectId,
  vehicleNumber: String (required),
  date: Date (required),
  inspectorName: String (required),
  mileage: Number,
  inspectionItems: {
    tires: String,              // 'Pass' | 'Fail' | 'N/A'
    lights: String,
    brakes: String,
    fluidLevels: String,
    mirrors: String,
    horn: String,
    wipers: String,
    seatBelts: String,
    fireExtinguisher: String,
    firstAidKit: String
  },
  defectsNoted: String,
  correctiveAction: String,
  signature: String,            // base64 image data URL
  status: String (enum: ['draft', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

#### DailyLog
```javascript
{
  _id: ObjectId,
  jobSite: String (required),
  date: Date (required),
  weather: {
    condition: String,
    temperature: String
  },
  crewMembers: [{
    name: String,
    role: String,
    hoursWorked: Number
  }],
  workPerformed: String (required),
  materialsUsed: [{
    material: String,
    quantity: String,
    unit: String
  }],
  equipmentUsed: [{
    equipment: String,
    hoursUsed: Number
  }],
  visitorsOnSite: [{
    name: String,
    company: String,
    purpose: String
  }],
  safetyIncidents: String,
  delaysOrIssues: String,
  additionalNotes: String,
  supervisorName: String (required),
  signature: String,            // base64 image data URL
  status: String (enum: ['draft', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

#### ScaffoldInspection
```javascript
{
  _id: ObjectId,
  jobSite: String (required),
  date: Date (required),
  inspectorName: String (required),
  scaffoldLocation: String (required),
  scaffoldType: String (enum: ['Frame', 'Tube and Coupler', 'System', 'Suspended', 'Other']),
  inspectionItems: {
    foundationStable: String,    // 'Pass' | 'Fail' | 'N/A'
    basePlatesLevel: String,
    frameSecured: String,
    planksSecure: String,
    guardrailsInstalled: String,
    toeboardsInstalled: String,
    accessSafe: String,
    tieInsSecure: String,
    noVisibleDamage: String,
    loadCapacityPosted: String
  },
  deficienciesNoted: String,
  correctiveAction: String,
  signature: String,              // base64 image data URL
  status: String (enum: ['draft', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Development

### Frontend Development

**Key Files:**
- `src/App.jsx` - Main application component with view routing
- `src/components/` - All React components
- `src/utils/Api.js` - API wrapper functions
- `src/utils/FormHelpers.js` - Local storage and validation utilities

**Running Frontend Dev Server:**
```bash
npm run dev
```
Vite dev server with hot module replacement runs on `http://localhost:5173`

**Linting:**
```bash
npm run lint
```

**Building for Production:**
```bash
npm run build
```
Creates optimized production build in `dist/` folder

**Preview Production Build:**
```bash
npm run preview
```

---

### Backend Development

**Key Files:**
- `backend/server.js` - Express app entry point
- `backend/config/database.js` - MongoDB connection
- `backend/controllers/` - Business logic
- `backend/models/` - Mongoose schemas
- `backend/routes/` - API endpoints

**Running Backend Dev Server:**
```bash
cd backend
npm run dev
```
Nodemon auto-restarts server on file changes, runs on `http://localhost:3001`

**Running Tests:**
```bash
cd backend
npm test
```
(Tests not yet implemented)

---

### Useful Commands

```bash
# Check MongoDB connection
mongosh stucco_rite

# View all collections
show collections

# Query forms
db.safetymeetings.find().pretty()
db.vehicleinspections.find().pretty()
db.dailylogs.find().pretty()
db.scaffoldinspections.find().pretty()

# Drop all data (use with caution!)
db.dropDatabase()
```

---

## Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to hosting service
   - Netlify: Drag & drop or connect Git repo
   - Vercel: Connect Git repo and auto-deploy

3. **Update API URL** in production
   - Set environment variable: `VITE_API_URL=https://your-backend.com/api`

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Set environment variables**
   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   ```

2. **Deploy backend**
   ```bash
   git push heroku main
   ```

3. **Ensure CORS allows frontend domain**
   Update `backend/server.js` CORS configuration

---

## Future Enhancements

### High Priority
- [ ] **Authentication & Authorization System**
  - User login/logout
  - Role-based access control (admin, supervisor, worker)
  - JWT token authentication

- [ ] **PDF Export Functionality**
  - Generate printable PDFs from submitted forms
  - Include signatures and all form data
  - Email PDF to specified recipients

- [ ] **Input Validation Middleware**
  - Server-side validation for all form submissions
  - Prevent invalid data from entering database
  - Return helpful error messages

- [ ] **Form Search & Filtering**
  - Search forms by date range, job site, or inspector
  - Filter dashboard by status, form type
  - Advanced query capabilities

### Medium Priority
- [ ] **Photo/Attachment Upload**
  - Attach photos to forms (site conditions, defects, etc.)
  - Image compression and storage
  - Gallery view for uploaded images

- [ ] **Email Notifications**
  - Send email when forms are submitted
  - Notify supervisors of critical safety issues
  - Daily/weekly form submission summaries

- [ ] **Reports & Analytics**
  - Generate reports by date range or job site
  - Visualize trends (safety incidents, vehicle issues)
  - Export reports to CSV or Excel

- [ ] **Mobile App**
  - Native iOS/Android apps for field workers
  - Offline mode with sync when connected
  - Push notifications

### Low Priority
- [ ] **Data Backup & Export**
  - Automated database backups
  - Export all forms to CSV/JSON
  - Data retention policies

- [ ] **Form Templates**
  - Save frequently used form configurations
  - Pre-fill common fields
  - Company-wide form standards

- [ ] **Multi-language Support**
  - Spanish translation for forms
  - Language switcher in UI
  - Localized date/time formats

- [ ] **Rate Limiting & Security**
  - API rate limiting to prevent abuse
  - Input sanitization against XSS/SQL injection
  - HTTPS enforcement

---

## Contributing

We welcome contributions to improve the Stucco Rite Digital Forms Portal!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add comments where necessary
4. **Test your changes**
   - Ensure all forms work correctly
   - Test API endpoints
   - Check responsive design
5. **Commit your changes**
   ```bash
   git commit -m "Add: description of your feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Request review from maintainers

### Code Style Guidelines
- Use meaningful variable and function names
- Write comments for complex logic
- Follow React best practices (hooks, component structure)
- Keep components small and focused
- Use async/await for asynchronous operations
- Handle errors gracefully

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Kill process using the port
```bash
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows
```

**CORS Error in Browser Console**
```
Access to fetch at 'http://localhost:3001/api' has been blocked by CORS policy
```
**Solution:** Verify CORS is properly configured in `backend/server.js`

**Forms Not Saving to Database**
- Check MongoDB connection string in `.env`
- Verify backend server is running
- Check browser console and backend logs for errors

---

## License

ISC License

Copyright (c) 2025 Stucco Rite Inc.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## Contact & Support

For questions, issues, or feature requests:

- **Create an Issue**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@stuccorite.com
- **Documentation**: [Project Wiki](https://github.com/your-repo/wiki)

---

## Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

---

**Version:** 1.0.0
**Last Updated:** November 6, 2025
**Status:** Active Development
