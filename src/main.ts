import { Plugin } from 'obsidian';
import { HatenaSettingTab } from './settings';
import { executePostCommand } from './commands/post-command';
import {
	executeExportCssCommand,
	executeExportJsCommand,
} from './commands/export-css-command';
import { DEFAULT_SETTINGS, type HatenaPluginSettings } from './types';

export default class HatenaExpressivePlugin extends Plugin {
	settings: HatenaPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'post-to-hatena',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'Publish to Hatena',
			callback: () => executePostCommand(this),
		});

		this.addCommand({
			id: 'post-draft-to-hatena',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'Save draft to Hatena',
			callback: async () => {
				const originalDefault = this.settings.defaultDraft;
				this.settings.defaultDraft = true;
				await executePostCommand(this);
				this.settings.defaultDraft = originalDefault;
			},
		});

		this.addCommand({
			id: 'export-expressive-code-css',
			name: 'Export expressive code CSS for theme',
			callback: () => executeExportCssCommand(this),
		});

		this.addCommand({
			id: 'export-expressive-code-js',
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			name: 'Export expressive code JS for head',
			callback: () => executeExportJsCommand(this),
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
