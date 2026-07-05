document
	.getElementById("setup-generate")
	.addEventListener("click", async () => {
		const hostKey = document.getElementById("host-key").value.trim()
		const viewerKey = document.getElementById("viewer-key").value.trim()
		const password = document.getElementById("setup-password").value

		if (!hostKey || !viewerKey || !password) {
			alert("Preencha os três campos: host key, viewer key e senha.")
			return
		}

		const encryptedHost = await encryptSecret(hostKey, password)

		const config = {
			viewerKey,
			host: encryptedHost,
		}

		document.getElementById("setup-output").textContent = JSON.stringify(
			config,
			null,
			4
		)
		document.getElementById("output-box").hidden = false
		document.getElementById("setup-result-hint").hidden = false
	})

document.getElementById("copy-btn").addEventListener("click", async () => {
	const btn = document.getElementById("copy-btn")
	const text = document.getElementById("setup-output").textContent

	await navigator.clipboard.writeText(text)

	btn.classList.add("copied")
	setTimeout(() => btn.classList.remove("copied"), 1500)
})
