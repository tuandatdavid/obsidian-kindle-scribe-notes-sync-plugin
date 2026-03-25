import React from "react";
import { doAmazonLogin } from "amazonLogin/doAmazonLogin";

export const NoCookiesView = () => {
    return (
        <div className="error-text">
            <p><b>No Amazon cookies detected.</b></p>
            <p>
                You need to be logged in to Amazon to access your Kindle Scribe notes.<br />
                Click the button below to log in:
            </p>
            <button onClick={() => void doAmazonLogin()}>Login to Amazon</button>
        </div>
    );
};