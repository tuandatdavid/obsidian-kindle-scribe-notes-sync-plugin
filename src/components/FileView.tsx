import React, { useEffect, useState } from "react";
import { FileData } from "types/Notebook";
import { useNotebook } from "../util/loadNotebookData";
import { jobManager } from "pool";

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
    // Re-render whenever the jobManager broadcasts an update.
    const [, setTick] = useState(0);
    useEffect(() => {
        const unsub = jobManager.subscribe(() => setTick(t => t + 1));
        return () => { unsub(); };
    }, []);

    const job = jobManager.jobs.get(file.id);
    const isActive = job && job.status !== 'completed' && job.status !== 'failed';
    const { downloadNotebook } = useNotebook(file.id, file.title);

    return (<div style={{
        display: 'grid', marginLeft: '30px', marginRight: '30px',
        gridTemplateColumns: '1fr auto',
        marginTop: '15px', alignItems: 'center'
    }}>
        {file.title}
        {isActive
            ? <RenderJobProgress percentage={job.progress} />
            : <button onClick={downloadNotebook}>Download and process note</button>
        }
    </div>);
}

export const NotesList = ({ objects }: { objects: FileData[] }) => {
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