// Scan-result area (decoded-section / generator-section) DOM rendering.

import { countUrls } from "../../core/urls.js";
import { showChristmasTree } from "../effects/snowfall.js";

const ID = {
	decodedSection: "decoded-section",
	generatorSection: "generator-section",
	genTime: "gen-time",
	urlCount: "url-count",
	links: "links-container",
};

/** Show the "scan result" area and hide the "generate QR" area. */
export function showDecodedSection() {
	document.getElementById(ID.decodedSection).classList.remove("d-none");
	document.getElementById(ID.generatorSection).classList.add("d-none");
}

/** Show the "generate QR" area and hide the "scan result" area. */
export function showGeneratorSection() {
	document.getElementById(ID.generatorSection).classList.remove("d-none");
	document.getElementById(ID.decodedSection).classList.add("d-none");
}

/** True when any URL triggers the "Christmas tree" easter egg keyword. */
export function hasTreeLink(urls) {
	return (urls || []).some(
		(link) =>
			link.includes("聖誕樹") || link.toLowerCase().includes("christmas tree")
	);
}

/**
 * Render a payload into the scan-result area: fill in the generated time and URL
 * count, add one clickable button per URL, and pull up the Christmas tree when a
 * URL matches the easter-egg keyword.
 */
export function renderScanResult(payload) {
	const urls = payload.urls || [];

	document.getElementById(ID.genTime).textContent =
		payload.generatedTime || "未知";
	document.getElementById(ID.urlCount).textContent = countUrls(urls);

	const linksContainer = document.getElementById(ID.links);
	linksContainer.innerHTML = ""; // drop old content

	urls.forEach((link, index) => {
		const btn = document.createElement("button");
		btn.classList.add("btn", "link-button");

		const num = document.createElement("span");
		num.className = "link-index";
		num.textContent = `網址 ${index + 1}`;

		const url = document.createElement("span");
		url.className = "link-url";
		url.textContent = link;

		btn.append(num, url);
		btn.onclick = () => {
			window.open(link, "_blank");
		};
		linksContainer.appendChild(btn);
	});

	if (hasTreeLink(urls)) {
		showChristmasTree(linksContainer);
	}
}
