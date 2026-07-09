async function loadPresentation(slug, viewMode) {
	const deckContainer = document.getElementById("deck-container")
	deckContainer.hidden = false

	const res = await fetch(`presentations/${slug}/index.html`)
	if (!res.ok) {
		deckContainer.innerHTML = `<p class="empty">Apresentação "${escapeHtml(slug)}" não encontrada.</p>`
		return
	}

	const html = await res.text()
	const doc = new DOMParser().parseFromString(html, "text/html")
	document.title = doc.querySelector("title")?.textContent || slug
	deckContainer.querySelector(".slides").innerHTML = doc.body.innerHTML

	const theme = doc.querySelector('meta[name="reveal-theme"]')?.content
	if (theme) {
		document.getElementById("reveal-theme").href =
			`revealjs6/theme/${theme}.css`
	}

	// Config base, igual pra qualquer apresentação e qualquer papel.
	const baseConfig = {
		controls: true,
		controlsTutorial: false,
		progress: true,
		slideNumber: false,
		hashOneBasedIndex: true,
		hash: true,
		respondToHashChanges: true,
		keyboard: true,
		loop: false,
		mouseWheel: true,
		transition: "slide", // none/fade/slide/convex/concave/zoom
		backgroundTransition: "slide", // none/fade/slide/convex/concave/zoom
		hideCursorTime: 3000,
		plugins: [
			RevealHighlight,
			RevealMarkdown,
			RevealNotes,
			RevealMath,
			RevealZoom,
		],
	}

	// Overrides por papel: host e local navegam normalmente, viewer é só leitura.
	const viewOverrides = {
		host: {},
		viewer: {
			controls: false,
			keyboard: false,
			mouseWheel: false,
			touch: false,
			help: false,
		},
		local: {},
	}

	const deck = new Reveal(deckContainer, {
		...baseConfig,
		...viewOverrides[viewMode || "local"],
	})
	await deck.initialize()

	if (viewMode === "host") await initHost(deck, slug)
	else if (viewMode === "viewer") await initViewer(deck, slug)
}
