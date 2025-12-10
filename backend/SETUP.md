# Backend Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the `backend/` directory with the following content:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_REFRESH_EXPIRES_IN=30d
   DATABASE_URL=./data/database.json
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
   ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown
   ALLOWED_VIDEO_TYPES=video/mp4,video/webm
   ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg
   CORS_ORIGIN=http://localhost:5173
   WS_PORT=3002
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Base URL

- Development: `http://localhost:3001`
- WebSocket: `ws://localhost:3001/ws`

## Testing the API

You can test the API using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)
- Frontend application

### Example: Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Example: Get Profile (with token)

```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database

The database is stored in `data/database.json`. This file is automatically created on first run.

To reset the database, simply delete `data/database.json` and restart the server.

## File Uploads

Uploaded files are stored in the `uploads/` directory, organized by type:
- `uploads/images/` - Image files
- `uploads/documents/` - Document files
- `uploads/videos/` - Video files
- `uploads/audio/` - Audio files

Files are accessible via: `http://localhost:3001/uploads/{type}/{filename}`

## WebSocket Connection

To connect via WebSocket, use:
```
ws://localhost:3001/ws?token=YOUR_JWT_TOKEN
```

Example JavaScript:
```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_TOKEN');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Subscribe to project updates
ws.send(JSON.stringify({
  type: 'subscribe',
  projectId: 'project-id-here'
}));
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the `PORT` in `.env` file.

### Database Errors
Make sure the `data/` directory exists and is writable.

### File Upload Errors
Make sure the `uploads/` directory exists and is writable.

### CORS Errors
Update `CORS_ORIGIN` in `.env` to match your frontend URL.

