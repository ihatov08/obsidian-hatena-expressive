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
		new Notice(
			'Expressive Code CSS copied to clipboard! Paste it into your Hatena Blog theme settings.'
		);
	} catch (error) {
		notice.hide();
		console.error('Failed to generate CSS:', error);
		new Notice(
			`Failed to generate CSS: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
