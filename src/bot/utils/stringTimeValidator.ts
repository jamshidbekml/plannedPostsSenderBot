export default function (time_string: string) {
    if (!time_string.length || time_string.length != 5)
        throw new Error('Time validation error');

    if (!time_string.includes(':')) throw new Error('Time validation error');

    const splitted = time_string.split(':');
    const hours = Number(splitted[0]);
    const minutes = Number(splitted[1]);

    if (isNaN(hours) || isNaN(minutes))
        throw new Error('Time validation error');

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
        throw new Error('Time validation error');
}
