import {Note} from "../types.ts";
import {Input, Modal} from "antd";
import {useEffect, useRef, useState} from "react";

interface RenameProps {
    open: boolean;
    filename: string
    onOk: (noteId: string, newFilename: string) => Promise<void>
    setOpened: (opened: boolean) => void
    noteId: string
}

export const Rename = ({open, setOpened, noteId, filename, onOk}: RenameProps) => {
    if (!open) {
        return <></>
    }

    const [value, setValue] = useState(filename)
    const inputRef = useRef(null);
    const update = async (filename: string) => {
        if (filename.trim() === "") {
            return
        }
        return onOk(noteId, filename)
    }

    useEffect(() => {
        if (open) {
            inputRef.current?.focus()
        }
    }, [open])

    return <Modal
        title="修改名称"
        open={open}
        forceRender
        zIndex={10000}
        onOk={() => {
            setOpened(false)
            return update(value)
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
                return update(value)
            }}
        />
    </Modal>
}
