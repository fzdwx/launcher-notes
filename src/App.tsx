import {Action, Background, Container, Footer, getActionCommand, assets} from "launcher-api";
import {useEffect, useRef, useState} from "react";
import {useKeyPress, useRequest, useVirtualList} from "ahooks";
import MarkdownIt from 'markdown-it'
import Shikiji from 'markdown-it-shikiji'
import {NotesStore} from "./notes.api.ts";
import {actions, Note, Notes} from "./types.ts";
import {usePointerMovedSinceMount} from "launcher-api/dist/command/utils";
import {NewFile} from "./components/NewFile.tsx";
import {Rename} from "./components/Rename.tsx";
import {attach} from "./lib/mdPlugin.ts";

const Icon = () => {
    return <img className='w-5' src="/logo.svg" alt='logo'/>
}

const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

md.use(await Shikiji({
    themes: {
        light: 'github-light',
        dark: 'github-dark',
    }
}))

md.use(attach)

export default () => {
    const [value, setValue] = useState("");
    const [previewMode, setPreviewMode] = useState(false)
    const [notes, setNotes] = useState<Notes>()
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [currentNotes, setCurrentNotes] = useState<Note[]>([])
    const [activeNoteId, setActiveNoteId] = useState<string>('-1')
    const noteStore = NotesStore.create()

    const togglePreview = () => {
        setPreviewMode(!previewMode)
    }

    const saveNote = async () => {
        if (activeNoteId === "-1") {
            return
        }
        await noteStore.updateNoteContent(activeNoteId, value)
        notes.notes[activeNoteId].editTime = Date.now()
        await noteStore.saveNotes(notes)
    }

    const {run} = useRequest(saveNote, {
        debounceWait: 100,
        manual: false
    });

    const newNote = async () => {
        const note = noteStore.buildStore(new Date().toLocaleDateString("zh-CN"))
        await noteStore.addNote(note)
        await load()
        return note.id
    }

    const load = async () => {
        const notes = await noteStore.getNotes()
        setNotes(notes)
        const notesIds = Object.keys(notes.notes)


        if (notesIds.length === 0) {
            return await newNote();
        } else if (notesIds.length > 0) {
            // const note = notes.notes[notesIds[0]]
            // if (activeNoteId === '-1' && note) {
            //     setActiveNoteId(note.id)
            // }
        }
    }

    useEffect(() => {
        let shouldUploadAssets = false
        assets.config().then((cfg) => {
            if (cfg === 'true') {
                shouldUploadAssets = true
            }
        })

        async function handler(e: ClipboardEvent) {
            if (!shouldUploadAssets) {
                return
            }

            const items = e.clipboardData.items
            const filterItems = Array.from(items).filter((item) => {
                return item.type.indexOf('image') !== -1
            })
            if (filterItems.length === 0) {
                return
            }
            e.preventDefault()
            e.stopPropagation()

            for (const item of filterItems) {
                const f = item.getAsFile()
                const buf = await f.arrayBuffer()
                const base64 = btoa(
                    new Uint8Array(buf)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                const resp = await assets.upload(base64)
                setValue((v) => `${v}\n![${f.name}](${resp.url})`)
            }
        }

        window.addEventListener('paste', handler)

        return () => {
            window.removeEventListener('paste', handler)
        }
    }, []);

    useEffect(() => {
        run()
    }, [value])

    useEffect(() => {
        async function init() {
            await load()
            const action = getActionCommand()
            if (actions.newNote === action) {
                const id = await newNote()
                setActiveNoteId(id)
            }
        }

        init()
    }, [])

    useEffect(() => {
        if (!previewMode) {
            textRef.current?.focus()
        }
    }, [previewMode])

    useEffect(() => {
        if (notes && notes.notes) {
            const currentNotes = Object.keys(notes.notes).map((key) => {
                return notes.notes[key]
            })
            setCurrentNotes(currentNotes.sort((a, b) => {
                return b.editTime - a.editTime
            }))

            if (activeNoteId === '-1' && currentNotes.length > 0) {
                setActiveNoteId(currentNotes[0].id)
            }
        }
    }, [notes]);

    useEffect(() => {
        if (activeNoteId != '-1' && currentNotes.length > 0) {
            noteStore.getNoteContent(activeNoteId).then((content) => {
                setValue(content)
            })
        }
    }, [activeNoteId, currentNotes])

    useKeyPress('ctrl.p', () => {
        togglePreview()
    })


    const [filename, setFilename] = useState<string>('')
    const [newFileModal, setNewFileModal] = useState(false)
    const [renameModal, setRenameModal] = useState(false)

    const [virtualNotes] = useVirtualList(currentNotes, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 60,
        overscan: 10,
    });

    const pointerMoved = usePointerMovedSinceMount();

    return <Container>
        <Background>
            <div className='flex w-full h-[calc(100%-40px)]'>
                <div className='w-30% ml-10px my-10px'>
                    <div ref={containerRef} className='h-full'>
                        <div ref={wrapperRef}>
                            {virtualNotes.map(({data, index}) => {
                                const active = activeNoteId === data.id
                                const notModals = !newFileModal && !renameModal
                                const handlers = typeof data !== "string" && {
                                    onClick: () =>{
                                        pointerMoved &&
                                        notModals &&
                                        activeNoteId !== data.id &&
                                        setActiveNoteId(data.id)
                                        textRef.current?.focus()
                                    },
                                    onDoubleClick: () => {
                                        setActiveNoteId(data.id)
                                        setFilename(data.filename)
                                        setRenameModal(true)
                                    },
                                };

                                return <div
                                    key={data.id}
                                    className={['p-10px cursor-pointer', active ? 'bg-gray500/20' : ''
                                    ].join(" ")}
                                    {...handlers}
                                >
                                    <div className='text-md'>{data.filename}</div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>


                <div autoFocus className='w-[calc(70%)] h-full m-15px overflow-y-scroll'>
                    {
                        previewMode ?
                            <div
                                className='p-10px markdown-body w-full h-[calc(100%-30px)] max-h-[calc(100%-30px)] overflow-y-scroll'
                                dangerouslySetInnerHTML={{__html: md.render(value)}}/>
                            : <></>
                    }

                    <textarea
                        autoFocus
                        ref={textRef}
                        spellCheck={false}
                        className={["p-20px w-full h-[calc(100%-30px)] max-h-[calc(100%-30px)]",
                            previewMode ? "hidden" :
                                "outline-none border-solid rounded-xl resize-none border-dark/30 shadow bg-transparent"].join(" ")}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                        }}/>

                </div>
            </div>

            <div className='h-40px'>
                <Footer
                    current={null}
                    icon={<Icon/>}
                    onSubCommandHide={() => {
                        textRef.current?.focus()
                    }}
                    onSubCommandShow={() => {
                        textRef.current?.blur()
                    }}
                    actions={(_, changeVisible) => [
                        {
                            id: "new-note",
                            name: "New Note",
                            icon: <Icon/>,
                            perform: () => {
                                setFilename("")
                                setNewFileModal(true)
                            }
                        } as Action
                    ]}
                    content={() => <div className='command-open-trigger'>
                        <span className='mr-1' onClick={togglePreview}>Toggle preview</span>
                        <kbd>ctrl</kbd>
                        <kbd>p</kbd>
                    </div>}>
                </Footer>

                <NewFile
                    notesStore={noteStore}
                    afterSave={async (note) => {
                        await load();
                        setActiveNoteId(note.id);
                        textRef.current?.focus();
                        setFilename("")
                    }}
                    filename={filename}
                    open={newFileModal}
                    setOpened={setNewFileModal}
                    title="请输入文件名"
                />

                <Rename
                    filename={filename}
                    open={renameModal}
                    setOpened={setRenameModal}
                    noteId={activeNoteId}
                    onOk={async (noteId, newFilename) => {
                        if (notes.notes[noteId].filename === newFilename) {
                            return
                        }
                        notes.notes[noteId].filename = newFilename
                        await noteStore.saveNotes(notes)
                        await load()
                    }}
                />
            </div>
        </Background>
    </Container>
}
