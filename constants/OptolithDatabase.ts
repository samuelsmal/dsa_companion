import {SQLiteDatabase} from "expo-sqlite";
import {RawHero} from "@/constants/types/RawHero";

export async function getAttributeNames(db: SQLiteDatabase, locale: string) {
    const attributeNames = await db.getAllAsync<{ id: string, name: string }>(
        "SELECT id, short as name FROM '" + locale + "__attributes' ORDER BY id"
    );

    return new Map(attributeNames.map(item => [item.id, item.name]));
}

export async function getTalents(db: SQLiteDatabase, locale: string) {
    return db.getAllAsync<{
        id: string,
        check1: string,
        check2: string,
        check3: string,
        gr: number,
        skillName: string,
        groupName: string
    }>(
        "SELECT US.id, US.check1, US.check2, US.check3, US.gr, LS.name AS skillName, LSG.name AS groupName " +
        " FROM univ__skills AS US" +
        " INNER JOIN " + locale + "__skills AS LS ON US.id = LS.id" +
        " INNER JOIN " + locale + "__skill_groups AS LSG ON US.gr = LSG.id"
    );
}

function asp(groupId: number, subGroupId: number, characterAttributes: Map<string, number>, additionalAsp: number, permamentAE: {lost: number, redeemed: number}) {
    // TODO do other groups
    if (groupId === 2) {
        let val = 20;

        if (subGroupId === 1) {
            // Assuming this is the lead attribute
            val += characterAttributes.get("ATTR_2") || 0;
        }

        return val + additionalAsp - permamentAE.lost + permamentAE.redeemed;
    } else {
        return 0
    }
}

function karma(groupId: number, subGroupId: number, characterAttributes: Map<string, number>, additionalAsp: number, permamentKP: {lost: number, redeemed: number}) {
    // TODO
    return 0
}

export interface CalculatedAttributes {
    maxLp: number;
    maxAsp: number;
    maxKarma: number;
    soulPower: number;
    toughness: number;
    dodge: number;
    initiative: number;
    velocity: number;
    woundThreshold: number;
}

export function getCalculatedValues(db: SQLiteDatabase, characterData: RawHero): CalculatedAttributes {
    const raceValues = db.getFirstSync<{lp: number, spi: number, tou: number, mov: number}>(
        "SELECT lp, spi, tou, mov FROM univ__races WHERE id = ?", characterData.r
    );

    const characterAttributes = new Map<string, number>(characterData.attr.values.map(item=> {
        if (item instanceof Array) {
            return [item[0], item[1]];
        } else {
            return [item.id, item.value]
        }
    }))

    // @ts-ignore
    const attributeForLp: number = characterData.attr.values.find(item => item.id == "ATTR_7") || 0;

    // @ts-ignore
    const maxLp = raceValues.lp + 2 * attributeForLp - characterData.attr.permanentLP.lost;

    const characterTypeGroup = db.getFirstSync<{groupId: number, subGroupId: number}>(
        "SELECT gr AS groupId, sgr AS subGroupId FROM univ__professions WHERE id = ?", characterData.p
    );

    const maxAsp = characterTypeGroup ? asp(characterTypeGroup.groupId, characterTypeGroup.subGroupId, characterAttributes, characterData.attr.ae, characterData.attr.permanentAE)  : 0;
    const maxKarma = characterTypeGroup ? karma(characterTypeGroup.groupId, characterTypeGroup.subGroupId, characterAttributes, characterData.attr.kp, characterData.attr.permanentKP)  : 0;

    // @ts-ignore
    const soulPower = raceValues.spi + Math.floor((characterAttributes.get("ATTR_1") + characterAttributes.get("ATTR_2") + characterAttributes.get("ATTR_3")) / 6);

    // @ts-ignore
    const toughness = raceValues.tou + Math.floor((characterAttributes.get("ATTR_7") * 2 + characterAttributes.get("ATTR_8")) / 6)

    // @ts-ignore
    const dodge = Math.floor(characterAttributes.get("ATTR_6") / 2);

    // @ts-ignore
    const initiative = Math.floor((characterAttributes.get("ATTR_1") + characterAttributes.get("ATTR_6")) / 2);

    // @ts-ignore
    const velocity= raceValues.mov;

    // @ts-ignore
    const woundThreshold= Math.floor(characterAttributes.get("ATTR_7") / 2);

    return {
        maxLp: maxLp,
        maxAsp: maxAsp,
        maxKarma: maxKarma,
        soulPower: soulPower,
        toughness: toughness,
        dodge: dodge,
        initiative: initiative,
        velocity: velocity,
        woundThreshold: woundThreshold,
    }

}