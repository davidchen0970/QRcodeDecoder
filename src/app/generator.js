// Generate mode: bind the "generate QR" and the "upload and decode" buttons.

import { parseUrls } from "../core/urls.js";
import { buildPayload, encodePayload, makeScanUrl } from "../core/payload.js";
import { renderQR, enableDownload } from "../ui/qrcode/render.js";
import { handleScannedData } from "./decoder.js";
import { showGeneratorSection } from "../ui/sections/scanner.js";

const ID = {
	urlInput: "url-input",
	btnGenerate: "btn-generate",
	qrCode: "qrcode",
	downloadLink: "download-link",
	qrUpload: "qr-upload",
	btnDecode: "btn-decode",
	hiddenCanvas: "hidden-canvas",
};

export function setupGenerator() {
	showGeneratorSection(); // show the generate area and hide the result area

	const btnGenerate = document.getElementById(ID.btnGenerate);
	const btnDecode = document.getElementById(ID.btnDecode);

	btnGenerate.addEventListener("click", onGenerate);
	btnDecode.addEventListener("click", onDecodeUpload);
}

function onGenerate() {
	const inputVal = document.getElementById(ID.urlInput).value.trim();
	if (!inputVal) {
		alert("請至少輸入一個網址再產生 QR code");
		return;
	}

	// Split the textarea into one URL per line.
	const urls = parseUrls(inputVal);

	// Build the data object and encode it as a `data` param.
	const dataObj = buildPayload(urls);
	const dataParam = encodePayload(dataObj);

	// Final scan URL (adjust here if the need grows).
	const finalUrl = makeScanUrl(dataParam);

	// Render a new QR code (scaled to 400 x 400).
	const qrContainer = document.getElementById(ID.qrCode);
	renderQR(qrContainer, finalUrl, 400);

	// Delay before enabling download so the QR has time to render.
	enableDownload(document.getElementById(ID.downloadLink), qrContainer);
}

function onDecodeUpload() {
	const file = document.getElementById(ID.qrUpload).files[0];
	if (!file) {
		alert("請先選擇一個 QR code 圖片檔案");
		return;
	}

	const reader = new FileReader();
	reader.onload = function (event) {
		const img = new Image();
		img.onload = function () {
			const hiddenCanvas = document.getElementById(ID.hiddenCanvas);
			// Size the canvas to match the image.
			hiddenCanvas.width = img.width;
			hiddenCanvas.height = img.height;
			const ctx = hiddenCanvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);

			// Grab the pixel data and run it through jsQR.
			const imageData = ctx.getImageData(0, 0, img.width, img.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);

			if (code) {
				handleScannedData(code.data);
			} else {
				alert("無法辨識 QR code，請確保圖片清晰且包含 QR code。");
			}
		};
		img.onerror = function () {
			alert("無法載入圖片，請確保檔案為有效的圖片格式。");
		};
		img.src = event.target.result;
	};
	reader.onerror = function () {
		alert("無法讀取檔案，請重試。");
	};
	reader.readAsDataURL(file);
}
