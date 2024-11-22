"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
async function execPromise(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            resolve(stdout);
        });
    });
}
function isDateValid(dateStr) {
    // @ts-ignore
    return !isNaN(dateStr);
}
const bdate = {
    explode(date) {
        const dateTimeProps = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
        };
        return dateTimeProps;
    },
    implode(date) {
        const dateStr = `${date.year}/${date.month}/${date.day} ${date.hour}:${date.minute}:${date.second}`;
        console.log(dateStr);
        const outDate = new Date(dateStr);
        if (!isDateValid(outDate)) {
            throw new Error('tools.bdate.implode: internal err');
        }
        return outDate;
    },
    addDays(date, days) {
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
};
exports.default = { capitalize, execPromise, isDateValid };
