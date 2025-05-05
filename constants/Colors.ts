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

export const AttributeColors: Map<string, {main: string, text: string}> = new Map([
    ["ATTR_1", {main: Colors.light.courage,      text: "white"}],
    ["ATTR_2", {main: Colors.light.sagacity,     text: "white"}],
    ["ATTR_3", {main: Colors.light.intuition,    text: "black"}],
    ["ATTR_4", {main: Colors.light.charisma,     text: "black"}],
    ["ATTR_5", {main: Colors.light.dexterity,    text: "black"}],
    ["ATTR_6", {main: Colors.light.agility,      text: "black"}],
    ["ATTR_7", {main: Colors.light.constitution, text: "black"}],
    ["ATTR_8", {main: Colors.light.strength,     text: "white"}],
])
