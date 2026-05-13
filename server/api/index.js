import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from '../routes/chat.js';
import mealRoutes from '../routes/meals.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://foodie-an-ai-powered-recipe-book.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/meals', mealRoutes);

app.get('/', (req, res) => res.json({ status: 'Server running' }));

// ← This export is what Vercel needs
export default app;