import {Background, Container, Footer} from "launcher-api";
import {useEffect, useRef, useState} from "react";
import {useKeyPress} from "ahooks";
import MarkdownIt from 'markdown-it'
import Shikiji from 'markdown-it-shikiji'

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
    const [value, setValue] = useState(`# Hello World
\`\`\`js {1,3-4}
console.log('line1') // highlighted
console.log('line2')
console.log('line3') // highlighted
console.log('line4') // highlighted
\`\`\``);
    const [previewMode, setPreviewMode] = useState(false)
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const togglePreview = () => {
        setPreviewMode(!previewMode)
    }

    useEffect(() => {
        if (!previewMode) {
            textRef.current?.focus()
        }
    }, [previewMode])

    useKeyPress('ctrl.p', () => {
        togglePreview()
    })

    return <Container>
        <Background>
            <div className='flex w-full h-[calc(100%-40px)]'>
                <div className='bg-red w-30% pr-10px'>
                    left
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
