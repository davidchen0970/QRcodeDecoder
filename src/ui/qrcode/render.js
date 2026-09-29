// QR output (render + download) DOM rendering.

/**
 * Render a 400x400 QR into a container.
 * Depends on the global `QRCode` (qrcodejs) loaded via a <script> tag.
 */
export function renderQR(container, text, size = 400) {
	container.innerHTML = ""; // drop any previous QR
	new QRCode(container, { text, width: size, height: size });
}

/**
 * Wait for the QR to finish rendering, then hand the canvas image to a download link.
 * Depends on the <canvas> inside the container (qrcodejs output).
 */
export function enableDownload(downloadLink, container) {
	setTimeout(() => {
		const canvas = container.querySelector("canvas");
		if (canvas) {
			downloadLink.href = canvas.toDataURL("image/png");
			downloadLink.classList.remove("d-none");
		}
	}, 500);
}
