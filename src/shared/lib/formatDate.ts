export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(date));
}

export const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const deadline = new Date(endDate);
    
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Прострочено";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}д`;
};