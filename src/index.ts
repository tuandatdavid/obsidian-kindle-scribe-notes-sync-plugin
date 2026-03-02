import {App, Modal, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, MyPluginSettings, ScribeSettingsTab} from "./settings";
import { ReactModalWrapper } from 'components/ReactModalWrapper';

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('notebook-pen', 'Kindle Scribe notes convert', async () => {
            new ReactModalWrapper(this.app, { openRouterKey: this.settings.openRouterApiKey, model: this.settings.model }).open();
        });

        this.addSettingTab(new ScribeSettingsTab(this.app, this));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
        // 	new Notice("Click");
        // });

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
        
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}