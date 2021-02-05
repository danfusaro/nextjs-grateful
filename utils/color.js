export const ratingToColor = (avg_rating) => {
    const hue = Math.round((avg_rating - 5) * 20)
    return ["hsl(", hue, ", 50%, 50%)"].join("");
}