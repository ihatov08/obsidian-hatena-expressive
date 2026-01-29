import { App, PluginSettingTab, Setting } from 'obsidian';
import type HatenaExpressivePlugin from './main';
import type { HatenaPluginSettings } from './types';

export class HatenaSettingTab extends PluginSettingTab {
	plugin: HatenaExpressivePlugin;

	constructor(app: App, plugin: HatenaExpressivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Hatena Blog Settings' });

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Hatena user API key. Get it from your Hatena account settings.')
			.addText((text) =>
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Root Endpoint')
			.setDesc(
				"Hatena blog's AtomPub root endpoint. Find it in your blog settings under 'Advanced Settings > AtomPub'."
			)
			.addText((text) =>
				text
					.setPlaceholder('https://blog.hatena.ne.jp/userId/blogId/atom')
					.setValue(this.plugin.settings.rootEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.rootEndpoint = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl('h2', { text: 'Expressive Code Settings' });

		new Setting(containerEl)
			.setName('Theme')
			.setDesc('Syntax highlighting theme for code blocks.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('github-dark', 'GitHub Dark')
					.addOption('github-light', 'GitHub Light')
					.addOption('dracula', 'Dracula')
					.addOption('nord', 'Nord')
					.addOption('min-light', 'Min Light')
					.addOption('min-dark', 'Min Dark')
					.setValue(this.plugin.settings.theme)
					.onChange(async (value) => {
						this.plugin.settings.theme = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl('h2', { text: 'Post Settings' });

		new Setting(containerEl)
			.setName('Default to Draft')
			.setDesc('When enabled, posts will be saved as drafts by default.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.defaultDraft)
					.onChange(async (value) => {
						this.plugin.settings.defaultDraft = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
