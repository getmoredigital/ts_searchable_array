import { test , expect, describe } from 'vitest'
import { SmartArray } from '../src/SmartArray'

/*
* Filtering items in the array
* */

describe('Filtering items', () => {
    let testArray = new SmartArray<{id: number, test: string, date: string}>()

    testArray.add([
        {id: 0, test: "Hello", date: '2022-12-01'},
        {id: 1, test: "World", date: '2022-12-02'},
        {id: 2, test: "Hello World", date: '2022-12-03'},
        {id: 3, test: "No Key Words", date: '2022-12-04'},
    ])
    const tester = new Array(1000000)
    const category = ['red','blue','orange','green','pink']

    for(let i = 0; i < tester.length;i++){
        tester[i] = {
            id: i,
            category: category[Math.floor(Math.random() * category.length)]
        }
    }
    let bigArray = new SmartArray().add(tester)

    test('Lookup by id', async () => {
        expect(testArray.smartFilter({id: 1})?.length).toEqual(1)
    }, 1000)

    test('Lookup by id Array', async () => {
        expect(testArray.smartFilter({id: [0,2]},{expand: ['id']})?.length).toEqual(2)
    }, 1000)

    test('Filter down to most specific', async () => {
        expect(testArray.smartFilter({test: ['hello','world']})?.length).toEqual(1)
    }, 1000)

    test('Filter by date', async () => {
        expect(testArray.smartFilter({date: '2022-12-01/2022-12-03'})?.length).toEqual(3)
    }, 1000)

    test('Filter with exclusion', async () => {
        expect(testArray.smartFilter({test: 'hello'},{exclude: {test: 'world'}})?.length).toEqual(1)
    }, 1000)

    test('Return with exclusion array', async () => {
        expect(testArray.smartFilter({test: ''},{exclude: { test: ['hello','world'] }})?.length).toEqual(1)
    }, 1000)

    test('Works on arrays 1,000,000',async () => {
        expect(bigArray.smartFilter({id: 5000})?.length).toEqual(1)
        expect(bigArray.smartFilter({category: 'blue'})?.length).toBeGreaterThan(0)
    }, 1000)
})