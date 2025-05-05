export interface Value {
    max: number;
    current: number;
}

export interface CharacterInGame {
    /**
     * A date in milliseconds with the `H_` prefix.
     */
    id: string;

    // Either the `dateModified` or `dateCreated` timestamp.
    // Is used to recalculate the max values.
    characterLastModifiedAt: string;

    lp: Value;
    asp: Value;
    kp: Value;
    fatePoints: Value;
    soulPower: Value;
    toughness: Value;
    dodge: Value;
    initiative: Value;
    velocity: Value;
    woundThreshold: Value;

    belongings: {id: string, where: string }[]

    purse: {
        d: number,
        s: number,
        h: number,
        k: number,
    }

    painLevel: number;
}