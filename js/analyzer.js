let currentFile = null;
let currentImage = null;
let exifParser = null;
let histogramGenerator = null;

document.addEventListener('DOMContentLoaded', () => {
    initAnalyzer();
});

function initAnalyzer() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');

    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    analyzeBtn.addEventListener('click', () => {
        if (currentFile) {
            analyzePhoto();
        }
    });

    clearBtn.addEventListener('click', () => {
        resetAnalyzer();
    });
}

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    currentFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = e.target.result;

        const img = new Image();
        img.onload = () => {
            currentImage = img;
        };
        img.src = e.target.result;

        document.getElementById('uploadContent').classList.add('hidden');
        document.getElementById('previewContent').classList.remove('hidden');
    };

    reader.readAsDataURL(file);
}

async function analyzePhoto() {
    const resultsPanel = document.getElementById('resultsPanel');
    resultsPanel.classList.remove('hidden');

    document.getElementById('exifData').innerHTML = '<div class="loading-spinner"></div>';
    document.getElementById('tipsContainer').innerHTML = '<div class="loading-spinner"></div>';

    await new Promise(resolve => setTimeout(resolve, 500));

    exifParser = new EXIFParser();
    const exifData = await exifParser.parseFile(currentFile);

    displayEXIFData(exifData);

    const histogramCanvas = document.getElementById('histogramCanvas');
    histogramGenerator = new HistogramGenerator(histogramCanvas);
    const histogramData = await histogramGenerator.generateFromImage(currentImage);

    const tipsEngine = new SmartTipsEngine(exifData, histogramData);
    const tips = tipsEngine.generateTips();

    displayTips(tips);

    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayEXIFData(exif) {
    const container = document.getElementById('exifData');

    const fields = [
        { key: 'make', label: 'CAMERA_MAKE' },
        { key: 'model', label: 'CAMERA_MODEL' },
        { key: 'lens', label: 'LENS' },
        { key: 'focalLength', label: 'FOCAL_LENGTH' },
        { key: 'aperture', label: 'APERTURE' },
        { key: 'shutterSpeed', label: 'SHUTTER_SPEED' },
        { key: 'iso', label: 'ISO' },
        { key: 'exposureBias', label: 'EXPOSURE_COMP' },
        { key: 'whiteBalance', label: 'WHITE_BALANCE' },
        { key: 'flash', label: 'FLASH' },
        { key: 'meteringMode', label: 'METERING_MODE' },
        { key: 'dateTime', label: 'DATE_TIME' }
    ];

    let html = '';
    fields.forEach(field => {
        if (exif[field.key]) {
            html += `
                <div class="exif-row">
                    <span class="exif-key">${field.label}</span>
                    <span class="exif-value">${exif[field.key]}</span>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

function displayTips(tips) {
    const container = document.getElementById('tipsContainer');

    if (tips.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No specific tips for this image. Your settings look good!</p>';
        return;
    }

    let html = '';
    tips.forEach(tip => {
        html += `
            <div class="tip-item">
                <div class="tip-title">${tip.title}</div>
                <div class="tip-desc">${tip.description}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function resetAnalyzer() {
    currentFile = null;
    currentImage = null;

    document.getElementById('uploadContent').classList.remove('hidden');
    document.getElementById('previewContent').classList.add('hidden');
    document.getElementById('resultsPanel').classList.add('hidden');
    document.getElementById('previewImage').src = '';
    document.getElementById('fileInput').value = '';
}
