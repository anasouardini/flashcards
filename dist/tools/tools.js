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
/**
 * @description Returns next, previous, max and min items from a list.
 */
function getNeighbors({ blackList, list, target, initialNeighbors }) {
    let err = '';
    const neighbords = list
        .reduce((output, candidate, index, list) => {
        // skipping the blacklisted items
        if (blackList && blackList.includes(candidate)) {
            return output;
        }
        // get min and max
        if (candidate < output.min) {
            output.min = candidate;
        }
        if (candidate > output.max) {
            output.max = candidate;
        }
        // get previous and next
        if (candidate < target && candidate > output.previous) {
            output.previous = candidate;
        }
        else if (candidate > target && candidate < output.next) {
            output.next = candidate;
        }
        // if it didn't change the initials, it means the initials are the smallest or/and largest values
        if (index == list.length - 1) {
            if (output.next == initialNeighbors.max) {
                output.next = target;
                err += `\n   > next never changed`;
            }
            if (output.previous == initialNeighbors.min) {
                output.previous = target;
                err += `\n   > prev never changed`;
            }
        }
        return output;
    }, {
        min: initialNeighbors.max, // largest value
        previous: initialNeighbors.min, // smallest value
        next: initialNeighbors.max, // largest value
        max: initialNeighbors.min, // smallest value
    });
    return { ...neighbords, err };
}
exports.default = { capitalize, execPromise, isDateValid, getNeighbors };
