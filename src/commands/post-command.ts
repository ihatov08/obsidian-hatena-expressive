import { Notice, TFile, normalizePath } from 'obsidian';
import type HatenaExpressivePlugin from '../main';
import { HatenaClient } from '../api/hatena-client';
import { convertMarkdownToHtml } from '../markdown/processor';
import {
	parseFrontmatter,
	extractTitle,
	extractCategories,
} from '../markdown/frontmatter';
import { PostModal } from '../ui/post-modal';
import type { PostOptions, HatenaEntry } from '../types';
import mime from 'mime';

const IMAGE_REGEX = /!\[\[([^\]]+)\]\]/g;

export async function executePostCommand(plugin: HatenaExpressivePlugin): Promise<void> {
	const { settings, app } = plugin;

	if (!settings.apiKey || !settings.rootEndpoint) {
		new Notice('Please configure API Key and Root Endpoint in settings');
		return;
	}

	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		new Notice('No active file');
		return;
	}

	const content = await app.vault.read(activeFile);
	const { frontmatter, body } = parseFrontmatter(content);

	const title = extractTitle(frontmatter, body, activeFile.name);
	const categories = extractCategories(frontmatter);
	const isUpdate = !!frontmatter['hatena-member-uri'];
	const isDraft = frontmatter.draft ?? settings.defaultDraft;

	const modal = new PostModal(app, {
		title,
		categories,
		isDraft,
		isUpdate,
		onConfirm: async (options: PostOptions) => {
			await publishPost(plugin, activeFile, body, frontmatter, options);
		},
	});
	modal.open();
}

async function publishPost(
	plugin: HatenaExpressivePlugin,
	file: TFile,
	body: string,
	frontmatter: Record<string, unknown>,
	options: PostOptions
): Promise<void> {
	const { settings, app } = plugin;
	const client = new HatenaClient(settings.rootEndpoint, settings.apiKey);

	const notice = new Notice(
		options.isDraft ? 'Saving as draft...' : 'Publishing...',
		0
	);

	try {
		// Process images
		let processedBody = body;
		const imageMatches = [...body.matchAll(IMAGE_REGEX)];

		for (const match of imageMatches) {
			const imagePath = match[1];
			if (!imagePath) continue;
			const imageFile = app.metadataCache.getFirstLinkpathDest(
				imagePath,
				file.path
			);

			if (imageFile) {
				try {
					const imageId = await uploadImage(plugin, imageFile, client);
					if (imageId) {
						processedBody = processedBody.replace(match[0], `[${imageId}]`);
					}
				} catch (e) {
					console.error('Failed to upload image:', e);
					new Notice(`Failed to upload image: ${imagePath}`);
				}
			}
		}

		// Convert Markdown to HTML
		const html = await convertMarkdownToHtml(processedBody, {
			theme: settings.theme,
		});

		const entry: HatenaEntry = {
			title: options.title,
			content: html,
			categories: options.categories,
			draft: options.isDraft,
		};

		const memberUri = frontmatter['hatena-member-uri'] as string | undefined;
		let response;

		if (memberUri) {
			response = await client.updateEntry(memberUri, entry);
		} else {
			response = await client.postEntry(entry);
		}

		// Update frontmatter
		await app.fileManager.processFrontMatter(file, (fm) => {
			fm.title = options.title;
			fm.categories = options.categories;
			if (response.memberUri) {
				fm['hatena-member-uri'] = response.memberUri;
			}
			if (response.hatenaUrl) {
				fm['hatena-url'] = response.hatenaUrl;
			}
		});

		notice.hide();
		new Notice(
			options.isDraft
				? 'Saved as draft successfully!'
				: 'Published successfully!'
		);
	} catch (error) {
		notice.hide();
		console.error('Failed to post:', error);
		new Notice(`Failed to post: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

async function uploadImage(
	plugin: HatenaExpressivePlugin,
	imageFile: TFile,
	client: HatenaClient
): Promise<string | null> {
	const { app } = plugin;

	const fileBinary = await app.vault.adapter.readBinary(
		normalizePath(imageFile.path)
	);
	const base64Content = arrayBufferToBase64(fileBinary);
	const mimeType = mime.getType(imageFile.extension) || 'application/octet-stream';

	return client.uploadImage(imageFile.basename, base64Content, mimeType);
}
