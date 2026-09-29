// App layer: turn the raw content scanned from a QR back into a displayable result.
// Only coordinates (core parses  + ui renders + error messages); it does not
// generate QR codes or handle file uploads itself.

import { extractDataParam } from "../core/urls.js";
import { decodePayload } from "../core/payload.js";
import { renderScanResult, showDecodedSection } from "../ui/sections/scanner.js";

/**
 * Handle the raw string captured from an uploaded QR:
 * - pull the `data` param
 * - decode it into a payload and render the result area
 * - show a matching message when the payload is malformed / not the expected shape
 */
export function handleScannedData(scannedData) {
	try {
		const dataParam = extractDataParam(scannedData);
		if (dataParam) {
			// Same result as decoding from the URL: show the result area + render.
			showDecodedSection();
			renderScanResult(decodePayload(dataParam));
		} else {
			alert("QR code 中未包含預期的 data 參數");
		}
	} catch (err) {
		console.error("parse failed: ", err);
		alert("無法解析此 QR code 資訊，可能已損壞或內容不完整。");
	}
}

/**
 * When the URL carries a `data` param that fails to decode, write the error into
 * the result area.
 */
export function renderDecodeError() {
	document.getElementById("links-container").textContent =
		"無法解析此 QR code 資訊，可能已損壞或內容不完整。";
}
