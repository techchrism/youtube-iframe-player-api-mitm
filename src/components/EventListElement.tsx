import {Component, createMemo, Match, Show, Switch} from 'solid-js'
import {ApiEvent} from '../ApiEvent'
import {FiArrowDownLeft, FiArrowUpRight} from 'solid-icons/fi'
import {VsJson} from 'solid-icons/vs'
import {RiEditorText} from 'solid-icons/ri'
import {OcCommandpalette2} from 'solid-icons/oc'
import {FaSolidCircleDot} from 'solid-icons/fa'

export type EventElementProps = {
    event: ApiEvent
}

function simpleZeroPad(num: number): string {
    return num < 10 ? `0${num}` : num.toString()
}

const EventListElement: Component<EventElementProps> = (props) => {
    const time = createMemo(() => new Date(props.event.time))

    const jsonData = createMemo(() => {
        try {
            if(props.event.type !== 'text') return undefined
            return JSON.parse(props.event.data)
        } catch (_ignored) {
            return undefined
        }
    })

    return (
        <div class="flex flex-row items-center space-x-3 w-full max-w-full h-[40px]">
            <div>
                <Switch>
                    <Match when={props.event.direction === 'incoming'}>
                        <FiArrowDownLeft color="#F97316"/>
                    </Match>
                    <Match when={props.event.direction === 'outgoing'}>
                        <FiArrowUpRight color="#3B82F6"/>
                    </Match>
                    <Match when={props.event.direction === 'internal'}>
                        <FaSolidCircleDot color="#518DC9"/>
                    </Match>
                </Switch>
            </div>
            <div class="flex-grow overflow-hidden">
                <div class="flex flex-row items-center space-x-1 font-semibold">
                    <Switch>
                        <Match when={jsonData()}>
                            {data =>
                                <>
                                    <VsJson/>
                                    <span>{(data()['event'] ?? 'JSON') + ' Event'}</span>
                                </>
                            }
                        </Match>
                        <Match when={props.event.type === 'text'}>
                            <RiEditorText/>
                            <span>Text Event</span>
                        </Match>
                        <Match when={props.event.type === 'api'}>
                            <OcCommandpalette2/>
                            <span>API Call Event</span>
                        </Match>
                    </Switch>
                </div>
                <div class="break-keep text-nowrap truncate font-light">
                    <Switch>
                        <Match when={props.event.type === 'text' && props.event}>
                            {event => <>
                                {event().data.substring(0, 100)}...
                            </>}
                        </Match>
                        <Match when={props.event.type === 'api' && props.event}>
                            {event => <>
                                {event().name}({event().arguments.join(', ')})
                            </>}
                        </Match>
                    </Switch>
                </div>
            </div>
            <div class="text-center whitespace-nowrap">
                {`${simpleZeroPad(time().getHours())}:${simpleZeroPad(time().getMinutes())}`}
            </div>
        </div>
    )
}

export default EventListElement