import { remote } from "electron";
import { requestUrl, RequestUrlResponse, RequestUrlResponsePromise } from "obsidian";

export const getAmazonCookies = async (): Promise<string> => {
    const ses = remote.session.defaultSession;

    // Get cookies for amazon.com
    const cookies = await ses.cookies.get({ domain: '.amazon.com' });

    // Map them into a string format you can use in your headers
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
};

export const getChunk = async (endpointUrl: string, renderingToken: string) => {
    const result = await requestUrl({
        url: endpointUrl,
        headers: {
            Cookie: await getAmazonCookies(),
            "x-amzn-karamel-notebook-rendering-token": renderingToken
        }
    })
    return result.arrayBuffer;
};

export const getAmazonApi = async (endpointUrl: string, headers?: object) => {
    const result = await requestUrl({
        url: endpointUrl,
        headers: {
            Cookie: await getAmazonCookies(),
            ...headers
        }
    })
    return await result.json;
};