function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

function updateThemeButton(theme) {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.textContent = theme === 'light' ? 'Тёмная тема' : 'Светлая тема';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

document.addEventListener('DOMContentLoaded', () => {

    const themeBtn = document.getElementById('themeBtn');
    initTheme();

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme, themeBtn);
    

    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    const messagesDiv = document.getElementById('messages');
    

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });
    

    themeBtn.addEventListener('click', toggleTheme);
    

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Вход выполнен успешно');
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 1000);
            } else {
                showMessage('error', data.error || 'Ошибка входа');
            }
        } catch (error) {
            showMessage('error', 'Ошибка соединения с сервером');
        }
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', 'Регистрация прошла успешно');
                // Переключаем на форму входа
                document.getElementById('registerForm').classList.add('hidden');
                document.getElementById('loginForm').classList.remove('hidden');
                // Заполняем логин
                document.getElementById('loginUsername').value = username;
            } else {
                showMessage('error', data.error || 'Ошибка регистрации');
            }
        } catch (error) {
            showMessage('error', 'Ошибка соединения с сервером');
        }
    });
    

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme, themeBtn);
    }
    
    function updateThemeButton(theme, themeBtn) {
        themeBtn.textContent = theme === 'light' ? 'Тёмная тема' : 'Светлая тема';
    }
    
    function showMessage(type, text) {
        messagesDiv.innerHTML = '';
        const message = document.createElement('div');
        message.className = type;
        message.textContent = text;
        messagesDiv.appendChild(message);
    }
    
    async function checkAuth() {
        try {
            const response = await fetch('/profile');
            if (response.ok) {
                window.location.href = '/profile';
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
        }
    }
});