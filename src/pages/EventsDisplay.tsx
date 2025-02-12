import {Component, ComponentProps, createMemo, createSignal, Show} from 'solid-js'
import '@alenaksu/json-viewer'
import {FiArrowDownLeft, FiArrowUpRight, FiFilter} from 'solid-icons/fi'
import {VirtualContainer, VirtualItemProps} from '@minht11/solid-virtual-container'
import {ApiEvent} from '../ApiEvent'
import VideoEventSource from '../components/VideoEventSource'
import EventListElement from '../components/EventListElement'
import EventDetails from '../components/EventDetails'
import {FaSolidCircleDot} from 'solid-icons/fa'
import {BiSolidDownload} from 'solid-icons/bi'

const emptyListeningMessageContents = '{"event":"listening","id":1,"channel":"widget"}'

export type EventsDisplayProps = {
    events: ApiEvent[] | undefined
    videoID: string | undefined
}

const EventsDisplay: Component<EventsDisplayProps> = (props) => {
    let sidebarElement: HTMLElement

    const [activeIndex, setActiveIndex] = createSignal(0)
    const [search, setSearch] = createSignal('')
    const [items, setItems] = createSignal<ApiEvent[]>(props.events ?? [])

    // Filters
    const [showIncoming, setShowIncoming] = createSignal(true)
    const [showOutgoing, setShowOutgoing] = createSignal(true)
    const [showInternal, setShowInternal] = createSignal(true)
    const [showEmptyListening, setShowEmptyListening] = createSignal(true)
    const [showInfoDelivery, setShowInfoDelivery] = createSignal(true)

    const shownItems = createMemo(() => {
        return items().filter(item => {
            if(item.direction === 'incoming' && !showIncoming()) return false
            if(item.direction === 'outgoing' && !showOutgoing()) return false
            if(item.direction === 'internal' && !showInternal()) return false
            if(search() !== '' && (item.type === 'text' && !item.data.includes(search()))) return false
            if(!showEmptyListening() && item.type === 'text' && item.direction === 'outgoing' && item.data === emptyListeningMessageContents) return false
            if(!showInfoDelivery() && item.type === 'text' && item.direction === 'incoming' && item.data.includes('"event":"infoDelivery"')) return false

            return true
        })
    })

    const activeItem = createMemo(() => shownItems()[activeIndex()])

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

    const onDownload = () => {
        const data = JSON.stringify({
            type: 'youtube-iframe-api-mitm-events',
            version: '1.0.0',
            events: items()
        }, null, 4)
        const blob = new Blob([data], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'events.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div class="min-h-screen md:grid md:grid-cols-main">
            <aside class="md:sticky top-0 left-0 md:h-screen overflow-y-auto" aria-label="Sidebar" ref={sidebarElement}>
                <div class="sticky top-0 z-10 bg-base-300 py-2">
                    <h1 class="text-xl font-semibold text-center mb-2">YouTube Iframe Player API MITM</h1>

                    <div class="mx-2 flex flex-row">
                        <input type="text" class="input mr-2 flex-grow" placeholder="Search..." oninput={(e) => {setSearch((e.target as HTMLInputElement).value)}}/>
                        <div class="dropdown dropdown-end">
                            <label tabindex="0" class="btn" title="Filter"><FiFilter title="Filter"/></label>
                            <div tabindex="0" class="dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                                <label class="label cursor-pointer">
                                    <span class="label-text flex flex-row items-center gap-2"><FiArrowDownLeft color="#F97316" class="inline"/> Incoming</span>
                                    <input type="checkbox" checked class="checkbox" onClick={(e) => setShowIncoming((e.target as HTMLInputElement).checked)}/>
                                </label>
                                <label class="label cursor-pointer">
                                    <span class="label-text flex flex-row items-center gap-2"><FiArrowUpRight color="#3B82F6" class="inline"/> Outgoing</span>
                                    <input type="checkbox" checked class="checkbox" onClick={(e) => setShowOutgoing((e.target as HTMLInputElement).checked)}/>
                                </label>
                                <label class="label cursor-pointer">
                                    <span class="label-text flex flex-row items-center gap-2"><FaSolidCircleDot color="#518DC9" class="inline"/> Internal</span>
                                    <input type="checkbox" checked class="checkbox" onClick={(e) => setShowInternal((e.target as HTMLInputElement).checked)}/>
                                </label>

                                <div class="divider my-0"/>

                                <label class="label cursor-pointer">
                                    <span class="label-text">Empty Listening Event</span>
                                    <input type="checkbox" checked class="checkbox" onClick={(e) => setShowEmptyListening((e.target as HTMLInputElement).checked)}/>
                                </label>
                                <label class="label cursor-pointer">
                                    <span class="label-text">Info Delivery</span>
                                    <input type="checkbox" checked class="checkbox" onClick={(e) => setShowInfoDelivery((e.target as HTMLInputElement).checked)}/>
                                </label>
                            </div>
                        </div>
                        <button class="btn mx-2" title="Download" onClick={onDownload}>
                            <BiSolidDownload />
                        </button>
                    </div>
                </div>
                <ul class="menu bg-base-200 text-base-content">
                    <VirtualContainer items={shownItems()} itemSize={{height: 58}} scrollTarget={sidebarElement}>
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
