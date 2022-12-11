import { test , expect, describe } from 'vitest'
import { searchableArray } from '../src/searchableArray'

/*
* Filtering items in the array
* */

describe('Filtering items', () => {
    const testArray = searchableArray<{id: number, test: string, date: string} >()
    const bigArray = searchableArray<{id: number, test: string} >()
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
    bigArray.add(tester)

    test('Lookup by id', async () => {
        expect(testArray.filter({id: 1})?.length).toEqual(1)
    }, 1000)

    test('Lookup by id Array', async () => {
        expect(testArray.filter({id: [0,2]},{expand: ['id']})?.length).toEqual(2)
    }, 1000)

    test('Filter down to most specific', async () => {
        expect(testArray.filter({test: ['hello','world']})?.length).toEqual(1)
    }, 1000)

    test('Filter by date', async () => {
        expect(testArray.filter({date: '2022-12-01/2022-12-03'})?.length).toEqual(3)
    }, 1000)

    test('Filter with exclusion', async () => {
        expect(testArray.filter({test: 'hello'},{exclude: {test: 'world'}})?.length).toEqual(1)
    }, 1000)

    test('Return with exclusion array', async () => {
        expect(testArray.filter({test: ''},{exclude: { test: ['hello','world'] }})?.length).toEqual(1)
    }, 1000)

    test('Works on arrays 1,000,000',async () => {
        expect(bigArray.filter({id: 5000})?.length).toEqual(1)
        expect(bigArray.filter({category: 'blue'})?.length).toBeGreaterThan(0)
    }, 1000)
})