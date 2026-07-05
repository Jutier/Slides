const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function toBase64(buffer) {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function fromBase64(str) {
	return Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
}

async function deriveKey(password, saltBytes) {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		textEncoder.encode(password),
		"PBKDF2",
		false,
		["deriveKey"]
	)
	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt: saltBytes, iterations: 250000, hash: "SHA-256" },
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"]
	)
}

async function encryptSecret(plaintext, password) {
	const salt = crypto.getRandomValues(new Uint8Array(16))
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await deriveKey(password, salt)
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		textEncoder.encode(plaintext)
	)
	return {
		salt: toBase64(salt),
		iv: toBase64(iv),
		ciphertext: toBase64(ciphertext),
	}
}

async function decryptSecret({ salt, iv, ciphertext }, password) {
	const key = await deriveKey(password, fromBase64(salt))
	const plainBuf = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(iv) },
		key,
		fromBase64(ciphertext)
	)
	return textDecoder.decode(plainBuf)
}
