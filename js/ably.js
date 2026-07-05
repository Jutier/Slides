async function fetchAblyConfig() {
	const res = await fetch("ably-config.json")
	return res.json()
}

function channelName(slug) {
	return `slides:${slug}`
}

let statusHideTimer = null

function showStatus(text) {
	const el = document.getElementById("sync-status")
	el.hidden = false
	el.textContent += text + "\n"

	clearTimeout(statusHideTimer)
	statusHideTimer = setTimeout(() => {
		el.hidden = true
		el.textContent = ""
	}, 3000)
}

async function initHost(deck, slug) {
	showStatus("⏳ Aguardando autenticação…")
	const password = prompt("Senha para ativar o modo apresentador (host):")
	if (!password) {
		showStatus("🚫 Transmissão cancelada (senha não fornecida)")
		return
	}

	try {
		const config = await fetchAblyConfig()
		const hostKey = await decryptSecret(config.host, password)

		const ably = new Ably.Realtime({ key: hostKey })
		const channel = ably.channels.get(channelName(slug), {
			params: { occupancy: "metrics" },
		})

		ably.connection.on("connected", () => showStatus("✅ Transmitindo ao vivo"))
		ably.connection.on("failed", () => showStatus("❌ Falha na conexão"))

		channel.subscribe("[meta]occupancy", (msg) => {
			console.log("HO")
			showStatus(`👤 Usuários: ${msg.data.metrics.subscribers}`)
		})

		let lastSent = null
		const publishState = () => {
			const { h, v, f } = deck.getIndices()
			const key = `${h}-${v}-${f ?? 0}`
			if (key === lastSent) return
			lastSent = key
			channel.publish("slide-change", { h, v, f: f ?? 0 })
		}

		deck.on("slidechanged", publishState)
		deck.on("fragmentshown", publishState)
		deck.on("fragmenthidden", publishState)
	} catch (err) {
		console.error(err)
		showStatus("❌ Falha na conexão")
	}
}

async function initViewer(deck, slug) {
	showStatus("📶 Conectando…")

	try {
		const config = await fetchAblyConfig()

		const ably = new Ably.Realtime({
			key: config.viewerKey,
		})
		const channel = ably.channels.get(channelName(slug))

		ably.connection.on("connected", () => showStatus("✅ Conectado"))
		ably.connection.on("failed", () => showStatus("❌ Falha na conexão"))

		channel.subscribe("slide-change", (msg) => {
			const { h, v, f } = msg.data
			deck.slide(h, v, f)
		})

		channel.presence.enter()
	} catch (err) {
		console.error(err)
		showStatus("❌ Falha na conexão")
	}
}
