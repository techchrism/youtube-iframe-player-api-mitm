
export type ApiEvent = {
    direction: 'incoming' | 'outgoing' | 'internal'
    time: number
} & ({
    type: 'text'
    data: string
} | {
    type: 'api'
    name: string
    arguments: any[]
})