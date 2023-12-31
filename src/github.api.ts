import {File, Gist} from "./types.ts";

export interface FetchGistParams {
    token: string;
    per_page?: number;
    page?: number;
}

const getToken = (token: string) => {
    return token.replace('"', '').replace('"', '')
}
export const fetchGist = async ({token, page, per_page}: FetchGistParams) => {
    const resp = await fetch(`https://api.github.com/gists?per_page=${per_page ?? 10}&page=${page ?? 1}`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${getToken(token)}`
        },
        method: "GET",
    })
    return await resp.json() as Gist[]
}

export const fetchContent = async ({token, gist_id, filename}: {
    token: string,
    gist_id: string,
    filename: string
}) => {
    const resp = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${getToken(token)}`
        },
        method: "GET",
    })
    const gist = await resp.json() as Gist;
    let content = ""
    Object.entries(gist.files).forEach(([key, value]) => {
        if (key === filename) {
            content = value.content
        }
    })
    return content
}

export interface SaveGistParams {
    token: string;
    gist_id: string;
    description: string;
    files: { [key: string]: { content: string } };
}

export const updateGist = async ({token, gist_id, description, files}: SaveGistParams) => {
    const resp = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${getToken(token)}`
        },
        body: JSON.stringify({
            description,
            files
        }),
        method: "PATCH",
    })
    return await resp.json() as Gist
}
