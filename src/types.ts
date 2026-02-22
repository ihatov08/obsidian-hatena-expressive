export interface HatenaPluginSettings {
	apiKey: string;
	rootEndpoint: string;
	theme: string;
	defaultDraft: boolean;
}

export const DEFAULT_SETTINGS: HatenaPluginSettings = {
	apiKey: '',
	rootEndpoint: '',
	theme: 'github-dark',
	defaultDraft: true,
};

export interface HatenaEntry {
	title: string;
	content: string;
	categories: string[];
	draft: boolean;
}

export interface HatenaResponse {
	memberUri: string | null;
	hatenaUrl: string | null;
}

export interface PostOptions {
	title: string;
	categories: string[];
	isDraft: boolean;
}

export interface FrontmatterData {
	title?: string;
	categories?: string[];
	draft?: boolean;
	'hatena-member-uri'?: string;
	'hatena-url'?: string;
	[key: string]: unknown;
}
