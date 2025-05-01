/**
 * A utility function that groups an array of items based on a key extractor function
 * @param items The array of items to group
 * @param keyExtractor A function that extracts the key to group by from each item
 * @returns An object where keys are the extracted keys and values are arrays of items
 */
export function groupBy<T, K extends string | number>(
    items: T[],
    keyExtractor: (item: T) => K
): Record<K, T[]> {
    return items.reduce((result, item) => {
        const key = keyExtractor(item);
        // If this key doesn't exist in our result yet, create a new array
        if (!result[key]) {
            result[key] = [];
        }
        // Add the current item to the array for this key
        result[key].push(item);
        return result;
    }, {} as Record<K, T[]>);
}

/**
 * Transforms a grouped object into an array of sections compatible with SectionList
 * @param groupedData The grouped data object
 * @param titleExtractor A function to extract the title for each section
 * @returns An array of sections with title and data properties
 */
export function createSections<T, K extends string | number>(
    groupedData: Record<K, T[]>,
    titleExtractor?: (key: K) => string
): Array<{title: string, data: T[]}> {
    // @ts-ignore
    return Object.entries(groupedData).map(([key, data]) => ({
        title: titleExtractor ? titleExtractor(key as K) : String(key),
        data
    }));
}

/**
 * Generates a random integer between min and max (both inclusive)
 * @param min The minimum value (defaults to 1)
 * @param max The maximum value (defaults to 20)
 * @returns A random integer between min and max (inclusive)
 */
export function generateRandomInteger(min: number = 1, max: number = 20): number {
    // Math.random() generates a number between 0 (inclusive) and 1 (exclusive)
    // Math.floor() rounds down to the nearest integer
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
