const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || '6da3793bbc29b85a820500fb3f019eab';

app.use(cors());
app.use(express.json());

const users = [
  {
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    role: 'admin'
  }

];

app.post('/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Укажите логин и пароль' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, role });
  console.log(`Новый пользователь: ${username} (${role})`);

  res.json({ message: 'Пользователь создан' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Неверный логин или пароль.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Неверный логин или пароль.' });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  res.json({ token, role: user.role });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
