// back/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import worldcupRoutes from './routes/worldcup';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/worldcup', worldcupRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
