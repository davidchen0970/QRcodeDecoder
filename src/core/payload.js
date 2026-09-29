// Pure payload logic: mapping between a data object and a URL-safe `data` param.
// Does not look at the current page URL and never touches the DOM;
// everything is passed in as arguments.

/**
 * Build the object that gets embedded in a QR code from a URL list.
 * generatedTime defaults to now (ISO string with the fractional seconds dropped).
 */
export function buildPayload(urls, generatedTime) {
	const time =
		generatedTime ||
		new Date().toISOString().replace("T", " ").split(".")[0];
	return { urls: urls || [], generatedTime: time };
}

/**
 * Encode a data object into a URL-safe `data` param string.
 * - JSON-stringify
 * - encodeURIComponent then btoa (via unescape/escape) to keep CJK intact
 * - wrap the base64 in encodeURIComponent so it is safe to place in a URL
 */
export function encodePayload(dataObj) {
	const jsonStr = JSON.stringify(dataObj);
	const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
	return encodeURIComponent(base64Str);
}

/**
 * Restore a data object from a `data` param string (inverse of encodePayload).
 * Throws on malformed input; the caller decides what message to show.
 */
export function decodePayload(dataParam) {
	// First decodeURIComponent to turn URL-safe chars back.
	const base64Decoded = decodeURIComponent(dataParam);
	// Then base64-decode; atob + decodeURIComponent(escape(...)) keeps CJK intact.
	const jsonStr = decodeURIComponent(escape(atob(base64Decoded)));
	return JSON.parse(jsonStr);
}

/**
 * Build the current page URL that, when scanned, carries the given `data` param.
 */
export function makeScanUrl(dataParam) {
	return `${window.location.origin}${window.location.pathname}?data=${dataParam}`;
}
