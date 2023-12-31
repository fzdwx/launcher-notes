import {Background, Container, Footer} from "launcher-api";
import {useEffect, useRef, useState} from "react";
import {useKeyPress, useVirtualList} from "ahooks";
import MarkdownIt from 'markdown-it'
import Shikiji from 'markdown-it-shikiji'
import {addNote, getNotes, newNote} from "./notes.api.ts";
import {Note, Notes} from "./types.ts";
import {usePointerMovedSinceMount} from "launcher-api/dist/command/utils";

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

export default () => {
    const [value, setValue] = useState("");
    const [previewMode, setPreviewMode] = useState(false)
    const [notes, setNotes] = useState<Notes>()
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [currentNotes, setCurrentNotes] = useState<Note[]>([])
    const [activeIndex, setActiveIndex] = useState<number>(-1)

    const togglePreview = () => {
        setPreviewMode(!previewMode)
    }

    const load = async () => {
        const notes = await getNotes()
        setNotes(notes)
        if (notes && notes.notes) {
            const note = Object.keys(notes.notes)[0]
            setActiveIndex(0)
        }
    }

    useEffect(() => {
        load()
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
            setCurrentNotes(currentNotes)
        }
    }, [notes]);

    useEffect(() => {
        if (activeIndex >= 0 && currentNotes.length > 0) {
            setValue(currentNotes[activeIndex].content)
        }
    }, [activeIndex, currentNotes])

    useKeyPress('ctrl.p', () => {
        togglePreview()
    })

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
                                const active = activeIndex === index
                                const handlers = typeof data !== "string" && {
                                    onPointerMove: () =>
                                        pointerMoved &&
                                        activeIndex !== index &&
                                        setActiveIndex(index),
                                    onPointerDown: () => setActiveIndex(index),
                                    onClick: () => setActiveIndex(index),
                                };

                                return <div
                                    key={data.id}
                                    className={['p-10px cursor-pointer', active ? 'bg-gray500/20' : ''
                                    ].join(" ")}
                                    {...handlers}
                                >
                                    <div className='text-md'>{data.filename} {index}</div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>


                <div autoFocus className='w-[calc(70%)] h-full m-15px overflow-y-scroll'>
                    {
                        previewMode ?
                            <div
                                className='p-10px markdown-body w-full h-[calc(100%-30px)] max-h-[calc(100%-30px)]'
                                dangerouslySetInnerHTML={{__html: md.render(value)}}/>
                            : <></>
                    }

                    <textarea
                        autoFocus
                        ref={textRef}
                        spellCheck={false}
                        className={["p-20px w-full h-[calc(100%-30px)] max-h-[calc(100%-30px)]",
                            previewMode ? "invisible" :
                                "outline-none border-solid rounded-xl resize-none border-dark/30 shadow bg-transparent"].join(" ")}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                        }}/>

                </div>
            </div>


            <div className='h-40px'>
                <Footer
                    current={""}
                    icon={<Icon/>}
                    onSubCommandHide={() => {
                        textRef.current?.focus()
                    }}
                    onSubCommandShow={() => {
                        textRef.current?.blur()
                    }}
                    actions={() => []}
                    content={() => <div className='command-open-trigger'>
                        <span className='mr-1' onClick={togglePreview}>Toggle preview</span>
                        <kbd>ctrl</kbd>
                        <kbd>p</kbd>
                    </div>}>

                </Footer>
            </div>
        </Background>
    </Container>
}
