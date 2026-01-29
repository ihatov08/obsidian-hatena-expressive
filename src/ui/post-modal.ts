import { App, Modal, Setting } from 'obsidian';
import type { PostOptions } from '../types';

export class PostModal extends Modal {
	private title: string;
	private categories: string[];
	private isDraft: boolean;
	private isUpdate: boolean;
	private onConfirm: (options: PostOptions) => Promise<void>;

	constructor(
		app: App,
		options: {
			title: string;
			categories: string[];
			isDraft: boolean;
			isUpdate: boolean;
			onConfirm: (options: PostOptions) => Promise<void>;
		}
	) {
		super(app);
		this.title = options.title;
		this.categories = options.categories;
		this.isDraft = options.isDraft;
		this.isUpdate = options.isUpdate;
		this.onConfirm = options.onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', {
			text: this.isUpdate ? 'Update Post' : 'Post to Hatena Blog',
		});

		new Setting(contentEl)
			.setName('Title')
			.setDesc('The title of your blog post')
			.addText((text) =>
				text
					.setValue(this.title)
					.onChange((value) => {
						this.title = value;
					})
			);

		new Setting(contentEl)
			.setName('Categories')
			.setDesc('Comma-separated list of categories')
			.addText((text) =>
				text
					.setValue(this.categories.join(', '))
					.onChange((value) => {
						this.categories = value
							.split(',')
							.map((c) => c.trim())
							.filter((c) => c.length > 0);
					})
			);

		new Setting(contentEl)
			.setName('Post as Draft')
			.setDesc('Save as draft instead of publishing')
			.addToggle((toggle) =>
				toggle.setValue(this.isDraft).onChange((value) => {
					this.isDraft = value;
				})
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText(this.isUpdate ? 'Update' : 'Post')
					.setCta()
					.onClick(async () => {
						this.close();
						await this.onConfirm({
							title: this.title,
							categories: this.categories,
							isDraft: this.isDraft,
						});
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
