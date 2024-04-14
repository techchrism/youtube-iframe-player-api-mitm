
export type ApiEvent = {
    direction: 'incoming' | 'outgoing'
    time: number
} & ({
    type: 'text'
    data: string
} | {
    type: 'api'
    //TODO add API event data
})