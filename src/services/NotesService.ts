import { BrowserWindow, remote } from 'electron';
import { FileData } from 'types/Notebook';
import { getNotebookData } from '../util/loadNotebookData';

const { BrowserWindow: RemoteBrowserWindow } = remote;


    const getNotesFetch = async () => {
        const response = await fetch("https://read.amazon.com/kindle-notebook/api/notes", {
            "credentials": "include"
        });
        return JSON.parse(await response.text()).itemsList;
    };


class NotesService {
    private modal: BrowserWindow;
    private isReady = false;
    constructor() {
        const modal = new RemoteBrowserWindow({
            width: 450,
            height: 730,
            show: false,
        });

        modal.once('ready-to-show', async () => {
            setTimeout(async () => {
                this.isReady = true;
            }, 1500);
        });
        this.modal = modal;
        this.load();
    }

    private async load() {
        await this.modal.loadURL('https://read.amazon.com/kindle-notebook?ref_=neo_mm_yn_na_kfa',
            { userAgent: 'Mozilla/5.0 (Linux; Android 15.0.0 r12; Z832 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.53 Mobile Safari/537.36' });
    }

    async getNotesData(): Promise<FileData[]> {
        while (!this.isReady) {
            continue
        }
        const result = await this.modal.webContents.executeJavaScript(`(${getNotesFetch.toString()})();`);
        return result;
    }

    async downloadNote(fileId: string, name: string, key: string, model: string) {
        await getNotebookData(fileId, name, async (code) => await this.modal.webContents.executeJavaScript(code), key, model);
    }
}

export const notesService = new NotesService();