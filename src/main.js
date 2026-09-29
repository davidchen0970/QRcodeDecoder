// App bootstrap: pick the flow from whether the URL carries a `data` param.
//
// - With a `data` param     -> decode mode: decode and render the scan result
// - Without a `data` param  -> generate mode: bind the generate / upload-decode buttons

import { decodePayload } from "./core/payload.js";
import { renderScanResult, showDecodedSection } from "./ui/sections/scanner.js";
import { renderDecodeError } from "./app/decoder.js";
import { setupGenerator } from "./app/generator.js";

const dataParam = new URLSearchParams(window.location.search).get("data");

if (dataParam) {
	// ========== Decode mode ==========
	showDecodedSection();
	try {
		renderScanResult(decodePayload(dataParam));
	} catch (err) {
		console.error("parse failed: ", err);
		renderDecodeError();
	}
} else {
	// ========== Generate mode ==========
	setupGenerator();
}
