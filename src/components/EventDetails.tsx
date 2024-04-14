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
        <>
            <Show when={jsonData() !== undefined}>
                <div tabindex="0" class="collapse collapse-plus border bg-base-200 rounded-box">
                    <input type="checkbox" checked/>
                    <div class="collapse-title text-xl font-medium">
                        Parsed JSON Data
                    </div>
                    <div class="collapse-content">
                        <json-viewer data={jsonData()} ref={jsonViewer}/>
                    </div>
                </div>
            </Show>

            <Show when={props.item.type === 'text' && props.item}>
                {item =>
                    <>
                        <div tabindex="0" class="collapse collapse-plus border bg-base-200 rounded-box">
                            <input type="checkbox"/>
                            <div class="collapse-title text-xl font-medium">
                                Text Data
                            </div>
                            <div class="collapse-content">
                                <code class="break-all">
                                    {item().data}
                                </code>
                            </div>
                        </div>
                    </>
                }
            </Show>
            {/* TODO show text and api data */}
        </>
    )
}

export default EventDetails