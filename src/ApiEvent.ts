
export type ApiEvent = {
    direction: 'incoming' | 'outgoing'
    time: number
} & ({
    type: 'json'
    data: any
} | {
    type: 'text'
    data: string
} | {
    type: 'api'
    //TODO add API event data
})