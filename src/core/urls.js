// Pure URL / string helpers. No DOM.

/**
 * Split multi-line input (e.g. a textarea) into a list of non-empty URLs.
 * Each line is trimmed; blank lines are dropped.
 */
export function parseUrls(rawText) {
	return String(rawText || "")
		.split("\n")
		.map((u) => u.trim())
		.filter((u) => u !== "");
}

/**
 * Count of URLs (0 when the value is missing).
 */
export function countUrls(urls) {
	return (urls || []).length;
}

/**
 * Pull the `data` param out of a scanned QR payload.
 * Throws when the payload is not a valid URL; the caller picks the message.
 */
export function extractDataParam(scannedData) {
	return new URL(scannedData).searchParams.get("data");
}
