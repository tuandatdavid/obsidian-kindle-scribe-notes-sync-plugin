import { App, Modal } from "obsidian";
import React, { useEffect, useState } from "react";
import { notesService } from "services/NotesService";
import { FileData } from "types/Notebook";
import { useSettings } from "./SettingsContext";

interface Props {
    app: App;
    modal: Modal;
}

const Note = ({ file }: { file: FileData }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { settings } = useSettings();

    const processNote = (file: FileData) => {
        setIsProcessing(true);
        notesService.downloadNote(file.id, file.title, settings.openRouterKey, settings.model).then(() => {
            setIsProcessing(false);
        }).catch((e) => {
            //TODO: better error handling
            console.error(e);
            setIsProcessing(false);
        });
    }
    return <li>
        <div style={{ display: 'grid', marginRight: '30px', gridTemplateColumns: '1fr auto', marginTop: '15px', alignItems: 'center' }}>
            {file.title}
            {isProcessing ? <div>processing...</div> :
                <button onClick={() => processNote(file)}>Download and process note</button>
            }</div>
    </li>
}

const NotesList = ({ objects }: { objects: FileData[] }) => {
    const renderFolder = (folder: FileData) => {
        return <details>
            <summary>{folder.title}</summary>
            <NotesList objects={folder.items} />
        </details>;
    }
    return <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <ul>
            {objects.map(file => {
                if (file.type == 'folder')
                    return renderFolder(file);
                return <Note file={file} />
            })}
        </ul>
    </div>
};

export const NotesView = ({ app, modal }: Props) => {
    const [notes, setNotes] = useState<FileData[]>();
    useEffect(() => {
        notesService.getNotesData().then(setNotes).catch(() => {
            //TODO: better error handling
            console.error('Failed to retrieve notes, try again.');
        });
    }, []);

    const loadingComponent = <div>Loading...</div>;

    return (
        <div className="file-modal">
            <p>Notes</p>
            {!notes ? loadingComponent : <NotesList objects={notes} />}
            <button onClick={() => modal.close()}>Close Modal</button>
        </div>
    );
};