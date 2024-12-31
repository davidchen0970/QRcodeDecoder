(function() {
    // 1. 先檢查網址中是否有 data=xxxx 參數
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
  
    // 取得介面元素
    const decodedSection = document.getElementById('decoded-section');
    const generatorSection = document.getElementById('generator-section');
    const btnGenerate = document.getElementById('btn-generate');
    const qrcodeContainer = document.getElementById('qrcode');
    const downloadLink = document.getElementById('download-link');
  
    // 元素新增：上傳相關
    const btnDecode = document.getElementById('btn-decode');
    const qrUpload = document.getElementById('qr-upload');
    const hiddenCanvas = document.getElementById('hidden-canvas');
  
    if (dataParam) {
      // 有 data 參數 -> 進入「解析模式」
      decodedSection.classList.remove('d-none'); // 顯示
      generatorSection.classList.add('d-none');  // 隱藏
  
      try {
        // 做 decode：先 URL decode，再 base64 decode，再 JSON parse
        const base64Decoded = decodeURIComponent(dataParam);
        const jsonStr = atob(base64Decoded);
        const dataObj = JSON.parse(jsonStr);
  
        // 顯示附加資訊
        document.getElementById('gen-time').textContent =
          dataObj.generatedTime || '未知';
        document.getElementById('url-count').textContent = (
          dataObj.urls || []
        ).length;
  
        // 生成按鈕
        const linksContainer = document.getElementById('links-container');
        (dataObj.urls || []).forEach((link, index) => {
          const btn = document.createElement('button');
          btn.classList.add('btn', 'btn-info', 'w-100', 'link-button');
          btn.textContent = `網址 ${index + 1}: ${link}`;
          btn.onclick = () => {
            window.open(link, '_blank');
          };
          linksContainer.appendChild(btn);
        });
      } catch (err) {
        console.error('解析失敗: ', err);
        const linksContainer = document.getElementById('links-container');
        linksContainer.textContent =
          '無法解析此 QR code 資訊，可能已損壞或內容不完整。';
      }
    } else {
      // 無 data 參數 -> 進入「產生 QR code 模式」
      generatorSection.classList.remove('d-none'); // 顯示
      decodedSection.classList.add('d-none');      // 隱藏
  
      // 綁定產生QR code按鈕事件
      btnGenerate.addEventListener('click', () => {
        const inputVal = document.getElementById('url-input').value.trim();
        if (!inputVal) {
          alert('請至少輸入一個網址再產生 QR code');
          return;
        }
  
        // 拆成多行網址
        const urls = inputVal
          .split('\n')
          .map(u => u.trim())
          .filter(u => u !== '');
  
        // 組成要放進 QR code 的資料物件
        const dataObj = {
          urls: urls,
          // 產生時間可依照你想要的格式處理，這邊只是範例
          generatedTime: new Date().toISOString().replace('T', ' ').split('.')[0]
        };
  
        // JSON -> Base64 -> URI Encode
        const jsonStr = JSON.stringify(dataObj);
        const base64Str = btoa(jsonStr);
        const encodedData = encodeURIComponent(base64Str);
  
        // 組成最終掃描URL
        const finalUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
  
        // 清空舊的 QR code
        qrcodeContainer.innerHTML = "";
  
        // 使用 qrcode.js 產生新的 QR code（放大到 400 x 400）
        new QRCode(qrcodeContainer, {
          text: finalUrl,
          width: 400,
          height: 400,
        });
  
        // 延遲一下再提供下載連結（因為 QR code 需要時間 render）
        setTimeout(() => {
          const canvas = qrcodeContainer.querySelector('canvas');
          if (canvas) {
            // 轉為 Base64 圖片
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.classList.remove('d-none');
          }
        }, 500);
      });
  
      // 綁定解析QR code按鈕事件
      btnDecode.addEventListener('click', () => {
        const file = qrUpload.files[0];
        if (!file) {
          alert('請先選擇一個 QR code 圖片檔案');
          return;
        }
  
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
            // 設定 canvas 大小與圖片相同
            hiddenCanvas.width = img.width;
            hiddenCanvas.height = img.height;
            const ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
  
            // 取得影像資料
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
  
            if (code) {
              try {
                // 假設 QR code 的內容是 URL，檢查是否有 data 參數
                const qrData = code.data;
                const qrUrl = new URL(qrData);
                const qrDataParam = qrUrl.searchParams.get('data');
  
                if (qrDataParam) {
                  // 重用原本的解析邏輯
                  // 清除任何現有的內容
                  decodedSection.classList.remove('d-none');
                  generatorSection.classList.add('d-none');
  
                  const base64Decoded = decodeURIComponent(qrDataParam);
                  const jsonStr = atob(base64Decoded);
                  const dataObj = JSON.parse(jsonStr);
  
                  // 顯示附加資訊
                  document.getElementById('gen-time').textContent =
                    dataObj.generatedTime || '未知';
                  document.getElementById('url-count').textContent = (
                    dataObj.urls || []
                  ).length;
  
                  // 生成按鈕
                  const linksContainer = document.getElementById('links-container');
                  linksContainer.innerHTML = ''; // 清空之前的內容
                  (dataObj.urls || []).forEach((link, index) => {
                    const btn = document.createElement('button');
                    btn.classList.add('btn', 'btn-info', 'w-100', 'link-button');
                    btn.textContent = `網址 ${index + 1}: ${link}`;
                    btn.onclick = () => {
                      window.open(link, '_blank');
                    };
                    linksContainer.appendChild(btn);
                  });
                } else {
                  alert('QR code 中未包含預期的 data 參數');
                }
              } catch (err) {
                console.error('解析失敗: ', err);
                alert('無法解析此 QR code 資訊，可能已損壞或內容不完整。');
              }
            } else {
              alert('無法辨識 QR code，請確保圖片清晰且包含 QR code。');
            }
          };
          img.onerror = function() {
            alert('無法載入圖片，請確保檔案為有效的圖片格式。');
          };
          img.src = event.target.result;
        };
        reader.onerror = function() {
          alert('無法讀取檔案，請重試。');
        };
        reader.readAsDataURL(file);
      });
    }
  })();