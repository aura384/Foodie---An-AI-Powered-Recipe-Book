import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from '../routes/chat.js';
import mealRoutes from '../routes/meals.js';
import authRoutes from '../routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());
app.use('/api/chat', chatRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.json({ status: 'Server running' }));

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;