const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://frontend",      // контейнер фронтенда
  "http://frontend:80"
];

module.exports = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
