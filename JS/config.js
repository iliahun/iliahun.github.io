// Конфигурация таблицы
const config = {
    padding: 15,
    fontSize: 12,
    titleFontSize: 14,
    fontFamily: "Inter, Arial, sans-serif",
    headerFontWeight: "600",
    dataFontWeight: "400",
    titleFontWeight: "bold",
    rowHeight: 35,
    titleRowHeight: 40,
    startY: 45,
    borderWidth: 1,
    outerBorderWidth: 2,
    borderColor: "#000000",
    textColor: "#000000",
    emptyCellText: "-",
    titleBgColor: "#f0f0f0",
    verticalOffset: 0.35,
    pngWidth: 1500,
    hdPngWidth: 1200,
    hdPngDPI: 300,
    pdfMargin: 20,
    pdfScale: 3 // Коэффициент масштабирования для PDF
};

// Глобальная переменная для хранения текущего названия таблицы
let currentTableTitle = "";

// Элементы интерфейса
const elements = {
    inputData: document.getElementById('input-data'),
    svgContainer: document.getElementById('svg-container'),
    generateBtn: document.getElementById('generate-btn'),
    downloadSvgBtn: document.getElementById('download-svg-btn'),
    downloadPngBtn: document.getElementById('download-png-btn'),
    downloadPngHdBtn: document.getElementById('download-png-hd-btn'),
    downloadPdfBtn: document.getElementById('download-pdf-btn'),
    clearBtn: document.getElementById('clear-btn'),
    logMessages: document.getElementById('log-messages')
};