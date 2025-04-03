require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    // Защита от XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Защита от MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Запрет фреймов
    res.setHeader('X-Frame-Options', 'DENY');
    // CSP
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));


const users = [];


const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    next();
};


app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }
        
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        users.push({ username, password: hashedPassword });
        
        res.status(201).json({ message: 'Пользователь зарегистрирован' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        req.session.user = { username };
        
        res.json({ message: 'Вход выполнен успешно' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка выхода' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Выход выполнен успешно' });
    });
});

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

app.get('/data', requireAuth, (req, res) => {
    const cacheFile = path.join(cacheDir, 'data.json');
    
    try {
        if (fs.existsSync(cacheFile)) {
            const stats = fs.statSync(cacheFile);
            const now = new Date();
            const cacheAge = (now - stats.mtime) / 1000; 
            
            if (cacheAge < 60) { 
                const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                return res.json({ ...cachedData, cached: true });
            }
        }
        
        const newData = {
            timestamp: new Date().toISOString(),
            data: {
                message: 'Это кэшированные данные',
                random: Math.random()
            }
        };
        
        fs.writeFileSync(cacheFile, JSON.stringify(newData), 'utf8');
        
        res.json({ ...newData, cached: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения данных' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});