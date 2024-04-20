import {Component, createSignal, Show} from 'solid-js'
import {ApiEvent} from '../ApiEvent'
import {FiInfo} from 'solid-icons/fi'

export type VideoEventSourceProps = {
    videoID: string
    onEvent: (event: ApiEvent) => void
}

const VideoEventSource: Component<VideoEventSourceProps> = (props) => {
    let videoIframeElement: HTMLIFrameElement
    const [player, setPlayer] = createSignal<any | undefined>(undefined)

    // Listen to incoming messages
    window.addEventListener('message', (event) => {
        props.onEvent({
            direction: 'incoming',
            time: Date.now(),
            type: 'text',
            data: event.data
        })
    })

    // Set up iframe api ready callback
    window['onYouTubeIframeAPIReady'] = () => {
        // Use a proxy on the element to intercept postMessage calls
        const iframeProxy = new Proxy(videoIframeElement, {
            get: (target, p, receiver) => {
                const value = target[p]

                if(p === 'contentWindow') {
                    if(value === null) return value

                    return new Proxy(value, {
                        set: (target, p, newVal) => {
                            target[p] = newVal
                            return true
                        },
                        get: (target, p, receiver) => {
                            const value = target[p]

                            if(p === 'postMessage') {
                                return function (...args: any[]) {
                                    const message = args[0]
                                    if(message !== undefined) {
                                        const base = {
                                            direction: 'outgoing' as const,
                                            time: Date.now()
                                        }

                                        if(typeof message === 'string') {
                                            props.onEvent({
                                                direction: 'outgoing',
                                                time: Date.now(),
                                                type: 'text',
                                                data: message
                                            })
                                        } else {
                                            console.warn(`Unhandled message type (${typeof message})`, message)
                                        }
                                    }
                                    return value.apply(target, args)
                                }
                            }

                            return value;
                        }
                    })
                }

                if(value instanceof Function) {
                    return function (...args: any[]) {
                        return value.apply(this === receiver ? target : this, args)
                    }
                }
                return value
            },
            set: (target, p, newVal) => {
                target[p] = newVal
                return true
            }
        })

        // @ts-ignore
        const player = new YT.Player(iframeProxy, {
            playerVars: {
                playsinline: 1
            },
            events: {
                onReady: (event: any) => {
                    const handler = {
                        get: (target: any, p: PropertyKey, receiver: any) => {
                            const value = target[p]
                            if(value === null) return value

                            if(value instanceof Function) {
                                return function (...args: any[]) {
                                    props.onEvent({
                                        direction: 'internal',
                                        time: Date.now(),
                                        type: 'api',
                                        name: String(p),
                                        arguments: args
                                    })
                                    return value.apply(target, args)
                                }
                            }
                            if(typeof value === 'object') {
                                return new Proxy(target[p], handler)
                            }
                            return value
                        }
                    }
                    const player = new Proxy(event['target'], handler)
                    setPlayer(player)
                    window['player'] = player
                },
                // Listen to all other events
                onAutoplayBlocked: (event: any) => {},
                onApiChange: (event: any) => {},
                onError: (event: any) => {},
                onPlaybackRateChange: (event: any) => {},
                onPlaybackQualityChange: (event: any) => {},
                onStateChange: (event: any) => {},
            }
        })
    }

    // Add API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    return (
        <div class="flex flex-row">
            <iframe ref={videoIframeElement} width="640" height="360" src={`https://www.youtube.com/embed/${props.videoID}?enablejsapi=1`}/>
            <Show when={player()}>
                {player => <>
                    <div class="divider divider-horizontal"/>
                    <div class="flex flex-col h-full">
                        <div class="space-x-2 mb-2">
                            <button class="btn" onClick={() => player().playVideo()}>Play</button>
                            <button class="btn" onClick={() => player().pauseVideo()}>Pause</button>
                            <button class="btn" onClick={() => player().stopVideo()}>Stop</button>
                        </div>
                        <div class="space-x-2">
                            <button class="btn" onClick={() => player().mute()}>Mute</button>
                            <button class="btn" onClick={() => player().unMute()}>Unmute</button>
                        </div>
                        <div class="alert mt-auto w-max">
                            <FiInfo />
                            <p>
                                The player API is exposed as <code class="p-1 text-black bg-white dark:text-white dark:bg-black">player</code> in the dev console
                                <br/>
                                For more info, see <a class="underline" referrerpolicy="no-referrer" target="_blank" href="https://developers.google.com/youtube/iframe_api_reference">https://developers.google.com/youtube/iframe_api_reference</a>
                            </p>
                        </div>
                    </div>
                </>}
            </Show>
        </div>
    )
}

export default VideoEventSource