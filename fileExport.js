// Скачивание SVG
function downloadSVG() {
    if (!elements.svgContainer.firstChild || elements.svgContainer.firstChild.nodeName !== "svg") {
        addLogMessage('Сначала сгенерируйте таблицу', 'error');
        return;
    }
    
    try {
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(elements.svgContainer.firstChild);
        
        svgStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgStr}`;
        
        const fileName = getFileName();
        const blob = new Blob([svgStr], {type: "image/svg+xml;charset=utf-8"});
        downloadFile(blob, fileName + '.svg', `SVG файл "${fileName}.svg" успешно скачан`);
    } catch (error) {
        handleExportError('SVG', error);
    }
}

// Скачивание PNG
function downloadPNG() {
    exportToImage(config.pngWidth, false, 'PNG', '.png');
}

// Скачивание HD PNG
function downloadPNGHD() {
    exportToImage(config.hdPngWidth, true, 'HD PNG', '_HD.png');
}

// Общая функция для экспорта в изображение
function exportToImage(targetWidth, isHD, type, extension) {
    if (!validateSvg()) return;

    try {
        const fileName = getFileName();
        const svgElement = elements.svgContainer.firstChild;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const svgWidth = parseFloat(svgElement.getAttribute('width'));
        const svgHeight = parseFloat(svgElement.getAttribute('height'));
        
        let scale, pngHeight;
        if (isHD) {
            scale = targetWidth / svgWidth;
            pngHeight = Math.round(svgHeight * scale);
            const dpiRatio = config.hdPngDPI / 96;
            canvas.width = targetWidth * dpiRatio;
            canvas.height = pngHeight * dpiRatio;
            canvas.style.width = targetWidth + 'px';
            canvas.style.height = pngHeight + 'px';
            ctx.scale(dpiRatio, dpiRatio);
            ctx.imageSmoothingQuality = 'high';
        } else {
            scale = targetWidth / svgWidth;
            pngHeight = svgHeight * scale;
            canvas.width = targetWidth;
            canvas.height = pngHeight;
        }
        
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, targetWidth, pngHeight);
            
            canvas.toBlob(function(blob) {
                downloadFile(blob, fileName + extension, `${type} файл "${fileName}${extension}" успешно скачан`);
            }, 'image/png', isHD ? 1 : undefined);
        };
        
        img.onerror = function() {
            addLogMessage('Ошибка загрузки SVG изображения', 'error');
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
        handleExportError(type, error);
    }
}

// Скачивание PDF
function downloadPDF() {
    if (!validateSvg()) return;

    try {
        const { jsPDF } = window.jspdf;
        const fileName = getFileName();
        const svgElement = elements.svgContainer.firstChild;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const scale = config.pdfScale;
        const svgWidth = parseFloat(svgElement.getAttribute('width'));
        const svgHeight = parseFloat(svgElement.getAttribute('height'));
        
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        canvas.style.width = svgWidth + 'px';
        canvas.style.height = svgHeight + 'px';
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const pdf = new jsPDF({
                orientation: svgWidth > svgHeight ? 'landscape' : 'portrait',
                unit: 'px',
                compress: false
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const ratio = Math.min(
                (pdfWidth - config.pdfMargin * 2) / canvas.width,
                (pdfHeight - config.pdfMargin * 2) / canvas.height
            );
            
            const scaledWidth = canvas.width * ratio;
            const scaledHeight = canvas.height * ratio;
            
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;
            
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.95),
                'JPEG',
                x,
                y,
                scaledWidth,
                scaledHeight,
                undefined,
                'FAST'
            );
            
            pdf.save(fileName + '.pdf');
            addLogMessage(`PDF файл "${fileName}.pdf" (высокое качество) успешно скачан`, 'success');
        };
        
        img.onerror = function() {
            addLogMessage('Ошибка загрузки SVG изображения', 'error');
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
        handleExportError('PDF', error);
    }
}

// Вспомогательные функции для экспорта
function validateSvg() {
    if (!elements.svgContainer.firstChild || elements.svgContainer.firstChild.nodeName !== "svg") {
        addLogMessage('Сначала сгенерируйте таблицу', 'error');
        return false;
    }
    return true;
}

function getFileName() {
    return (currentTableTitle || "table").replace(/[^\wа-яА-ЯёЁ\s-]/gi, '').trim().replace(/\s+/g, '_') || 'table';
}

function downloadFile(blob, fileName, successMessage) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLogMessage(successMessage, 'success');
}

function handleExportError(type, error) {
    addLogMessage(`Ошибка при скачивании ${type}: ${error.message}`, 'error');
    console.error(`Ошибка при скачивании ${type}:`, error);
}