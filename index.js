const express = require("express");
const bodyParser = require("body-parser");
const { adminSwaggerDocs, userSwaggerDocs, swaggerUi } = require("./swagger");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const rateLimit = require('express-rate-limit');
const ngrok = require('@ngrok/ngrok');

const logger = require('./logger');

// Example of logging requests

const app = express();
const PORT = 5000;
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
  headers: true,            // Include rate limit headers in the response
});


app.use(bodyParser.json());
app.use(express.json());


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use(apiLimiter);


// Swagger UI for Admin Routes
app.use(
  "/api/docs/admin",
  swaggerUi.serve,
  (req, res) => swaggerUi.setup(adminSwaggerDocs)(req, res)
);

// Swagger UI for User Routes
app.use(
  "/api/docs/user",
  swaggerUi.serve,
  (req, res) => swaggerUi.setup(userSwaggerDocs)(req, res)
);
// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT,async () => {
  try {
    
    ngrok.connect({ addr:PORT, authtoken_from_env: true })
      .then(listener => console.log(`Ingress established at: ${listener.url()}`));
  } catch (error) {
    console.error('Error starting ngrok:', error);
  }


  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`User Docs: http://localhost:${PORT}/api/docs/user`);
  console.log(`Admin Docs: http://localhost:${PORT}/api/docs/admin`);
});
