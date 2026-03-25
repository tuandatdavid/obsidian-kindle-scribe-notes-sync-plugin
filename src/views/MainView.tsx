import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { doAmazonLogin } from "amazonLogin/doAmazonLogin";
import { amazonLogoutModal } from "amazonLogin/amazonLogoutModal";
import { NotesList } from "components/FileView";
import { LoadingComponent } from "components/LoadingComponent";
import { LoaderCircle, RefreshCcwDot } from "lucide-react";
import React, { useState } from "react";
import { notesService } from "services/NotesService";
import { FileData } from "types/Notebook";
import { noAmazonCookies } from "util/amazonApiUtils";
import { NoCookiesView } from './NoCookiesView';

type RefetchFn = () => Promise<QueryObserverResult<FileData[], Error>>;

const NotesError = ({ refetch }: { refetch: RefetchFn }) => {
    return <div className="error-text">
        <p>Failed to fetch notes. </p>
        <p>Probably caused by <b>outdated/non-existing</b> Amazon cookies.<br />
            Try to login with this button:
        </p>
        <button onClick={() => void doAmazonLogin().then(login => login && refetch())}>Login to Amazon</button>
        <code style={{ paddingTop: '15px' }}>If that doesn't work - try <b>Logging out and then logging in</b>.</code>
    </div>;
};

const NotesControls = ({ contentLoading, refetch, setIsLoggedOut }: { contentLoading: boolean, refetch: RefetchFn, setIsLoggedOut: () => void }) => {
    return <div style={{ display: 'grid', gap: '15px', justifyContent: 'end', paddingBottom: '15px', gridAutoFlow: 'column' }}>
        <button disabled={contentLoading} onClick={() => {
            void refetch();
        }}>{contentLoading ? <LoaderCircle className="rotate" /> : <RefreshCcwDot />}</button>
        <button onClick={() => {
            void amazonLogoutModal().then(logout => logout && setIsLoggedOut())
        }}>Logout from Amazon</button>
    </div>;
};

export const MainView = () => {
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const { data, isLoading, isRefetching, refetch, error } = useQuery({
        queryKey: ['notes'],
        queryFn: notesService.getNotesData,
        enabled: !isLoggedOut,
    });

    const contentLoading = !data || isLoading || isRefetching;

    return (
        <div className="file-modal">
            <NotesControls
                contentLoading={contentLoading}
                setIsLoggedOut={() => setIsLoggedOut(true)}
                refetch={refetch} />
            <div className="notes-content">
                {noAmazonCookies().then(() => <NoCookiesView />)}
                {error ? <NotesError refetch={refetch} /> : contentLoading ? <LoadingComponent /> : <NotesList objects={data} />}
            </div>
        </div>
    );
};