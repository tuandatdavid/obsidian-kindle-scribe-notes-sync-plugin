import React, { useEffect, useState } from "react";
import { FileData } from "types/Notebook";
import { useNotebook } from "../util/loadNotebookData";
import { jobManager } from "pool";
import { Bot, Download } from "lucide-react";
import { useSettings } from "context/SettingsContext";
import { Tooltip } from "react-tooltip";

const RenderJobProgress = ({ percentage }: { percentage: number }) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return (
        <div style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
            {'█'.repeat(filled)}{'░'.repeat(empty)} {percentage}%
        </div>
    );
};


const Note = ({ file }: { file: FileData }) => {
    const [, setTick] = useState(0);
    useEffect(() => {
        const unsub = jobManager.subscribe(() => setTick(t => t + 1));
        return () => { unsub(); };
    }, []);

    const { settings } = useSettings();

    const dlJob = jobManager.jobs.get(`${file.id}-dl`);
    const procJob = jobManager.jobs.get(`${file.id}-proc`);
    const activeJob = (dlJob && dlJob.status !== 'completed' && dlJob.status !== 'failed') ? dlJob
        : (procJob && procJob.status !== 'completed' && procJob.status !== 'failed') ? procJob
        : null;
    const { downloadOnly, downloadAndProcess } = useNotebook(file.id, file.title);

    return (<div className="file-row">
        {file.title}
        {!settings.openRouterKey && <Tooltip id="ai-download-tooltip" place="top">No OpenRouter API key configured. Go to Settings → Kindle Scribe Notes to add one.</Tooltip>}
        {activeJob
            ? <RenderJobProgress percentage={activeJob.progress} />
            : <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={downloadOnly}><Download /></button>
                or
                <button disabled={!settings.openRouterKey} onClick={downloadAndProcess} data-tooltip-id="ai-download-tooltip"><Download /> + <Bot /></button>
            </div>
        }
    </div>);
}

export const NotesList = ({ objects }: { objects: FileData[] }) => {
    const renderFolder = (folder: FileData) => {
        return <details className="file-row" style={{ marginRight: 0}}>
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