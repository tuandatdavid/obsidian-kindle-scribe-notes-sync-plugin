import { App, arrayBufferToBase64, Notice } from "obsidian";
import { convertTarToPdf, exportImagesFromTar } from "./saveToPdf";
import { processNotebookPages } from "services/OpenRouterService";
import { getAmazonApi, getChunk } from "./amazonApiUtils";
import { JobType, useJobs } from "context/JobContext";
import { useSettings } from "context/SettingsContext";
import { useCallback } from "react";

type Metadata = {
    "metadata": { "currentPage": number, "modificationTime": number, "title": string, "totalPages": number },
    "readingSessionId": string, "renderingToken": string
};

type UseNotebook = {
    downloadNotebook: () => void
};
export const useNotebook = (fileId: string, noteName: string): UseNotebook => {
    const { updateJobStatus, addJob, finishJob } = useJobs();
    const { app, settings } = useSettings();

    const downloadNotebook = useCallback(async () => {
        updateJobStatus(fileId, { jobType: JobType.AI, completedPercentage: 0 });
        const { openRouterKey, model } = settings;
        const pagesData: ArrayBuffer[] = [];
        
        const { metadata, renderingToken } = await getAmazonApi<Metadata>(`https://read.amazon.com/openNotebook?notebookId=${fileId}&marketplaceId=ATVPDKIKX0DER`);
        new Notice(`Starting fetch for ${metadata.totalPages} pages...`);

        for (let i = 0; i < metadata.totalPages; i += 3) {
            const end = Math.min(i + 2, metadata.totalPages);
            updateJobStatus(fileId, { jobType: JobType.AI, completedPercentage: end / metadata.totalPages / 100 / 2 });
            new Notice(`Fetching pages ${i + 1}-${end} out of ${metadata.totalPages}`);

            const chunk = await getChunk(`https://read.amazon.com/renderPage?startPage=${i}&endPage=${end}&width=1860&height=2480&dpi=160`, renderingToken);
            pagesData.push(chunk);
        }

        const images = await exportImagesFromTar(pagesData.map(page => page.slice(0)));
        updateJobStatus(fileId, { jobType: JobType.AI, completedPercentage: 50 });
        await convertTarToPdf(app, pagesData, noteName);
        updateJobStatus(fileId, { jobType: JobType.AI, completedPercentage: 100 });
        
        await processNotebookPages(app, images.map(image => arrayBufferToBase64(image.data.buffer as ArrayBuffer)), 'scribe notes ai/' + noteName, noteName, openRouterKey, model);
        new Notice(`note ${noteName} converted`)
        finishJob(fileId, JobType.AI);
    }, [settings, updateJobStatus]);

    const scheduleNotebook = () => addJob({ job: fileId, jobFn: downloadNotebook, jobStatus: { jobType: JobType.AI, completedPercentage: 0 } });

    return { downloadNotebook: scheduleNotebook };
}

export async function getNotebookData(app: App, fileId: string, noteName: string, openRouterKey: string, model: string) {
    const pagesData: ArrayBuffer[] = [];

    try {
        const { metadata, renderingToken } = await getAmazonApi<Metadata>(`https://read.amazon.com/openNotebook?notebookId=${fileId}&marketplaceId=ATVPDKIKX0DER`);
        
        new Notice(`Starting fetch for ${metadata.totalPages} pages...`);

        for (let i = 0; i < metadata.totalPages; i += 3) {
            const end = Math.min(i + 2, metadata.totalPages);
            new Notice(`Fetching pages ${i + 1}-${end} out of ${metadata.totalPages}`);

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