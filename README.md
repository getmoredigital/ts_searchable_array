# Searchable Array (Typescript)
Extended Array with methods for complex item search

A learning project, currently in process of moving from a functional approach to a class based one.

# Basic Usage

```tsx
import { SmartArray } from './file'

//create a new array with or without a value
const array = new SmartArray()
array.add([{a: 1, b: 2},{a: 2, b: 3}])
```

## Main Feature

Filter any items

```tsx
//Query to filter
array.smartFilter({a: 5})

//Query with multiple arguments
array.smartFilter({a: [5,6]})

//Combine search keys (a: 5 && b: 2)
array.smartFilter({a: 5, b: 2})

//Expand a search (e: "hello" || e: "world")
array.smartFilter({a: ["hello","world"]},{expand: ['b']})

//Exclude results
array.smartFilter({a: 5},{exclude: {b: 2})

//Use with Dates ( items with an f between 2022-12-01 and 2022-12-11 )
array.smartFilter({f: '2022-12-01/2022-12-11'},{isDate: ['f']})

//if you want to console log the loop
array.config.logLoop = true

//if you want some performance times
array.config.timeFilter = true

```

## Of course this is just a base.

Just being moved over to the class form...
Different projects require unique behavior, which can change array to array. So it is easy to extend in-line.

```tsx
function myPlugin(options){
    onInit('Add My Online Fetch', (passedIntialValue) => {
        // logic with helpful composables
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
