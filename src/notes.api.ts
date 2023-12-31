import {config, trim} from "launcher-api";
import {NoteMeta, Notes} from "./types.ts";
import {nanoid} from "nanoid";

export const getNotes = async () => {
    const notes = trim(await config.get("launcher-notes.json"));
    if (notes.length === 0) {
        return {
            noteMetas: {}
        } as Notes;
    }

    return JSON.parse(notes) as Notes;
}

export const addNote = async (note: NoteMeta) => {
    const notes = await getNotes();
    notes.noteMetas[note.id] = note;
    await config.set("launcher-notes.json", JSON.stringify(notes));
}

export const updateNoteContent = async (id: string, content: string) => {
    await config.set(`launcher-notes-${id}.md`, content);
}

export const getNoteContent = async (id: string) => {
    return await config.get(`launcher-notes-${id}.md`);
}

export const newNote = (filename: string) => {
    return {
        id: nanoid(),
        filename,
        editTime: Date.now(),
        createTime: Date.now(),
    } as NoteMeta
}
