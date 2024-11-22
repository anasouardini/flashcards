import { exec } from 'child_process';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
async function execPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve(stdout);
        });
    });
}

function isDateValid(dateStr: Date) {
    // @ts-ignore
    return !isNaN(dateStr);
}

interface DateObject {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}
const bdate = {
    explode(date: Date) {
        const dateTimeProps = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
        };

        return dateTimeProps as DateObject;
    },
    implode(date: DateObject) {
        const dateStr = `${date.year}/${date.month}/${date.day} ${date.hour}:${date.minute}:${date.second}`;
        console.log(dateStr);
        const outDate = new Date(dateStr);

        if (!isDateValid(outDate)) {
            throw new Error('tools.bdate.implode: internal err');
        }
        return outDate;
    },
    addDays(date: Date, days: number) {
        if (!isDateValid(date)) {
            throw new Error('tools.bdate.addDays: Invalid date');
        }

        const eDate = this.explode(date);

        const newDate = this.implode({
            ...eDate,
            day: eDate.day + days,
        });

        return newDate;
    }
}

export default { capitalize, execPromise, isDateValid };