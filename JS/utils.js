// Добавление сообщения в лог
function addLogMessage(message, type = 'success') {
    try {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-message ${type}`;
        logEntry.textContent = `[${timeString}] ${message}`;
        elements.logMessages.appendChild(logEntry);
        
        // Автопрокрутка к новому сообщению
        elements.logMessages.scrollTop = elements.logMessages.scrollHeight;
        
        // Сохраняем в localStorage (последние 50 сообщений)
        const logs = JSON.parse(localStorage.getItem('table-generator-logs') || '[]');
        logs.push(`[${timeString}] ${message}`);
        localStorage.setItem('table-generator-logs', JSON.stringify(logs.slice(-50)));
    } catch (error) {
        console.error('Ошибка при добавлении сообщения в лог:', error);
    }
}

// Загрузка лога из localStorage
function loadLogFromStorage() {
    try {
        const logs = JSON.parse(localStorage.getItem('table-generator-logs') || '[]');
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-message';
            logEntry.textContent = log;
            elements.logMessages.appendChild(logEntry);
        });
    } catch (error) {
        console.error('Ошибка при загрузке лога:', error);
        localStorage.removeItem('table-generator-logs');
    }
}

// Парсинг входных данных
function parseInputData(inputText) {
    try {
        const lines = inputText.trim().split('\n');
        if (lines.length < 3) {
            addLogMessage('Ошибка: недостаточно данных для создания таблицы. Нужно минимум 3 строки (название, заголовки и хотя бы одна строка данных)', 'error');
            return null;
        }
        
        currentTableTitle = lines[0].trim();
        if (!lines[1].startsWith('-')) {
            addLogMessage('Ошибка: вторая строка должна быть заголовком и начинаться с "-"', 'error');
            return null;
        }
        
        const headers = lines[1].substring(1).split('/');
        
        let maxColumns = headers.length;
        const dataRows = [];
        
        for (let i = 2; i < lines.length; i++) {
            if (lines[i].startsWith('-')) {
                const rowData = lines[i].substring(1).split('/');
                for (let j = 0; j < rowData.length; j++) {
                    rowData[j] = rowData[j].trim() === "" ? config.emptyCellText : rowData[j].trim();
                }
                dataRows.push(rowData);
                if (rowData.length > maxColumns) {
                    maxColumns = rowData.length;
                }
            }
        }
        
        // Дополняем заголовки, если нужно
        while (headers.length < maxColumns) {
            headers.push(`Колонка ${headers.length + 1}`);
        }
        
        // Дополняем строки данных, если нужно
        for (let i = 0; i < dataRows.length; i++) {
            while (dataRows[i].length < maxColumns) {
                dataRows[i].push(config.emptyCellText);
            }
        }
        
        return { title: currentTableTitle, headers, dataRows };
    } catch (error) {
        addLogMessage(`Ошибка при разборе данных: ${error.message}`, 'error');
        console.error('Ошибка при разборе данных:', error);
        return null;
    }
}

// Расчет ширины столбцов
function calculateColumnWidths(headers, dataRows) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    ctx.font = `${config.headerFontWeight} ${config.fontSize}px ${config.fontFamily}`;
    const headerWidths = headers.map(header => 
        ctx.measureText(header).width + config.padding * 2
    );
    
    ctx.font = `${config.dataFontWeight} ${config.fontSize}px ${config.fontFamily}`;
    const dataWidths = headers.map(() => 0);
    
    dataRows.forEach(row => {
        row.forEach((cell, i) => {
            if (i < dataWidths.length) {
                const width = ctx.measureText(cell).width + config.padding * 2;
                if (width > dataWidths[i]) {
                    dataWidths[i] = width;
                }
            }
        });
    });
    
    return headerWidths.map((width, i) => Math.max(width, dataWidths[i]));
}

// Создание ячейки SVG
function createCell(svg, x, y, width, height, text, cellType) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Границы
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("stroke", config.borderColor);
    rect.setAttribute("stroke-width", config.borderWidth);
    rect.setAttribute("fill", "none");
    svg.appendChild(rect);
    
    // Текст
    const textElem = document.createElementNS(ns, "text");
    textElem.setAttribute("x", x + width / 2);
    textElem.setAttribute("y", y + height / 2 + config.verticalOffset);
    textElem.setAttribute("font-size", config.fontSize);
    textElem.setAttribute("font-family", config.fontFamily);
    
    if (cellType === "header") {
        textElem.setAttribute("font-weight", config.headerFontWeight);
    } else if (cellType === "empty") {
        textElem.setAttribute("class", "empty-cell");
    } else {
        textElem.setAttribute("font-weight", config.dataFontWeight);
    }
    
    textElem.textContent = text;
    svg.appendChild(textElem);
}