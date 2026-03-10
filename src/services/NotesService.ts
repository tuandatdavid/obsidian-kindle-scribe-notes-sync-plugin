import { BrowserWindow, remote } from 'electron';
import { FileData } from 'types/Notebook';
import AmazonLoginModal from 'amazonLogin/amazonLoginModal';
import { getAmazonApi } from '../util/getAmazonCookies';

const { BrowserWindow: RemoteBrowserWindow } = remote;



class NotesService {
    private modal: BrowserWindow;
    private isReady = false;
    constructor() {
        const modal = new RemoteBrowserWindow({
            width: 450,
            height: 730,
            show: false,
        });

        modal.once('ready-to-show', () => {
            setTimeout(() => {
                this.isReady = true;
            }, 1500);
        });
        this.modal = modal;
        this.load();
    }

    private load() {
        void this.modal.loadURL('https://read.amazon.com/kindle-notebook?ref_=neo_mm_yn_na_kfa',
            { userAgent: 'Mozilla/5.0 (Linux; Android 15.0.0 r12; Z832 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.53 Mobile Safari/537.36' });
    }

    async getNotesData(): Promise<FileData[]> {
        if(!this.isReady) {
            await new AmazonLoginModal().doLogin();
        }
        const result = await getAmazonApi<{ itemsList: FileData[] }>('https://read.amazon.com/kindle-notebook/api/notes');
        return result.itemsList;
    }
}

export const notesService = new NotesService();