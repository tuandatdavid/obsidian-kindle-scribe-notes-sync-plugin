import { Notice } from "obsidian";
import { convertTarToPdf, exportImagesFromTar } from "./saveToPdf";
import { processNotebookPages } from "services/OpenRouterService";

type Metadata = {
    "metadata": { "currentPage": number, "modificationTime": number, "title": string, "totalPages": number },
    "readingSessionId": string, "renderingToken": string
};

const getMetadata = async (fileId: string) => {
    const response = await fetch(`https://read.amazon.com/openNotebook?notebookId=${fileId}&marketplaceId=ATVPDKIKX0DER`, {
        "credentials": "include",
    });
    return JSON.parse(await response.text()) as Metadata;
};

const getPageData = async (renderingToken: string, startPage: number, endPage: number) => {
    const response = await fetch(`https://read.amazon.com/renderPage?startPage=${startPage}&endPage=${endPage}&width=1860&height=2480&dpi=160`, {
        "credentials": "include",
        "headers": {
            "x-amzn-karamel-notebook-rendering-token": renderingToken
        }
    });
    return await response.arrayBuffer();
};

function uint8ArrayToRawBase64(uint8Array: Uint8Array): string {
    return Buffer.from(uint8Array).toString('base64');
}

export async function getNotebookData(fileId: string, noteName: string, fetchCallback: (functionCode: string) => unknown, openRouterKey: string, model: string) {
    const pagesData: ArrayBuffer[] = [];
    
    try {
        const { metadata, renderingToken } = await fetchCallback(`(${getMetadata.toString()})('${fileId}');`) as Metadata;
        
        new Notice(`Starting fetch for ${metadata.totalPages} pages...`);

        for (let i = 0; i < metadata.totalPages; i += 3) {
            const end = Math.min(i + 2, metadata.totalPages);
            new Notice(`Fetching pages ${i} to ${end}`);
            
            const chunk = await fetchCallback(`(${getPageData.toString()})('${renderingToken}', ${i}, ${end});`) as ArrayBuffer;
            pagesData.push(chunk);
        }

        // Now convert everything at once
        console.log("All data fetched. Compiling PDF...");
        const images = await exportImagesFromTar(pagesData.map(page => page.slice(0)));
        await convertTarToPdf(pagesData, noteName);
        await processNotebookPages([...images].map(image => new Uint8Array(image.data.buffer.slice(0))).map(uint8ArrayToRawBase64), 'scribe notes ai/' + noteName, noteName, openRouterKey, model);
        new Notice(`note ${noteName} converted`)

    } catch (e) {
        console.error("Notebook Data Error:", e);
    }
};