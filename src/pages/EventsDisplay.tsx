import {Component, ComponentProps, createMemo, createSignal, Show} from 'solid-js'
import '@alenaksu/json-viewer'
import {FiArrowDownLeft, FiArrowUpRight, FiFilter} from 'solid-icons/fi'
import {VirtualContainer, VirtualItemProps} from '@minht11/solid-virtual-container'
import {ApiEvent} from '../ApiEvent'
import VideoEventSource from '../components/VideoEventSource'
import EventListElement from '../components/EventListElement'
import EventDetails from '../components/EventDetails'

export type EventsDisplayProps = {
    events: ApiEvent[] | undefined
    videoID: string | undefined
}

const EventsDisplay: Component<EventsDisplayProps> = (props) => {
    let sidebarElement: HTMLElement
    let videoIframeElement: HTMLIFrameElement | undefined = undefined

    const [activeIndex, setActiveIndex] = createSignal(0)
    const [search, setSearch] = createSignal('')
    const [items, setItems] = createSignal<ApiEvent[]>(props.events ?? [])

    const activeItem = createMemo(() => items()[activeIndex()])

    const ListItem = (props: VirtualItemProps<any>) => {
        return (
            <>
                <li style={props.style} class='w-full' tabIndex={props.tabIndex} role="listitem">
                    <a class="w-full block py-1 px-2 border-y border-base-100" classList={{active: props.index === activeIndex()}} onClick={() => setActiveIndex(props.index)}>
                        <EventListElement event={props.item}/>
                    </a>
                </li>
            </>
        )
    }

    return (
        <div class="min-h-screen md:grid md:grid-cols-main">
            <aside class="md:sticky top-0 left-0 md:h-screen overflow-y-auto" aria-label="Sidebar" ref={sidebarElement}>
                <div class="sticky top-0 z-10 bg-base-300 py-2">
                    <h1 class="text-xl font-semibold text-center mb-2">YouTube Iframe Player API MITM</h1>

                    <div class="mx-2 flex flex-row">
                        <input type="text" class="input mr-2 flex-grow" placeholder="Search..." oninput={(e) => {setSearch((e.target as HTMLInputElement).value)}}/>
                        <div class="dropdown dropdown-end">
                            <label tabindex="0" class="btn"><FiFilter title="Filter"/></label>
                            <div tabindex="0" class="dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                                <label class="label cursor-pointer">
                                    <span class="label-text"><FiArrowDownLeft color="#F97316" class="inline"/> Incoming</span>
                                    <input type="checkbox" checked class="checkbox"/>
                                </label>
                                <label class="label cursor-pointer">
                                    <span class="label-text"><FiArrowUpRight color="#3B82F6" class="inline"/> Outgoing</span>
                                    <input type="checkbox" checked class="checkbox"/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <ul class="menu bg-base-200 text-base-content">
                    <VirtualContainer items={items()} itemSize={{height: 58}} scrollTarget={sidebarElement}>
                        {ListItem}
                    </VirtualContainer>
                </ul>
            </aside>
            <main class="p-5 flex flex-col space-y-5">
                <Show when={props.videoID !== undefined}>
                    <VideoEventSource videoID={props.videoID} onEvent={e => setItems(items => [...items, e])}/>
                    <div class="divider"/>
                </Show>
                <Show when={activeItem()}>
                    <EventDetails item={activeItem()}/>
                </Show>
            </main>
        </div>
    )
}

export default EventsDisplay
