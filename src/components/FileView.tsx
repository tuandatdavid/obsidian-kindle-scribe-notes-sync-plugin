import { Modal } from "obsidian";
import React, { useState } from "react";
import { notesService } from "services/NotesService";
import { FileData } from "types/Notebook";
import { useSettings } from "./SettingsContext";
import { getNotebookData } from "../util/loadNotebookData";
import { useQuery } from "@tanstack/react-query";
import { amazonLogoutModal } from "../amazonLogin/amazonLogoutModal";

interface Props {
    modal: Modal;
}

const Note = ({ file }: { file: FileData }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { settings, app } = useSettings();

    const processNote = (file: FileData) => {
        setIsProcessing(true);
        getNotebookData(app, file.id, file.title, settings.openRouterKey, settings.model).then(() => {
            setIsProcessing(false);
        }).catch((e) => {
            //TODO: better error handling
            console.error(e);
            setIsProcessing(false);
        });
    }
    return <>
        <div style={{ display: 'grid', marginRight: '30px', gridTemplateColumns: '1fr auto', marginTop: '15px', alignItems: 'center' }}>
            {file.title}
            {isProcessing ? <div>processing...</div> :
                <button onClick={() => processNote(file)}>Download and process note</button>
            }</div>
    </>
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

export const NotesView = ({ modal }: Props) => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notes'],
        queryFn: notesService.getNotesData,
    });


    const loadingComponent = <div>Loading...</div>;

    return (
        <div className="file-modal">
            <p>Notes</p>
            <button onClick={() => {
                void refetch();
            }}>Refetch</button>
            <button onClick={() => {
                void amazonLogoutModal();
            }}>Logout</button>
            {isLoading || !data ? loadingComponent : <NotesList objects={data} />}
            <button onClick={() => modal.close()}>Close Modal</button>
        </div>
    );
};