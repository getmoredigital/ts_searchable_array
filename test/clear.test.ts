import { test , expect, describe } from 'vitest'
import { searchableArray } from '../src/searchableArray'

/*
* Clear items from the array
* */

describe('Clear', () => {
    const TestArray = searchableArray<{id: number} >()
    TestArray.add([
        {id: 0},
        {id: 1},
        {id: 2},
        {id: 3},
    ])

    TestArray.clear()

    test('Clear Items', async () => {
        expect(TestArray.entities().length).toEqual(0)
    }, 1000)

})