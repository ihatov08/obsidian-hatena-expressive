import { requestUrl } from 'obsidian';
import * as he from 'he';
import { generateWsseHeader } from './wsse';
import type { HatenaEntry, HatenaResponse } from '../types';

export class HatenaClient {
	constructor(
		private rootEndpoint: string,
		private apiKey: string
	) {}

	private get userId(): string {
		const match = this.rootEndpoint.match(/blog\.hatena\.ne\.jp\/([^/]+)/);
		return match?.[1] || '';
	}

	private async getWsseHeader(): Promise<string> {
		return generateWsseHeader(this.userId, this.apiKey);
	}

	async postEntry(entry: HatenaEntry): Promise<HatenaResponse> {
		const wsseHeader = await this.getWsseHeader();
		const xml = this.buildAtomXml(entry);

		const response = await requestUrl({
			url: `${this.rootEndpoint}/entry`,
			method: 'POST',
			contentType: 'application/xml',
			headers: {
				'X-WSSE': wsseHeader,
			},
			body: xml,
		});

		return this.parseAtomResponse(response.text);
	}

	async updateEntry(memberUri: string, entry: HatenaEntry): Promise<HatenaResponse> {
		const wsseHeader = await this.getWsseHeader();
		const xml = this.buildAtomXml(entry);

		const response = await requestUrl({
			url: memberUri,
			method: 'PUT',
			contentType: 'application/xml',
			headers: {
				'X-WSSE': wsseHeader,
			},
			body: xml,
		});

		return this.parseAtomResponse(response.text);
	}

	async uploadImage(
		filename: string,
		base64Content: string,
		mimeType: string
	): Promise<string | null> {
		const wsseHeader = await this.getWsseHeader();

		const xml = `<entry xmlns="http://purl.org/atom/ns#">
	<dc:subject>Hatena Blog</dc:subject>
	<title>${he.escape(filename)}</title>
	<content mode="base64" type="${mimeType}">${base64Content}</content>
</entry>`;

		const response = await requestUrl({
			url: 'https://f.hatena.ne.jp/atom/post',
			method: 'POST',
			contentType: 'application/xml',
			headers: {
				'X-WSSE': wsseHeader,
				Accept: 'application/x.atom+xml, application/xml, text/xml, */*',
			},
			body: xml,
		});

		const domParser = new DOMParser();
		const xmlDoc = domParser.parseFromString(response.text, 'text/xml');
		const imageId = xmlDoc.getElementsByTagName('hatena:syntax')[0]?.textContent;

		return imageId || null;
	}

	private buildAtomXml(entry: HatenaEntry): string {
		const categories = entry.categories
			.map((c) => `<category term="${he.escape(c)}" />`)
			.join('\n  ');

		return `<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app">
  <title>${he.escape(entry.title)}</title>
  <content type="text/html">${he.escape(entry.content)}</content>
  ${categories}
  <app:control>
    <app:draft>${entry.draft ? 'yes' : 'no'}</app:draft>
  </app:control>
</entry>`;
	}

	private parseAtomResponse(responseText: string): HatenaResponse {
		const domParser = new DOMParser();
		const xmlDoc = domParser.parseFromString(responseText, 'text/xml');

		const memberUri = xmlDoc
			.querySelector("link[rel='edit']")
			?.getAttribute('href') || null;
		const hatenaUrl = xmlDoc
			.querySelector('link[rel="alternate"]')
			?.getAttribute('href') || null;

		return { memberUri, hatenaUrl };
	}
}
