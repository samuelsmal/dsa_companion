export interface ITHero {
    /**
     * A date in milliseconds with the `H_` prefix.
     */
    id: string

    lpAvailable: number,
    aspAvailable: number,
    fatePointsAvailable: number

    belongings: {id: string, where: string }[]

    purse: {
        d: number,
        s: number,
        h: number,
        k: number,
    }
}