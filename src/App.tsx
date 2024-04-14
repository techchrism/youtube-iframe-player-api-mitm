import {Component, createSignal, Show} from 'solid-js'
import {ApiEvent} from './ApiEvent'
import EventsDisplay from './pages/EventsDisplay'
import Home from './pages/Home'

const App: Component = () => {
    const [events, setEvents] = createSignal<ApiEvent[] | undefined>(undefined)
    const [videoID, setVideoID] = createSignal<string | undefined>(undefined)

    return (
        <>
            <Show when={events() !== undefined || videoID() !== undefined} fallback={
                <Home onUpload={events => setEvents(events)} onVideoID={id => setVideoID(id)}/>
            }>
                <EventsDisplay events={events()} videoID={videoID()}/>
            </Show>
        </>
    )
}

export default App
