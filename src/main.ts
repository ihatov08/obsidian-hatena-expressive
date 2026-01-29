import { Plugin } from 'obsidian';
import { HatenaSettingTab } from './settings';
import { executePostCommand } from './commands/post-command';
import { executeExportCssCommand } from './commands/export-css-command';
import { DEFAULT_SETTINGS, type HatenaPluginSettings } from './types';

export default class HatenaExpressivePlugin extends Plugin {
	settings: HatenaPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'post-to-hatena',
			name: 'Post to Hatena Blog',
			callback: () => executePostCommand(this),
		});

		this.addCommand({
			id: 'post-draft-to-hatena',
			name: 'Post to Hatena Blog as Draft',
			callback: async () => {
				const originalDefault = this.settings.defaultDraft;
				this.settings.defaultDraft = true;
				await executePostCommand(this);
				this.settings.defaultDraft = originalDefault;
			},
		});

		this.addCommand({
			id: 'export-expressive-code-css',
			name: 'Export Expressive Code CSS for theme',
			callback: () => executeExportCssCommand(this),
		});

		this.addSettingTab(new HatenaSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		) as HatenaPluginSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
