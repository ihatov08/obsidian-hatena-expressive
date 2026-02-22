import { Notice } from 'obsidian';
import type HatenaExpressivePlugin from '../main';
import {
	getExpressiveCodeStyles,
	getExpressiveCodeScripts,
} from '../markdown/processor';

export async function executeExportCssCommand(
	plugin: HatenaExpressivePlugin
): Promise<void> {
	const { settings } = plugin;

	const notice = new Notice('Generating CSS...', 0);

	try {
		const css = await getExpressiveCodeStyles(settings.theme);

		await navigator.clipboard.writeText(css);

		notice.hide();
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		new Notice('CSS copied to clipboard. Paste it into your Hatena blog theme.');
	} catch (error) {
		notice.hide();
		console.error('Failed to generate CSS:', error);
		new Notice(
			`Failed to generate CSS: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

export async function executeExportJsCommand(
	plugin: HatenaExpressivePlugin
): Promise<void> {
	const { settings } = plugin;

	// eslint-disable-next-line obsidianmd/ui/sentence-case
	const notice = new Notice('Generating JS...', 0);

	try {
		const js = await getExpressiveCodeScripts(settings.theme);
		const scriptTag = `<script type="module">\n${js}\n</script>`;

		await navigator.clipboard.writeText(scriptTag);

		notice.hide();
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		new Notice('JS copied to clipboard. Paste it into Hatena blog head elements.');
	} catch (error) {
		notice.hide();
		console.error('Failed to generate JS:', error);
		new Notice(
			`Failed to generate JS: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
