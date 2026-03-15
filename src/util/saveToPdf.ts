import untar from 'js-untar';
import jsPDF from 'jspdf';
import { TFile, Notice, normalizePath, App } from 'obsidian';

//TODO: move
export const exportImagesFromTar = async (allTarBuffers: ArrayBuffer[]) => { 
    const allImages: { name: string, data: Uint8Array }[] = [];

    // 1. Extract images from all TAR chunks
    for (const buffer of allTarBuffers) {
        const currentImages: { name: string, data: Uint8Array }[] = [];
        const files = await untar(buffer);

        for (const file of files) {
            if (file.name.toLowerCase().endsWith(".png") && !file.name.includes("PaxHeaders")) {
                const uint8View = new Uint8Array(file.buffer);

                // Find PNG signature offset
                let offset = -1;
                for (let i = 0; i < Math.min(uint8View.length, 1024); i++) {
                    if (uint8View[i] === 0x89 && uint8View[i + 1] === 0x50 &&
                        uint8View[i + 2] === 0x4E && uint8View[i + 3] === 0x47) {
                        offset = i;
                        break;
                    }
                }

                if (offset !== -1) {
                    currentImages.push({
                        name: file.name,
                        data: uint8View.slice(offset)
                    });
                }
            }
        }
        currentImages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        allImages.push(...currentImages);
    }

    // 2. Sort ALL images globally (important since chunks might arrive out of order)
    return allImages;
}

export const convertTarToPdf = async (app: App, allTarBuffers: ArrayBuffer[], noteName: string) => {
    try {
        const pdf = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "a4"
        });

        const allImages = await exportImagesFromTar(allTarBuffers);
        if (allImages.length === 0) {
            console.error("No images found in any of the notebook chunks.");
            return;
        }

        // 3. Add all images to the single PDF
        for (let i = 0; i < allImages.length; i++) {
            const image = allImages[i];
            if (!image) continue;
            if (i > 0) pdf.addPage();

            // Add image stretched to fill A4 (210x297mm)
            pdf.addImage(image.data, 'PNG', 0, 0, 210, 297);
        }

        // 4. Save the final result
        void savePdfToVault(app, pdf, 'scribe notes', noteName);

    } catch (error) {
        console.error("Master PDF conversion failed:", error);
    }
};


export async function savePdfToVault(app: App, pdf: jsPDF, folderPath: string, fileName: string) {
    // 1. Get ArrayBuffer directly from jsPDF
    const pdfBuffer: ArrayBuffer = pdf.output("arraybuffer");
    
    // 2. Normalize paths to handle cross-platform slashes
    const dirPath = normalizePath(folderPath);
    const filePath = normalizePath(`${dirPath}/${fileName}.pdf`);

    // 3. Ensure the folder exists
    if (!(await app.vault.adapter.exists(dirPath))) {
        await app.vault.createFolder(dirPath);
    }

    const existingFile = app.vault.getAbstractFileByPath(filePath);

    if (existingFile instanceof TFile) {
        // Update existing binary file
        await app.vault.modifyBinary(existingFile, pdfBuffer);
        new Notice(`Updated PDF: ${existingFile.name}`);
    } else {
        // Create new binary file
        await app.vault.createBinary(filePath, pdfBuffer);
        new Notice(`Saved PDF to: ${filePath}`);
    }
}