# Petrol Pump Staff Attendance & Shift Management

Full-stack attendance and shift management software for petrol pump staff with biometric fingerprint integration boundaries.

## Stack

- Frontend: React, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- Biometric: ZKTeco-ready adapter plus simulator endpoint for testing

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Copy server environment:

```bash
copy server\.env.example server\.env
```

3. Start MongoDB locally or set `MONGO_URI` in `server/.env`.

4. Seed demo data:

```bash
npm run seed
```

5. Run both apps:

```bash
npm run dev
```

Default login:

- Username: `ghoshbrothers`
- Password: `Nxghosh@$45`

## Biometric Test

POST a fingerprint event:

```bash
curl -X POST http://localhost:5000/api/biometric/fingerprint ^
  -H "Content-Type: application/json" ^
  -d "{\"fingerprintId\":\"FP1001\"}"
```

The system maps first, second, third, and fourth fingerprint scans of a duty day to Join Duty, Lunch Out, Lunch In, and Exit Duty.

## Firebase Deploy

Firebase Hosting serves the React build from `client/dist`, and `/api/**` is rewritten to the Express backend exported as a Firebase Function.

1. Install Firebase CLI and login:

```bash
npm install -g firebase-tools
firebase login
```

2. Copy `.firebaserc.example` to `.firebaserc` and replace `your-firebase-project-id`.

3. Set production frontend API base:

```bash
copy client\.env.production.example client\.env.production
```

4. Use a cloud MongoDB connection string, such as MongoDB Atlas, in `server/.env`:

```bash
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/petrol_pump_attendance
JWT_SECRET=use-a-long-production-secret
CLIENT_URL=https://your-firebase-project-id.web.app
```

5. Build and deploy:

```bash
npm run firebase:deploy
```

To deploy only the frontend:

```bash
npm run firebase:deploy:hosting
```

To deploy only backend functions:

```bash
npm run firebase:deploy:functions
```

## GitHub Pages Deploy

This is the simplest free preview hosting for the frontend demo mode.

1. Create a new GitHub repository.
2. Push this project to the repository.
3. In GitHub, open repository Settings > Pages.
4. Set Source to GitHub Actions.
5. Push to the `main` branch.

GitHub Actions will build `client/dist` and publish the site.
