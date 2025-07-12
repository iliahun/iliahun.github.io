// Инициализация приложения
function init() {
    setupEventListeners();
    generateSVG(); // Генерация при загрузке
    addLogMessage('Система инициализирована', 'success');
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    try {
        init();
        loadLogFromStorage();
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
});