async function renderMenu() {
	document.getElementById("menu").hidden = false
	const grid = document.getElementById("menu-grid")
	const user = "jutier", repo = "Slides";

	try {
		const res = await fetch(
			`https://api.github.com/repos/${user}/${repo}/contents/presentations`
		)
		if (!res.ok) throw new Error(`API do GitHub retornou ${res.status}`)
		const items = (await res.json()).filter((i) => i.type === "dir")

		if (!items.length) {
			grid.innerHTML = '<p class="empty">Nenhuma apresentação encontrada.</p>'
			return
		}

		grid.innerHTML = items.map((item) => renderCard(item.name)).join("")
	} catch (err) {
		grid.innerHTML = `<p class="empty">Não foi possível listar as apresentações (${escapeHtml(err.message)}).</p>`
	}
}

function renderCard(slug) {
	const encoded = encodeURIComponent(slug)
	return `
	  <div class="card">
		<div class="card-info">
		  <h2>${escapeHtml(slug)}</h2>
		</div>
		<div class="card-actions">
		  <a class="card-btn" href="?presentation=${encoded}">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18a2 2 0 0 0-4 0"/><path d="m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11"/><path d="M2 11h20"/><circle cx="17" cy="18" r="3"/><circle cx="7" cy="18" r="3"/></svg>
		  </a>
		  <a class="card-btn" href="?presentation=${encoded}&view=viewer">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
		  </a>
		  <a class="card-btn" href="?presentation=${encoded}&view=host">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
		  </a>
		</div>
	  </div>
	`
}
