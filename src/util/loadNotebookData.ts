import { App, arrayBufferToBase64, Notice } from "obsidian";
import { convertTarToPdf, exportImagesFromTar } from "./saveToPdf";
import { processNotebookPages } from "services/OpenRouterService";
import { getAmazonApi, getChunk } from "./getAmazonCookies";

type Metadata = {
    "metadata": { "currentPage": number, "modificationTime": number, "title": string, "totalPages": number },
    "readingSessionId": string, "renderingToken": string
};

export async function getNotebookData(app: App, fileId: string, noteName: string, openRouterKey: string, model: string) {
    const pagesData: ArrayBuffer[] = [];
    
    try {
        const { metadata, renderingToken } = await getAmazonApi<Metadata>(`https://read.amazon.com/openNotebook?notebookId=${fileId}&marketplaceId=ATVPDKIKX0DER`);
        
        new Notice(`Starting fetch for ${metadata.totalPages} pages...`);

        for (let i = 0; i < metadata.totalPages; i += 3) {
            const end = Math.min(i + 2, metadata.totalPages);
            new Notice(`Fetching pages ${i} to ${end}`);
            
            const chunk = await getChunk(`https://read.amazon.com/renderPage?startPage=${i}&endPage=${end}&width=1860&height=2480&dpi=160`, renderingToken);
            pagesData.push(chunk);
        }

        const images = await exportImagesFromTar(pagesData.map(page => page.slice(0)));
        await convertTarToPdf(app, pagesData, noteName);
        await processNotebookPages(app, images.map(image => arrayBufferToBase64(image.data.buffer as ArrayBuffer)), 'scribe notes ai/' + noteName, noteName, openRouterKey, model);
        new Notice(`note ${noteName} converted`)
    } catch (e) {
        console.error("Notebook Data Error:", e);
    }
};