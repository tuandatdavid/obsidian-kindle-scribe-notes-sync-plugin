import React from "react";
import { FileData } from "types/Notebook";
import { useNotebook } from "../util/loadNotebookData";
import { JobStatus, useJobs } from "context/JobContext";

const RenderJobProgress = ({ jobStatus }: { jobStatus: JobStatus }) => {
    const remainingPercentage = 100 - jobStatus.completedPercentage;
    return <div>{'+'.repeat(jobStatus.completedPercentage/10)}{'-'.repeat(remainingPercentage/10)}</div>
};

const Note = ({ file }: { file: FileData }) => {
    const { getJobStatus } = useJobs();
    const jobStatus = getJobStatus(file.id);
    const { downloadNotebook } = useNotebook(file.id, file.title);

    return (<div style={{
        display: 'grid', marginLeft: '30px', marginRight: '30px',
        gridTemplateColumns: '1fr auto',
        marginTop: '15px', alignItems: 'center'
    }}>
        {file.title}
        {jobStatus ? <RenderJobProgress jobStatus={jobStatus}/> :
            <button onClick={downloadNotebook}>Download and process note</button>
        }</div>);
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