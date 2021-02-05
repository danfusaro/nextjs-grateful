export const formatSeconds = seconds => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(14, 5);
}

export const formatDate = dateString => {
    return new Date(dateString).toLocaleString().split(',')[0];
}