export async function handler(event) {
	const url = event.queryStringParameters?.url;
	if (!url) return { statusCode: 400, body: 'Missing url' };

	const apiKey = process.env.UMAMI_API_KEY;
	const websiteId = process.env.UMAMI_WEBSITE_ID;
	const now = Date.now();

	const res = await fetch(
		`https://cloud.umami.is/api/websites/${websiteId}/stats?startAt=0&endAt=${now}&url=${encodeURIComponent(url)}`,
		{ headers: { 'x-umami-api-key': apiKey } }
	);

	const data = await res.json();

	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ views: data.pageviews?.value ?? 0 })
	};
}
