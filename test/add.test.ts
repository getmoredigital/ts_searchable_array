import { test , expect, describe } from 'vitest'
import { SmartArray } from '../src/SmartArray'

describe('Adding Items',() => {
    let testArray = new SmartArray<{id: number, test: string}>()

    test('Add Empty', async () => {
        expect(testArray.add().length).toEqual(0)
    }, 1000)

    test('Add Item', async () => {
        expect(testArray.add([{id: 0, test: "Hello"}]).length).toEqual(1)
    }, 1000)

    test('Add Array', async () => {
        expect(testArray.add([
            {id: 1, test: "Hello World"},
            {id: 2, test: "World"},
            {id: 3, test: "No Keywords"},
        ]).length).toEqual(4)
    }, 1000)

    test('Add Item with mapping function', async () => {
        expect(testArray.add({a: 5, b: 'Other'},(x) => { return {id: x.a, test: x.b }}).length).toEqual(5)
    }, 1000)

    test('Add Array with mapping function', async () => {
        testArray = testArray.add([
            {a: 11, b: "Test"},
            {a: 12, b: "Test"},
            {a: 13, b: "Test"},
        ],(x) => { return {id: x.a, test: x.b }})
        expect(testArray.length).toEqual(8)
    }, 1000)
})






