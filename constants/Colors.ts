export const Colors = {
    light: {
        backgroundNotFocus: 'rgba(18,18,18, 0.5)',
        backgroundFocus: 'rgb(221,221,221)',
        courage: 'rgb(46,37,133)',
        sagacity: 'rgb(51,117,56)',
        intuition: 'rgb(93,168,153)',
        charisma: 'rgb(148,203,236)',
        dexterity: 'rgb(220,205,125)',
        agility: 'rgb(194,106,119)',
        constitution: 'rgb(159,74,150)',
        strength: 'rgb(126,41,84)',
    },
    optolith: {
        light: {
            courage: '#c54747',
            sagacity: '#a85bd4',
            intuition: '#339b5b',
            charisma: 'black',
            dexterity: '#cac158',
            agility: '#5398bb',
            constitution: 'white',
            strength: '#c28e46',
        }
    }
}

export const AttributeColors: Map<string, string> = new Map([
    ["ATTR_1", Colors.light.courage],
    ["ATTR_2", Colors.light.sagacity],
    ["ATTR_3", Colors.light.intuition],
    ["ATTR_4", Colors.light.charisma],
    ["ATTR_5", Colors.light.dexterity],
    ["ATTR_6", Colors.light.agility],
    ["ATTR_7", Colors.light.constitution],
    ["ATTR_8", Colors.light.strength],
])
