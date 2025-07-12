// Настройка обработчиков событий
function setupEventListeners() {
    elements.generateBtn.addEventListener('click', generateSVG);
    elements.downloadSvgBtn.addEventListener('click', downloadSVG);
    elements.downloadPngBtn.addEventListener('click', downloadPNG);
    elements.downloadPngHdBtn.addEventListener('click', downloadPNGHD);
    elements.downloadPdfBtn.addEventListener('click', downloadPDF);
    elements.clearBtn.addEventListener('click', clearData);
}

// Очистка данных
function clearData() {
    elements.inputData.value = '';
    elements.svgContainer.innerHTML = '<p style="color: #718096;">Здесь будет отображена ваша таблица...</p>';
    currentTableTitle = "";
    addLogMessage('Данные очищены', 'success');
}