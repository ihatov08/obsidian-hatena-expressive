import { Notice } from 'obsidian';
import type HatenaExpressivePlugin from '../main';
import { getExpressiveCodeStyles } from '../markdown/processor';

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
