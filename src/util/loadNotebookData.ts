import { Notice } from "obsidian";
import { convertTarToPdf, exportImagesFromTar } from "./saveToPdf";
import { processNotebookPages } from "services/OpenRouterService";
import { getAmazonApi, getChunk } from "./getAmazonCookies";

type Metadata = {
    "metadata": { "currentPage": number, "modificationTime": number, "title": string, "totalPages": number },
    "readingSessionId": string, "renderingToken": string
};

function uint8ArrayToRawBase64(uint8Array: Uint8Array): string {
    return Buffer.from(uint8Array).toString('base64');
}

export async function getNotebookData(fileId: string, noteName: string, openRouterKey: string, model: string) {
    const pagesData: ArrayBuffer[] = [];
    
    try {
        const { metadata, renderingToken } = await getAmazonApi(`https://read.amazon.com/openNotebook?notebookId=${fileId}&marketplaceId=ATVPDKIKX0DER`) as Metadata;
        
        new Notice(`Starting fetch for ${metadata.totalPages} pages...`);

        for (let i = 0; i < metadata.totalPages; i += 3) {
            const end = Math.min(i + 2, metadata.totalPages);
            new Notice(`Fetching pages ${i} to ${end}`);
            
            const chunk = await getChunk(`https://read.amazon.com/renderPage?startPage=${i}&endPage=${end}&width=1860&height=2480&dpi=160`, renderingToken);
            pagesData.push(chunk);
        }

        const images = await exportImagesFromTar(pagesData.map(page => page.slice(0)));
        await convertTarToPdf(pagesData, noteName);
        await processNotebookPages([...images].map(image => new Uint8Array(image.data.buffer.slice(0))).map(uint8ArrayToRawBase64), 'scribe notes ai/' + noteName, noteName, openRouterKey, model);
        new Notice(`note ${noteName} converted`)
    } catch (e) {
        console.error("Notebook Data Error:", e);
    }
};