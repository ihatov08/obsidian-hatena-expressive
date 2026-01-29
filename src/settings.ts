import { App, PluginSettingTab, Setting } from 'obsidian';
import type HatenaExpressivePlugin from './main';

export class HatenaSettingTab extends PluginSettingTab {
	plugin: HatenaExpressivePlugin;

	constructor(app: App, plugin: HatenaExpressivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Hatena blog').setHeading();

		new Setting(containerEl)
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setName('API key')
			// eslint-disable-next-line obsidianmd/ui/sentence-case
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
			.setName('Root endpoint')
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setDesc("Hatena blog's AtomPub root endpoint. Find it in your blog advanced options.")
			.addText((text) =>
				text
					.setPlaceholder('https://blog.hatena.ne.jp/userId/blogId/atom')
					.setValue(this.plugin.settings.rootEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.rootEndpoint = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName('Expressive code').setHeading();

		new Setting(containerEl)
			.setName('Theme')
			.setDesc('Syntax highlighting theme for code blocks.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('github-dark', 'GitHub dark')
					.addOption('github-light', 'GitHub light')
					.addOption('dracula', 'Dracula')
					.addOption('nord', 'Nord')
					.addOption('min-light', 'Min light')
					.addOption('min-dark', 'Min dark')
					.setValue(this.plugin.settings.theme)
					.onChange(async (value) => {
						this.plugin.settings.theme = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName('Posting').setHeading();

		new Setting(containerEl)
			.setName('Default to draft')
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
