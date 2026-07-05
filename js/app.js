const params = new URLSearchParams(location.search)
const presentationSlug = params.get("presentation")
const viewMode = params.get("view") // 'host' | 'viewer' | null

if (presentationSlug) {
	loadPresentation(presentationSlug, viewMode)
} else {
	renderMenu()
}
