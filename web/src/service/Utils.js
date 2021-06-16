export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}

export function getKvValue(data) {
    const values = data?.values;
    if (!values) {
        return [];
    }

    const result = JSON.parse(Buffer.from(values, 'base64').toString('utf8'));

    return Array.isArray(result) ? result : [];
}
