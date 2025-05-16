export interface AbilityAttribute {
    id: string;
    name: string;
    value: number;
    diceValue: number;
    result: number
}

export interface AbilityCheck {
    abilityId: string;
    abilityName: string;
    abilityType: string;
    abilityValue: number;
    attributes: AbilityAttribute[];
    difficulty: number;
    resultNumber: number;
    result: number;
}

export const calculateResult = (abilityCheck: AbilityCheck | null): AbilityCheck | null => {
    if (abilityCheck === null) {
        return null
    }

    const attributes = abilityCheck.attributes.map(attribute => {
        return {
            ...attribute,
            result: Math.max(0, attribute.diceValue - attribute.value + abilityCheck.difficulty)
        }
    })

    const resultNumber = (abilityCheck.abilityValue || 0)
        - attributes.map(({result}) => result).reduce((a, b) => a + b, 0)
    ;

    let overallResult = resultNumber / 3;
    overallResult = overallResult < 0 ? -1 : Math.ceil(overallResult);
    overallResult = overallResult == 0 ? 1 : overallResult;
    overallResult = Math.min(6, overallResult);

    return {
        ...abilityCheck,
        attributes: attributes,
        resultNumber: resultNumber,
        result: overallResult
    }
}
