copy repo:

git clone https://github.com/your-repo/web-app.git
cd web-app


add package.json:
{
  "name": "web-app",
  "version": "1.0.0",
  "description": "Веб-приложение с авторизацией и кэшированием",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}


npm install


make new .env file:
SESSION_SECRET=your_random_secret_key_here
PORT=3000



start server:
npm start
npm start
