import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files from the public/uploads directory
app.use('/uploads', express.static('public/uploads'));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true in production
}));

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the user and admin routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('starting'); // Use render instead of sendFile
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
