import { DateTime } from 'luxon'
const vacantions = [
    '1-1',
    '1-6',
    '4-25',
    '5-1',
    '6-2',
    '8-15',
    '11-1',
    '12-8',
    '12-25',
    '12-26',
]


let vacantionsDays: any = null;

const setVacantionsDays = (year: any) => {
    const [easterMonth, easterDay] = getEaster(year)
    const secondEasterDay = easterDay + 1

    vacantionsDays = [...vacantions, `${easterMonth}-${secondEasterDay}`]
}

const getEaster = (year: any) => {
    const f = Math.floor
    // Golden Number - 1
    const G = year % 19
    const C = f(year / 100)
    // related to Epact
    const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30
    // number of days from 21 March to the Paschal full moon
    const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11))
    // weekday for the Paschal full moon
    const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7
    // number of days from 21 March to the Sunday on or before the Paschal full moon
    const L = I - J
    const month = 3 + f((L + 40) / 44)
    const day = L + 28 - 31 * f(month / 4)

    return [month, day]
}

export const getSlot = (time: any) => {

    let slot = 3 // represent an array index
    const utcDate = DateTime.fromMillis(time)
    const month = utcDate.month
    const dayOfWeek = utcDate.weekday
    const dayOfMonth = utcDate.day
    const hour = utcDate.hour
    const year = utcDate.year
    if (!vacantionsDays) {
        setVacantionsDays(year)
    }

    if (!isVacantion(dayOfWeek, month, dayOfMonth)) {
        if (isF1(dayOfWeek, hour)) {
            slot = 1
        } else if (isF2(dayOfWeek, hour)) {
            slot = 2
        }
    }

    return slot
}

// TODO get rid of all constants from next 3 functions
const isF1 = (dayOfWeek: any, hour: any) => dayOfWeek <= 5 && hour >= 8 && hour < 19

const isF2 = (dayOfWeek: any, hour: any) =>
    (dayOfWeek <= 5 && ((hour >= 7 && hour < 8) || (hour >= 19 && hour < 23))) ||
    (dayOfWeek === 6 && hour >= 7 && hour < 23)

const isVacantion = (dayOfWeek: any, month: any, dayOfMonth: any) =>
    dayOfWeek === 7 || vacantionsDays.includes(`${month}-${dayOfMonth}`)
