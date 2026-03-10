import { App, Modal } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { NotesView } from "./FileView";
import { SettingsProvider } from "./SettingsContext";

export class ReactModalWrapper extends Modal {
    root: Root | null = null;
    private settings: { openRouterKey: string, model: string };

    constructor(app: App, settings: { openRouterKey: string, model: string } ) {
        super(app);
        this.settings = settings;
    }

    onOpen() {
        const { contentEl } = this;

        // 1. Initialize the React root on the modal's content element
        this.root = createRoot(contentEl);
        this.setTitle('Kindle notes list');
        // 2. Render your component
        // Tip: Pass 'this.app' so your React components can access the Vault API
        this.root.render(
            <React.StrictMode>
                <SettingsProvider settings={this.settings}>
                    <NotesView app={this.app} modal={this} />
                </SettingsProvider>
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
        this.root = null;
        
        this.contentEl.empty();
    }
}