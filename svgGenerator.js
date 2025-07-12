// Генерация SVG из данных
function generateSVG() {
    try {
        const inputText = elements.inputData.value.trim();
        if (!inputText) {
            addLogMessage('Ошибка: введите данные для генерации таблицы', 'error');
            return;
        }
        
        const parsedData = parseInputData(inputText);
        if (!parsedData) return;
        
        const svg = createSVGFromData(parsedData.title, parsedData.headers, parsedData.dataRows);
        elements.svgContainer.innerHTML = '';
        elements.svgContainer.appendChild(svg);
        addLogMessage('Таблица успешно сгенерирована', 'success');
    } catch (error) {
        addLogMessage(`Ошибка при генерации таблицы: ${error.message}`, 'error');
        console.error('Ошибка при генерации таблицы:', error);
    }
}

// Создание SVG из данных
function createSVGFromData(title, headers, dataRows) {
    const ns = "http://www.w3.org/2000/svg";
    
    const columnWidths = calculateColumnWidths(headers, dataRows);
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const tableHeight = config.startY + config.titleRowHeight + (dataRows.length + 1) * config.rowHeight;
    
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.setAttribute("width", tableWidth);
    svg.setAttribute("height", tableHeight);
    svg.setAttribute("viewBox", `0 0 ${tableWidth} ${tableHeight}`);
    
    const style = document.createElementNS(ns, "style");
    style.textContent = `
        text {
            font-family: ${config.fontFamily};
            font-size: ${config.fontSize}px;
            dominant-baseline: middle;
            text-anchor: middle;
        }
        .empty-cell {
            fill: #999;
        }
        .title-text {
            font-weight: ${config.titleFontWeight};
            font-size: ${config.titleFontSize}px;
        }
    `;
    svg.appendChild(style);
    
    let x = 0;
    const yBase = config.startY;
    
    // Заголовок таблицы
    const titleRect = document.createElementNS(ns, "rect");
    titleRect.setAttribute("x", 0);
    titleRect.setAttribute("y", yBase);
    titleRect.setAttribute("width", tableWidth);
    titleRect.setAttribute("height", config.titleRowHeight);
    titleRect.setAttribute("fill", config.titleBgColor);
    titleRect.setAttribute("stroke", config.borderColor);
    titleRect.setAttribute("stroke-width", config.borderWidth);
    svg.appendChild(titleRect);
    
    const titleText = document.createElementNS(ns, "text");
    titleText.setAttribute("x", tableWidth / 2);
    titleText.setAttribute("y", yBase + config.titleRowHeight / 2 + config.verticalOffset);
    titleText.setAttribute("class", "title-text");
    titleText.textContent = title;
    svg.appendChild(titleText);
    
    // Заголовки столбцов
    x = 0;
    const yHeaders = yBase + config.titleRowHeight;
    headers.forEach((header, i) => {
        createCell(svg, x, yHeaders, columnWidths[i], config.rowHeight, header, "header");
        x += columnWidths[i];
    });
    
    // Данные
    dataRows.forEach((row, rowIndex) => {
        x = 0;
        const y = yHeaders + (rowIndex + 1) * config.rowHeight;
        
        row.forEach((cell, colIndex) => {
            if (colIndex < columnWidths.length) {
                const isEmpty = cell === config.emptyCellText;
                createCell(svg, x, y, columnWidths[colIndex], config.rowHeight, cell, 
                         isEmpty ? "empty" : "data");
                x += columnWidths[colIndex];
            }
        });
    });
    
    // Внешняя рамка
    const border = document.createElementNS(ns, "rect");
    border.setAttribute("x", 0);
    border.setAttribute("y", yBase);
    border.setAttribute("width", tableWidth);
    border.setAttribute("height", config.titleRowHeight + (dataRows.length + 1) * config.rowHeight);
    border.setAttribute("stroke", config.borderColor);
    border.setAttribute("stroke-width", config.outerBorderWidth);
    border.setAttribute("fill", "none");
    svg.appendChild(border);
    
    return svg;
}