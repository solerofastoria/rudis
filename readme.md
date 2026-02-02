# Discord Clone - Full Stack Application

A full-featured Discord clone built with modern web technologies including real-time messaging, voice chat, AI integration, and more.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant messaging with Socket.IO
- **Voice Chat**: WebRTC-based voice communication
- **User Authentication**: Secure JWT-based authentication with cookies
- **Friends System**: Add, remove, and manage friends
- **Servers & Channels**: Discord-like server and channel structure
- **User Presence**: Online/offline status with last seen tracking

### AI Integration
- **AI Chat Assistant**: Powered by Groq and Google Gemini
- **AI Project Manager**: Advanced AI agent for project management
- **Real-time AI Tasks**: WebSocket-based AI task processing

### Technical Features
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Docker Deployment**: Containerized with Docker Compose
- **PostgreSQL Database**: Robust data storage with Sequelize ORM
- **Redis Caching**: High-performance caching and session management
- **TypeScript Frontend**: Strongly-typed React application
- **RESTful API**: Well-documented backend API

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Sequelize ORM
- **Redis** for caching and sessions
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Docker** for containerization

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time features
- **Axios** for HTTP requests
- **React Router** for navigation

### AI Integration
- **Groq SDK** for fast LLM inference
- **Google Generative AI** for Gemini models
- **WebSocket** for real-time AI tasks

## 📁 Project Structure

```
discord-clone/
├── backend/                 # Node.js backend
│   ├── src/                 # Source code
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Authentication, etc.
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/        # Business logic
│   │   ├── socket/          # WebSocket handlers
│   │   ├── utils/           # Helper functions
│   │   └── config/         # Configuration files
│   ├── migrations/           # Database migrations
│   ├── init-scripts/        # Database initialization
│   └── uploads/            # User uploaded files
├── Frontend/                # React frontend
│   ├── src/                 # Source code
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context providers
│   │   ├── features/          # Feature modules
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── api/              # API clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   └── nginx/                # Nginx configuration
├── nginx/                   # Reverse proxy configuration
└── uploads/                 # Shared uploads directory
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

### Environment Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd discord-clone
```

2. **Set up backend environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up frontend environment:**
```bash
cd ../Frontend
# No specific environment file needed for development
```

### Development Setup

1. **Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../Frontend
npm install
```

2. **Start development servers:**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from Frontend directory)
npm run dev
```

### Docker Deployment

1. **Build and start all services:**
```bash
# From project root
docker-compose up --build
```

2. **Start services in detached mode:**
```bash
docker-compose up -d
```

3. **Stop services:**
```bash
docker-compose down
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Cookie-based Sessions**: HttpOnly, Secure cookies
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Server-side validation
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting (coming soon)

## 🌐 API Documentation

The API is organized into the following modules:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/friends` - Friends system
- `/api/messages` - Messaging system
- `/api/servers` - Server management
- `/api/ai` - Simple AI chat
- `/api/ai-agent` - Advanced AI project manager
- `/chat` - AI chat UI

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Database Testing
```bash
cd backend
npm run test:db
```

## 📦 Deployment

### Production Docker Setup

1. **Configure environment variables** in `backend/.env`
2. **Build and start services:**
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Manual Deployment

1. **Set up PostgreSQL and Redis** servers
2. **Configure environment variables** in `backend/.env`
3. **Build backend:**
```bash
cd backend
npm install --production
```
4. **Build frontend:**
```bash
cd ../Frontend
npm install --production
npm run build
```
5. **Deploy built files** to your web server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on the GitHub repository or contact the maintainers.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Special thanks to the open-source community for the amazing tools and libraries
