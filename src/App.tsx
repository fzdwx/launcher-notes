import {Background, Container, Footer} from "launcher-api";

const Icon = () => {
    return <img className='w-5' src="/logo.svg" alt='logo'/>
}

export default () => {
    return <Container>
        <Background>
            <div className='flex w-full h-[calc(100%-40px)]'>
                <div className='bg-red w-30% pr-10px'>
                    left
                </div>
                <div className='w-[calc(70%)] h-full m-15px overflow-y-scroll'>
                    <textarea autoFocus className='p-20px w-full h-[calc(100%-30px)]  max-h-[calc(100%-30px)] bg-blue'>

                    </textarea>
                </div>
            </div>
            <div className='h-40px'>
                <Footer current={null} icon={<Icon/>} actions={() => []} content={() => <div>123123</div>}>

                </Footer>
            </div>
        </Background>
    </Container>
}
