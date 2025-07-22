export const calculateDaysLeft = (dateFrom: Date, expirationDays?: number) => {
    if (!expirationDays) return { daysLeft: '', daysNum: null, dotColor: 'bg-gray-400', status: 'no-date' };

    const today = new Date();
    const expDate = new Date(dateFrom.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
        return { daysLeft: `${-diff}d`, daysNum: diff, dotColor: 'bg-gray-500', status: 'expired' };
    } else if (diff <= 3) {
        return { daysLeft: `${diff}d`, daysNum: diff, dotColor: 'bg-red-400', status: 'warning' };
    } else if (diff <= 5) {
        return { daysLeft: `${diff}d`, daysNum: diff, dotColor: 'bg-yellow-400', status: 'warning' };
    } else {
        return { daysLeft: `${diff}d`, daysNum: diff, dotColor: 'bg-green-400', status: 'good' };
    }
};