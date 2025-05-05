import {CharacterInGame} from "@/constants/types/CharacterInGame";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SQLiteDatabase} from "expo-sqlite";
import {RawHero} from "@/constants/types/RawHero";
import {getCalculatedValues} from "@/constants/OptolithDatabase";

const updateCharacterInGame = async (characterInGame: CharacterInGame) => {
    try {
        const jsonValue = JSON.stringify(characterInGame);
        await AsyncStorage.setItem(characterInGame.id, jsonValue);
    } catch (error) {
        console.error("Could not write data: ", error);
    }
}

export const getCharacterInGame = async (db: SQLiteDatabase, characterData: RawHero): Promise<CharacterInGame> => {
    try {
        const value = await AsyncStorage.getItem(characterData.id)
        const resetStored = true;
        if (!resetStored && value !== null) {
            console.log("fetching in-game character from storage");
            return JSON.parse(value);
        } else {
            console.log("creating in-game character")
            const calculatedAttributes = getCalculatedValues(db, characterData);
            const characterInGame = {
                id: characterData.id,
                characterLastModifiedAt: characterData.dateModified || characterData.dateCreated,
                lp: {
                    max: calculatedAttributes.maxLp,
                    current: calculatedAttributes.maxLp,
                },
                asp: {
                    max: calculatedAttributes.maxAsp,
                    current: calculatedAttributes.maxAsp,
                },
                kp: {
                    max: calculatedAttributes.maxKarma,
                    current: calculatedAttributes.maxKarma,
                },
                fatePoints: {
                    max: calculatedAttributes.fatePoints,
                    current: calculatedAttributes.fatePoints,
                },
                soulPower: {
                    max: calculatedAttributes.soulPower,
                    current: calculatedAttributes.soulPower,
                },
                toughness: {
                    max: calculatedAttributes.toughness,
                    current: calculatedAttributes.toughness,
                },
                dodge: {
                    max: calculatedAttributes.dodge,
                    current: calculatedAttributes.dodge,
                },
                initiative: {
                    max: calculatedAttributes.initiative,
                    current: calculatedAttributes.initiative,
                },
                velocity: {
                    max: calculatedAttributes.velocity,
                    current: calculatedAttributes.velocity,
                },
                woundThreshold: {
                    max: calculatedAttributes.woundThreshold,
                    current: calculatedAttributes.woundThreshold,
                },
                belongings: [],
                purse: {
                    d: parseInt(characterData.belongings.purse.d) || 0,
                    s: parseInt(characterData.belongings.purse.s) || 0,
                    h: parseInt(characterData.belongings.purse.h) || 0,
                    k: parseInt(characterData.belongings.purse.k) || 0,
                },
                painLevel: 0
            };

            await updateCharacterInGame(characterInGame);
            return characterInGame;
        }
    } catch (error) {
        console.error("Could not read data: ", error);
    }
}