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

interface GetNeighborsProps<T> {
  list: T[],
  target: T,
  initialNeighbors: {
    min: T,
    max: T,
  },
  blackList?: T[]
}
interface GetNeighborsOutput<T> {
  previous: T,
  next: T,
  max: T,
  min: T,
  err: string
}

/**
 * @description Returns next, previous, max and min items from a list.
 */
function getNeighbors<T>({ blackList, list, target, initialNeighbors }: GetNeighborsProps<T>): GetNeighborsOutput<T> {
  let err = '';

  const neighbords = list
    .reduce((output, candidate, index, list) => {
      // skipping the blacklisted items
      if (blackList && blackList.includes(candidate)) { return output; }

      // get min and max
      if (candidate < output.min) { output.min = candidate; }
      if (candidate > output.max) { output.max = candidate; }

      // get previous and next
      if (candidate < target && candidate > output.previous) { output.previous = candidate; }
      else if (candidate > target && candidate < output.next) { output.next = candidate }

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
    },
      {
        min: initialNeighbors.max,// largest value
        previous: initialNeighbors.min,// smallest value
        next: initialNeighbors.max,// largest value
        max: initialNeighbors.min,// smallest value
      }
    );

  return { ...neighbords, err };
}

export default { capitalize, execPromise, isDateValid, getNeighbors };