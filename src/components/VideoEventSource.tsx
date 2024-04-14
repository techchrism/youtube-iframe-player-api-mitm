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
        const base = {
            direction: 'incoming' as const,
            time: Date.now()
        }

        try {
            const data = JSON.parse(event.data)
            props.onEvent({...base, type: 'json', data})
        } catch(_ignored) {
            props.onEvent({...base, type: 'text', data: event.data})
        }
    })

    // Set up iframe api ready callback
    window['onYouTubeIframeAPIReady'] = () => {
        // @ts-ignore
        const player = new YT.Player(videoIframeElement, {
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