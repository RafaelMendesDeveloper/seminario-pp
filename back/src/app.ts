import express from 'express';
import cors from 'cors';
import worldcupRoutes from './routes/worldcupRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/worldcup', worldcupRoutes);

export default app;