// Easter egg: a Christmas tree + snowfall.

/**
 * Spawn one snowflake onto <body> and remove it when its animation ends.
 */
export function createSnowflake() {
	const snowflake = document.createElement("div");
	snowflake.className = "snowflake";
	snowflake.textContent = "❄";
	snowflake.style.left = Math.random() * 100 + "vw";
	snowflake.style.animationDuration = Math.random() * 3 + 2 + "s";
	snowflake.style.fontSize = Math.random() * 10 + 10 + "px";
	document.body.appendChild(snowflake);

	// Drop snowflakes that have drifted past the viewport.
	snowflake.addEventListener("animationend", () => {
		snowflake.remove();
	});
}

/**
 * Render the ASCII Christmas tree into a target container and start snowing.
 * Swap this for nicer ASCII art or an actual image if desired.
 */
export function showChristmasTree(targetContainer) {
	const treeElement = document.createElement("div");
	treeElement.className = "trwe";
	treeElement.innerHTML = `
<pre style="font-family: monospace; color: green;">
       *
      ***
     *****
    *******
   *********
  ***********
       *
       *
 Merry Christmas!
</pre>
	`;
	targetContainer.appendChild(treeElement);
	setInterval(createSnowflake, 400);
}
