// 引入外部庫
// QRCode.js, LZ-String 和 jsQR 已經在 HTML 中透過 CDN 引入

document.addEventListener('DOMContentLoaded', function() {
    const qrForm = document.getElementById('qrForm');
    const qrcodeContainer = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const fileInput = document.getElementById('fileInput');
    const decodedData = document.getElementById('decodedData');

    // 處理 QR Code 生成
    qrForm.addEventListener('submit', function(e) {
        e.preventDefault();
        qrcodeContainer.innerHTML = '';
        downloadLink.style.display = 'none';

        const description = document.getElementById('description').value.trim();
        const urls = document.getElementById('urls').value.trim().split('\n').map(url => url.trim()).filter(url => url);

        if (urls.length === 0) {
            alert('請至少輸入一個網址。');
            return;
        }

        const data = {
            description: description,
            urls: urls,
            generatedAt: new Date().toISOString()
        };

        // 將資料轉換為 JSON 字串
        const jsonData = JSON.stringify(data);
        // 壓縮資料
        const compressedData = LZString.compressToEncodedURIComponent(jsonData);
        // 生成最終的 URL
        const finalURL = `${window.location.origin}${window.location.pathname}#data=${compressedData}`;

        // 生成 QR Code
        const qrCode = new QRCode(qrcodeContainer, {
            text: finalURL,
            width: 256,
            height: 256,
            correctLevel: QRCode.CorrectLevel.H
        });

        // 等待 QR Code 生成後，設定下載連結
        setTimeout(() => {
            const qrCanvas = qrcodeContainer.querySelector('canvas');
            if (qrCanvas) {
                const dataURL = qrCanvas.toDataURL("image/png");
                downloadLink.href = dataURL;
                downloadLink.style.display = 'block';
            }
        }, 500);
    });

    // 處理 QR Code 解析
    function parseURLHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#data=')) {
            const compressedData = decodeURIComponent(hash.slice(6));
            const jsonData = LZString.decompressFromEncodedURIComponent(compressedData);
            if (jsonData) {
                const data = JSON.parse(jsonData);
                displayDecodedData(data);
            } else {
                decodedData.innerHTML = '<p>無法解壓縮 QR Code 資料。</p>';
            }
        }
    }

    function displayDecodedData(data) {
        // 顯示元資料
        const metadata = document.createElement('div');
        metadata.className = 'metadata';
        metadata.innerHTML = `
            <p><strong>描述：</strong> ${data.description || '無'}</p>
            <p><strong>生成時間：</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
        `;
        decodedData.appendChild(metadata);

        // 生成按鈕
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        data.urls.forEach((url, index) => {
            const button = document.createElement('button');
            button.textContent = `連結 ${index + 1}`;
            button.addEventListener('click', () => {
                window.open(url, '_blank');
            });
            buttonContainer.appendChild(button);
        });

        decodedData.appendChild(buttonContainer);
    }

    // 解析 URL Hash
    parseURLHash();

    // 處理文件上傳解析
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function() {
            const img = new Image();
            img.src = reader.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    // 解析成功後，跳轉到解碼 URL
                    window.location.href = code.data;
                } else {
                    alert('無法解碼此 QR Code。請確保圖片包含有效的 QR Code。');
                }
            };
        };
        reader.readAsDataURL(file);
    });
});
