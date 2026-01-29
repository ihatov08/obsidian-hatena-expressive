export async function generateWsseHeader(
	username: string,
	apiKey: string
): Promise<string> {
	const nonce = crypto.getRandomValues(new Uint8Array(20));
	const created = new Date().toISOString();

	const encoder = new TextEncoder();
	const nonceStr = Array.from(nonce).join('');
	const data = encoder.encode(nonceStr + created + apiKey);

	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const passwordDigest = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
	const nonceBase64 = btoa(nonceStr);

	return `UsernameToken Username="${username}", PasswordDigest="${passwordDigest}", Nonce="${nonceBase64}", Created="${created}"`;
}
