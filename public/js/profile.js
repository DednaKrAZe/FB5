// Выносим функции работы с темой в начало файла
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

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    

    const themeBtn = document.getElementById('themeBtn');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const refreshBtn = document.getElementById('refreshData');
    const dataContainer = document.getElementById('dataContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    

    themeBtn.addEventListener('click', toggleTheme);
    

    refreshBtn.addEventListener('click', fetchData);
    

    logoutBtn.addEventListener('click', logout);
    

    fetchData();
    

    
    async function checkAuth() {
        try {
            const response = await fetch('/profile');
            if (!response.ok) {
                window.location.href = '/';
            } else {

                const userResponse = await fetch('/profile');
                const userData = await userResponse.json();
                if (userData.username) {
                    welcomeMessage.textContent = `Добро пожаловать, ${userData.username}!`;
                }
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            window.location.href = '/';
        }
    }
    
    async function fetchData() {
        try {
            const response = await fetch('/data');
            if (response.ok) {
                const data = await response.json();
                displayData(data);
            } else {
                dataContainer.innerHTML = '<p>Ошибка загрузки данных</p>';
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            dataContainer.innerHTML = '<p>Ошибка соединения с сервером</p>';
        }
    }
    
    function displayData(data) {
        let html = `
            <p><strong>Время генерации:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            <p><strong>Сообщение:</strong> ${data.data.message}</p>
            <p><strong>Случайное число:</strong> ${data.data.random}</p>
        `;
        
        if (data.cached) {
            html += '<p class="cached-indicator">(данные из кэша)</p>';
        }
        
        dataContainer.innerHTML = html;
    }
    
    async function logout() {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Ошибка выхода');
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
            alert('Ошибка соединения с сервером');
        }
    }
});