import {ApiEvent} from '../ApiEvent'
import {Component, ComponentProps, createEffect, Show} from 'solid-js'

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

    createEffect(() => {
        if(props.item.type === 'json') {
            jsonViewer.expandAll()
        }
    })

    return (
        <div>
            <Show when={props.item.type === 'json' && props.item}>
                {item =>
                    <>
                        <json-viewer data={item().data} ref={jsonViewer}/>
                    </>
                }
            </Show>
            {/* TODO show text and api data */}
        </div>
    )
}

export default EventDetails