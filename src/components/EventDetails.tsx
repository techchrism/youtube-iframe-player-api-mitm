import {ApiEvent} from '../ApiEvent'
import {Component, ComponentProps, createEffect, createMemo, Show} from 'solid-js'

// Types for the json-viewer component, modified from https://stackoverflow.com/a/72239265
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            "json-viewer": ComponentProps<"div"> & { data: any }
        }
    }
}

export type EventDetailsProps = {
    item: ApiEvent
}

const EventDetails: Component<EventDetailsProps> = (props) => {
    let jsonViewer: any

    const jsonData = createMemo(() => {
        try {
            if(props.item.type !== 'text') return undefined
            return JSON.parse(props.item.data)
        } catch (_ignored) {
            return undefined
        }
    })

    createEffect(() => {
        if(jsonData() !== undefined) {
            jsonViewer.expandAll()
        }
    })

    return (
        <div>
            <Show when={jsonData() !== undefined}>
                <json-viewer data={jsonData()} ref={jsonViewer}/>
            </Show>
            {/* TODO show text and api data */}
        </div>
    )
}

export default EventDetails