export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(date));
}