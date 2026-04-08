import {App, PluginSettingTab, Setting } from "obsidian";
import KindleScribeNotesPlugin from "./index";

export interface ScribeNotesSettings {
	mistralApiKey: string;
	model: string
}

export const DEFAULT_SETTINGS: ScribeNotesSettings = {
	mistralApiKey: '',
	model: 'mistral-small-latest'
}

export class ScribeSettingsTab extends PluginSettingTab {
	plugin: KindleScribeNotesPlugin;

	constructor(app: App, plugin: KindleScribeNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Mistral API key')
			.setDesc('Enter your Mistral API key. This is going to be stored in data.json file.')
			.addText(text => {
				text.inputEl.type = 'password';

				//eslint-disable-next-line obsidianmd/ui/sentence-case
				text.setPlaceholder('...')
					.setValue(this.plugin.settings.mistralApiKey)
					.onChange(async (value) => {
						// Update the setting and save to data.json
						this.plugin.settings.mistralApiKey = value.trim();
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Enter your chosen model')
			.addText(text => {
				//eslint-disable-next-line obsidianmd/ui/sentence-case
				text.setPlaceholder('mistral-small-latest')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						// Update the setting and save to data.json
						this.plugin.settings.model = value.trim();
						await this.plugin.saveSettings();
					});
			});

	}
}
