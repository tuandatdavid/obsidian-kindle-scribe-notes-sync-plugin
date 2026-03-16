import { Modal } from "obsidian";
import React, { useState } from "react";
import { notesService } from "services/NotesService";
import { FileData } from "types/Notebook";
import { useSettings } from "./SettingsContext";
import { getNotebookData } from "../util/loadNotebookData";
import { useQuery } from "@tanstack/react-query";
import { amazonLogoutModal } from "../amazonLogin/amazonLogoutModal";
import { LoaderCircle, RefreshCcwDot } from "lucide-react";
import { LoadingComponent } from './LoadingComponent';
import './rotate.css';

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
        <div style={{ display: 'grid', marginLeft: '30px', marginRight: '30px', gridTemplateColumns: '1fr auto', marginTop: '15px', alignItems: 'center' }}>
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
    return <div>
            {objects.map(file => {
                if (file.type == 'folder')
                    return renderFolder(file);
                return <Note file={file} />
            })}
    </div>
};

export const NotesView = ({ modal }: Props) => {
    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['notes'],
        queryFn: notesService.getNotesData,
    });

    const contentLoading = !data || isLoading || isRefetching;

    return (
        <div className="file-modal">
            <div style={{ display: 'grid', gap: '15px', justifyContent: 'end', paddingBottom: '15px', gridAutoFlow: 'column' }}>
                <button disabled={contentLoading} onClick={() => {
                    void refetch();
                }}>{contentLoading? <LoaderCircle className="rotate" /> : <RefreshCcwDot />}</button>
                <button onClick={() => {
                    void amazonLogoutModal();
                }}>Logout from Amazon</button>
            </div>
            <div className="notes-content">
            {contentLoading ? <LoadingComponent /> : <NotesList objects={data} />}    
            </div>
        </div>
    );
};