import {Component, createEffect, createResource, createSignal, Show} from 'solid-js'
import {ApiEvent} from '../ApiEvent'

type ParsedEvents = {
    type: 'youtube-iframe-api-mitm-events',
    version: string,
    events: ApiEvent[]
}

const initialVideoValue = 'https://www.youtube.com/watch?v=bHQqvYy5KYo'

function getVideoID(urlOrID: string): string {
    try {
        const url = new URL(urlOrID)
        return url.searchParams.get('v') ?? url.pathname.split('/').pop() ?? (() => {throw new Error('Invalid URL')})()
    } catch(_ignored) {
        if(urlOrID.length > 11) {
            throw new Error('provided string is not a youtube video URL and is too long to be a video ID')
        }
        return urlOrID
    }
}

async function readFile(file: File | undefined): Promise<ParsedEvents | undefined> {
    if(file === undefined) {
        return undefined
    }
    const data = JSON.parse(await file.text())
    if(data.type !== 'youtube-iframe-api-mitm-events') {
        throw new Error('Invalid file type')
    }
    return data
}

export type HomeProps = {
    onUpload: (events: ApiEvent[]) => void
    onVideoID: (videoID: string) => void
}

const Home: Component<HomeProps> = (props) => {
    let hiddenInput: HTMLInputElement
    const [videoValue, setVideoValue] = createSignal(initialVideoValue)
    const [videoInputError, setVideoInputError] = createSignal<string | undefined>(undefined)

    const [file, setFile] = createSignal<File | undefined>(undefined)
    const [parsedData] = createResource(file, readFile)

    createEffect(() => {
        const parsed = parsedData()
        if(parsed !== undefined) {
            props.onUpload(parsed.events)
        }
    })

    const onBeginClick = () => {
        setVideoInputError(undefined)
        try {
            props.onVideoID(getVideoID(videoValue()))
        } catch(e) {
            setVideoInputError(e.message)
        }
    }

    const onChanged = (event: Event) => {
        setFile((event.target as HTMLInputElement).files[0])
    }

    return (
        <div class="hero mt-20 bg-base-200">
            <div class="hero-content text-center">
                <div class="max-w-2xl">
                    <h1 class="text-5xl font-bold">YouTube Iframe Player API MITM</h1>
                    <p class="py-6 text-xl">
                        This is a tool to record messages sent and received by the YouTube Iframe Player API.
                        <br/>
                        The goal of this is to develop an understanding of how the API works and to help with reverse engineering to create a custom implementation.
                    </p>

                    <div class="outline outline-2 rounded-3xl p-7">
                        <div class="space-y-2">
                            <p class="text-lg">Record API events from interacting with a video</p>
                            <form onSubmit={e => {e.preventDefault(); onBeginClick()}}>
                                <div class="join">
                                    <input
                                        class="input input-bordered join-item w-[25rem]"
                                        value={videoValue()}
                                        onInput={e => setVideoValue(e.target.value)}
                                    />
                                    <button class="btn btn-primary join-item">Begin</button>
                                </div>
                            </form>
                            <Show when={videoInputError()}>
                                <div class="alert alert-error text-center font-semibold">
                                    {videoInputError()}
                                </div>
                            </Show>
                        </div>

                        <div class="divider">Or</div>

                        <div class="space-y-2">
                            <p class="text-lg">Upload a previously-recorded events file</p>
                            <input type="file" accept=".json" ref={hiddenInput} onChange={onChanged} class="hidden"/>
                            <button class="btn btn-primary" classList={{loading: parsedData.loading}} onClick={() => hiddenInput.click()}>Click to Upload</button>

                            <Show when={parsedData.state === 'errored'}>
                                <div class="alert alert-error shadow-lg mt-2">
                                    {parsedData.error.toString()}
                                </div>
                            </Show>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Home
