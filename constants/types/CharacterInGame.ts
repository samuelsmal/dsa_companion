export interface CharacterInGame {
    /**
     * A date in milliseconds with the `H_` prefix.
     */
    id: string

    lp: {
        max: number,
        current: number
    },

    asp: {
        max: number,
        current: number
    },

    kp: {
        max: number,
        current: number
    }

    fatePoints: {
        max: number,
        current: number
    }

    belongings: {id: string, where: string }[]

    purse: {
        d: number,
        s: number,
        h: number,
        k: number,
    }
}