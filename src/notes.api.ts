import {config, trim} from "launcher-api";
import {Note, Notes} from "./types.ts";
import {nanoid} from "nanoid";

interface Store {
    read: (key: string) => Promise<string>,
    write: (key: string, value: string) => Promise<void>
}

export class NotesStore {

    constructor(private store: Store) {
        this.store = store
    }

    public static create = () => {
        return new NotesStore({
            read: config.get,
            write: config.set
        })
    }

    getNotes = async () => {
        const notes = trim(await this.store.read("launcher-notes.json"));
        if (notes.length === 0) {
            return {
                notes: {}
            } as Notes;
        }

        return JSON.parse(notes) as Notes;
    }

    saveNotes = async (notes: Notes) => {
        await this.store.write("launcher-notes.json", JSON.stringify(notes));
    }

    addNote = async (note: Note) => {
        const notes = await this.getNotes();
        notes.notes[note.id] = note;
        await this.store.write("launcher-notes.json", JSON.stringify(notes));
    }

    updateNoteContent = async (id: string, content: string) => {
        await this.store.write(`launcher-notes-${id}.md`, content);
    }

    getNoteContent = async (id: string) => {
        return await this.store.read(`launcher-notes-${id}.md`);
    }

    buildStore = (filename: string) => {
        return {
            id: nanoid(),
            filename,
            editTime: Date.now(),
            createTime: Date.now(),
        } as Note
    }
}

export type {Store};


