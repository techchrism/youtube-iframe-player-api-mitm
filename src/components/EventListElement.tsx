import {Component, createMemo, Match, Show, Switch} from 'solid-js'
import {ApiEvent} from '../ApiEvent'
import {FiArrowDownLeft, FiArrowUpRight} from 'solid-icons/fi'
import {VsJson} from 'solid-icons/vs'
import {RiEditorText} from 'solid-icons/ri'
import {OcCommandpalette2} from 'solid-icons/oc'

export type EventElementProps = {
    event: ApiEvent
}

function simpleZeroPad(num: number): string {
    return num < 10 ? `0${num}` : num.toString()
}

const EventListElement: Component<EventElementProps> = (props) => {
    const time = createMemo(() => new Date(props.event.time))

    return (
        <div class="flex flex-row items-center space-x-3 w-full max-w-full h-[40px]">
            <div>
                <Show when={props.event.direction === 'incoming'} fallback={
                    <FiArrowUpRight color="#3B82F6"/>
                }>
                    <FiArrowDownLeft color="#F97316"/>
                </Show>
            </div>
            <div class="flex-grow overflow-hidden">
                <div class="flex flex-row items-center space-x-1 font-semibold">
                    <Switch>
                        <Match when={props.event.type === 'json' && props.event}>
                            {event =>
                                <>
                                    <VsJson/>
                                    <span>{(event().data['event'] ?? 'JSON') + ' Event'}</span>
                                </>
                            }
                        </Match>
                        <Match when={props.event.type === 'text'}>
                            <RiEditorText/>
                            <span>Text Event</span>
                        </Match>
                        <Match when={props.event.type === 'api'}>
                            <OcCommandpalette2/>
                            {/*TODO: Add API event data*/}
                        </Match>
                    </Switch>
                </div>
                {/* TODO show preview for event data */}
            </div>
            <div class="text-center whitespace-nowrap">
                {`${simpleZeroPad(time().getHours())}:${simpleZeroPad(time().getMinutes())}`}
            </div>
        </div>
    )
}

export default EventListElement