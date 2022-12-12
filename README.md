# Searchable Array (Typescript)
An extendable function to filter/search arrays with complex items in typescript/javascript

A learning project for something simple I can use and extend in my other projects.

# Basic Usage

```tsx
import { searchableArray } from './file'

//create a new array with or without a value
const array = searchableArray()
const array = searchableArray({a: 1, b: 1})

//add items to array
array.add([a: 2, b: 2])

//you can also map the input
array.add([c: 3, d: 3],(x) => {return {a: x.c, b: x.d}})

//or the whole array
array.map((x) => {return {a: x.c, b: x.d}})

//and sort
array.sort((a,b) => a + b)

//to get all results
array.entities()

//clear items
array.clear()
```

## Main Feature

Filter any items

```tsx
//Query to filter
array.filter({a: 5)

//Query with multiple arguments
array.filter({a: [5,6]})

//Combine search keys (a: 5 && b: 2)
array.filter({a: 5, b: 2})

//Expand a search (e: "hello" || e: "world")
array.filter({a: ["hello","world"]},{expand: ['b']})

//Exlude results
array.filter({a: 5},{exclude: {b: 2}))

//Use with Dates ( items with an f between 2022-12-01 and 2022-12-11 )
array.filter({f: '2022-12-01/2022-12-11'},{isDate: ['f']})

//if you want to console log the loop
array.config({logLoop: true}))

//if your want some performance times
array.config({timeFilter: true})

```

## Of course this is just a base.

Different projects require unique behavior, which can change array to array. So its easy to extend in-line.

```tsx
function myPlugin(options){
		onInit('Add My Online Fetch', (passedIntialValue) => {
		// My logic with helpful composables
		const history = options.getPast() //get all previous querys 
})
}

array.expand(myPlugin)
```

## Expand Options Contains

```jsx
//Life Cycle Events :: require name and a function to run
onInit(name,fn) //runs before anything has the passed value 
onAdd(name,fn) //runs before every add has the passed value
onFilter(name,fn) //runs before every filter has the query & settings
onFilterReturn(name,fn) //runs upon successful return but before exclusions
onLoop(name,fn) //runs on every pass, has value, idex, current results

//getters
getLibrary() //returns current library
getPast() //returns previous querys
getStore(key) //returns custom key:value

//store
addStore(key,value) //creates a custom key:value
appendStore(key,value) //updates custom key:value

//To return your custom data
array.fromStore(key)
```
