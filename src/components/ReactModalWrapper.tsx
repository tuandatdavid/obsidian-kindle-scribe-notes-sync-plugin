import { App, Modal } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { NotesView } from "./FileView";
import { SettingsProvider } from "./SettingsContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../util/queryClient";

export class ReactModalWrapper extends Modal {
    root: Root | null = null;
    private settings: { openRouterKey: string, model: string };

    constructor(app: App, settings: { openRouterKey: string, model: string } ) {
        super(app);
        this.settings = settings;
    }

    onOpen() {
        const { contentEl } = this;

        this.root = createRoot(contentEl);
        this.setTitle('Kindle notes list');
        this.root.render(
            <React.StrictMode>
                <SettingsProvider settings={this.settings} app={this.app}>
                    <QueryClientProvider client={queryClient}>
                        <NotesView modal={this} />
                    </QueryClientProvider>
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