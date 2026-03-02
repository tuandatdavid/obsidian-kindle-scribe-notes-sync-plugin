import {App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./index";

export interface MyPluginSettings {
	openRouterApiKey: string;
	model: string
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	openRouterApiKey: '',
	model: 'google/gemini-3-flash-preview'
}

export class ScribeSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('OpenRouter API Key')
			.setDesc('Enter your OpenRouter API key. This is stored locally in your vault\'s data.json file.')
			.addText(text => {
				// Mask the input visually
				text.inputEl.type = 'password';

				text.setPlaceholder('sk-or-v1-...')
					.setValue(this.plugin.settings.openRouterApiKey)
					.onChange(async (value) => {
						// Update the setting and save to data.json
						this.plugin.settings.openRouterApiKey = value.trim();
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Enter your chosen Model')
			.addText(text => {
				text.setPlaceholder('google/gemini-3-flash-preview')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						// Update the setting and save to data.json
						this.plugin.settings.model = value.trim();
						await this.plugin.saveSettings();
					});
			});

	}
}
