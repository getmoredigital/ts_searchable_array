import { test , expect, describe } from 'vitest'
import { searchableArray } from '../src/searchableArray'

describe('Adding Items',() => {
    const testArray = searchableArray<{id: number, test: string} | null | { a: number, b: string }>()

    test('Add Empty', async () => {
        testArray.add(null)
        expect(testArray.entities().length).toEqual(0)
    }, 1000)

    test('Add Item', async () => {
        testArray.add({id: 0, test: "Hello"})
        expect(testArray.entities().length).toEqual(1)
    }, 1000)

    test('Add Array', async () => {
        testArray.add([
            {id: 1, test: "Hello World"},
            {id: 2, test: "World"},
            {id: 3, test: "No Keywords"},
        ])
        expect(testArray.entities().length).toEqual(4)
    }, 1000)

    test('Add Item with mapping function', async () => {
        testArray.add({a: 5, b: 'Other'},(x): {id: number, test: string} => { return {id: x.a, test: x.b }})
        expect(testArray.filter({id: 5}).length).toEqual(1)
    }, 1000)

    test('Add Array with mapping function', async () => {
        testArray.add([
            {a: 11, b: "Test"},
            {a: 12, b: "Test"},
            {a: 13, b: "Test"},
        ],(x): {id: number, test: string} => { return {id: x.a, test: x.b }})
        expect(testArray.filter({id: 12}).length).toEqual(1)
    }, 1000)
})






