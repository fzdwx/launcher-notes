import {config, trim} from "launcher-api";
import {Note, Notes} from "./types.ts";
import {nanoid} from "nanoid";

export const getNotes = async () => {
    const notes = trim(await config.get("launcher-notes.json"));
    if (notes.length === 0) {
        return {
            notes: new Map()
        } as Notes;
    }

    return JSON.parse(notes) as Notes;
}

export const addNote = async (note: Note) => {
    const notes = await getNotes();
    notes.notes[note.id] = note;
    await config.set("launcher-notes.json", JSON.stringify(notes));
}

export const newNote = (filename: string, content?: string) => {
    return {
        id: nanoid(),
        filename,
        content: content || "",
        editTime: Date.now(),
        createTime: Date.now(),
    } as Note
}
