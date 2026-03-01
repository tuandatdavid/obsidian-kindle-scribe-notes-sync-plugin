import { App } from "obsidian";
import React, { useEffect, useState } from "react";
import { notesService } from "services/NotesService";
import { FileData } from "types/Notebook";
import { getNotebookData } from "util/loadNotebookData";
import { useSettings } from "./SettingsContext";

interface Props {
    app: App;
    modal: any;
}

const NotesList = ({ objects }: { objects: FileData[] }) => {
    const { settings } = useSettings();
    const [isProcessing, setIsProcessing] = useState();
    const renderFile = (file: FileData) => {
        return <li>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
                {file.title}
                {isProcessing ? <div>processing...</div> :
                    <button onClick={() => notesService.downloadNote(file.id, file.title, settings.openRouterKey, settings.model)}>Download and process note</button>
                }</div>
        </li>
    }

    const renderFolder = (folder: FileData) => {
        return <details>
            <summary>{folder.title}</summary>
            <NotesList objects={folder.items} />
        </details>;
    }
    return <div>
        <ul>
            {objects.map(file => {
                if(file.type == 'folder')
                    return renderFolder(file);
                return renderFile(file);
            })}
        </ul>
    </div>
};

export const NotesView = ({ app, modal }: Props) => {
    const [notes, setNotes] = useState<FileData[]>();
    useEffect(() => {
        (async () => setNotes(await notesService.getNotesData()))();
    }, []);

    const loadingComponent = <div>Loading...</div>;

    return (
        <div style={{ maxHeight: '500px' }} className="file-modal">
            <h1>Kindle Notes list</h1>
            <p>Notes</p>
            {!notes ? loadingComponent : <NotesList objects={notes} />}
            <button onClick={() => modal.close()}>Close Modal</button>
        </div>
    );
};