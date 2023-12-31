import {Button, Input, Modal, Space} from 'antd';
import {useEffect, useMemo, useRef, useState} from "react";
import {NotesStore} from "../notes.api.ts";
import {Note} from "../types.ts";

interface NewFileProps {
    open: boolean;
    notesStore: NotesStore
    filename: string
    afterSave: (note: Note) => Promise<void>
    setOpened: (opened: boolean) => void
    title?: string;
}

export const NewFile = ({open, title, notesStore, filename, afterSave, setOpened}: NewFileProps) => {
    if (!open) {
        return <></>
    }

    const currentTitle = useMemo(() => {
        return title ?? "输入文件名"
    }, [title])
    const [value, setValue] = useState(filename)
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus()
        }
    }, [open])

    const add = async (filename: string) => {
        if (filename.trim() === "") {
            return
        }
        setValue("")
        const note = notesStore.buildStore(filename)
        await notesStore.addNote(note)
        if (afterSave) {
            return afterSave(note)
        }
    }

    return <Modal
        title={currentTitle}
        open={open}
        forceRender
        zIndex={10000}
        onOk={() => {
            setOpened(false)
            return add(value)
        }}
        onCancel={() => {
            return setOpened(false)
        }}
    >
        <Input
            value={value}
            ref={inputRef}
            autoFocus
            onChange={(e) => {
                setValue(e.target.value)
            }}
            onPressEnter={() => {
                setOpened(false)
                return add(value)
            }}
        />
    </Modal>
}
