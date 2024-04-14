import {Component} from 'solid-js'
import {ApiEvent} from '../ApiEvent'

export type VideoEventSourceProps = {
    videoID: string
    onEvent: (event: ApiEvent) => void
}

const VideoEventSource: Component<VideoEventSourceProps> = (props) => {
    let videoIframeElement: HTMLIFrameElement

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

                                    return value.apply(this === receiver ? target : this, args)
                                }
                            }

                            if(value instanceof Function) {
                                return function (...args: any[]) {
                                    return value.apply(this === receiver ? target : this, args)
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
            }/*,
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }*/
        })
    }

    // Add API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    return (
        <div class="flex flex-row">
            <iframe ref={videoIframeElement} width="640" height="360" src={`https://www.youtube.com/embed/${props.videoID}?enablejsapi=1`}/>
        </div>
    )
}

export default VideoEventSource