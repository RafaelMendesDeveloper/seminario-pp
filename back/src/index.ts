import dotenv from 'dotenv';
import app from './app'

dotenv.config();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
