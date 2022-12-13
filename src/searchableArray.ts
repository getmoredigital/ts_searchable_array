/*
* This is a composable to help filter complex item arrays.
* */

/*
* Case-insensitive string method includes for quicker matches
* */
function quickIncludes(search: string, term: string): boolean {
    let found: string[]
    const regEx = new RegExp(term,"i")
    //@ts-ignore
    while(found = regEx.exec(search) !== null){
        return true
        break
    }
    return false
}

/*
* Function takes in a value & search value and returns if the search values matches the value.
* */
function checkItem<T>(value: T, searchValue: T ): boolean {
    if (typeof searchValue == 'boolean' && searchValue == value){
        return true
    } else if(typeof searchValue == 'number' && searchValue == value){
        return true
    } else if(typeof searchValue == 'string' && typeof value == 'string' && quickIncludes(value,searchValue)){
        return true
    } else if (Array.isArray(value)){
        for (let i = 0; i < value.length; i++){
            return checkItem(value[i], searchValue)
        }
    } else if (typeof searchValue == 'object'&& JSON.stringify(value).includes(JSON.stringify(searchValue))) {
        return true
    }
    return false
}


/*
* Function check dates based on standard format of YYYY-MM-DD / YYYY-MM-DD
* */
function checkDate(dateStr: string, search: string): boolean {
    //Deal with empty search term
    if(!search || !dateStr){
        console.error('Missing date string input')
        return false
    }
    //split, and make sure only two dates included
    const strArray = search.split('/')
    if(strArray.length != 2){
        return false
    }
    const date = new Date(dateStr)
    const startDate = new Date(strArray[0])
    const endDate = new Date(strArray[1])

    //be sure all inputs are valid dates
    if(startDate.toString() == 'Invalid Date' || endDate.toString() == 'Invalid Date' || date.toString() == 'Invalid Date'){
        console.error('Invalid Date input')
        return false
    }

    //actual comparison
    if(date >= startDate && date <= endDate){
        return true
    }
    console.error('Unknown date error')
    return false
}



export const searchableArray = <Item>(initial?: Item | Item[]) => {
    let library: Item[]  = []

    //past Queries
    const history: {map: object, options?: object | null}[] = []
    //used for chaining
    const self = this

    type ConfigSettings = {
        timeFilter?: boolean
        logLoop?: boolean
    }
    const config: ConfigSettings = {
        timeFilter: false,
        logLoop: false
    }

    const store = {}

    const onInit: { name: string, customFunction: (initialValue) => void }[] = []
    const onAdd: { name: string, customFunction: (passedValue: Item | Item[]) => void }[] = []
    const onFilter: { name: string, customFunction: (query,settings) => void }[] = []
    const onFilterReturn: { name: string, customFunction: (currentReturnWithoutExclusions,query,settings) => void }[] = []
    const onLoop: { name: string, customFunction: (value, index: number , currentReturn) => void }[] = []

    /*
    * Constructor or ability to write to library
    * */
    if(!!initial){
        onInit.forEach(plugin => {
            try {
             plugin.customFunction(initial)
            } catch(err) {
                console.error( plugin.name + ' triggered ' + err )
            }
        })

        if(onInit.length == 0 && Array.isArray(initial)) {
            library = initial
        }
    }


    /*
    * Return the current library
    * */
    function getLibrary() {
        return library ?? []
    }

    /*
    * Clears the current library of items.
    * */
    function clear() {
        library = []
        //option to chain command
        return self
    }
    /*
    * Applies a map to the library
    * */
    function map(mappingFunction: (obj) => Item){
        if(typeof mappingFunction == 'function'){
            library = library.map(mappingFunction)
        }
    }

    /*
    * Applies a sorting function to the library
    * */
    function sort(mappingFunction: (a,b) => number){
        if(typeof mappingFunction == 'function'){
            library.sort(mappingFunction)
        }
    }

    /*
    * Recorded past filter queries for use with extensions
    * */
    function getPast(){
        return history
    }

    /*
    * The way to pull from store
    * */
    function getStoreValue(key: string){
        if(key in store){
            return store[key]
        }
        return null
    }

    /*
    * Set configuration options
    * */
    function setConfig(configSettings: ConfigSettings){
        //Apply passed config setting that exist on config
        Object.entries(configSettings).forEach(pair => {
            if(pair[0] in config){
                config[pair[0]] = pair[1]
            }
        })
    }

    /*
  * Add data to the array
  * */
    function add(items:Item | Item[],mapFunction?: (obj) => Item) {

        onAdd.forEach(plugin => {
            try {
                plugin.customFunction(items)
            } catch(err) {
                console.error( plugin.name + ' triggered ' + err )
            }
        })

        if (items instanceof Array) {
            if(typeof mapFunction == 'function'){
                //with mapping function
                library = library.concat(items.map(mapFunction))
            } else {
                //without mapping function
                library = library.concat(items)
            }
            //Single Item passed
        } else if(!!items){
            if(typeof mapFunction == 'function') {
                //with mapping function
                const newItem = mapFunction(items)
                library.push(newItem)
            } else {
                //without mapping function
                library.push(items)
            }


        } else {
            console.warn("No items provided")
        }

        return library
    }


    interface filterOptions {
        isDate?: string[], //dates must be a string formatted YYYY-MM-DD/YYYY-MM-DD
        exclude?: {
            [key: string] : string | number | object
        },
        expand?: string[]
    }

    /*
    * This function parses options passed to the filter function.
    * */
    function filter(map: { [key: string] : any }, options?: filterOptions | null, isSimpleArray?: boolean ){
        //time process
        const startTime = performance.now()

        onFilter.forEach(plugin => {
            try {
                plugin.customFunction(map,options)
            } catch(err) {
                console.error( plugin.name + ' triggered ' + err )
            }
        })

        //record query history for extensions
        history.push({map: map, options: options })
        //list of key value pairs
        let exclusions: {key: string, value: number | boolean | object | string }[] = []
        //list of items to exclude
        let excludedItems: Item[] = []
        //list of keys
        let expansions: string[] = []
        //list of keys
        let dates: string[] = []

        if(!map){
            console.warn("No Map Provided")
            return library
        }

        if(!!isSimpleArray) {
            if(!map['key']){
                console.warn("No Key provided. For simple arrays use { key: x }")
                return library
            }
            //For simple arrays.
            //@ts-ignore
            return !!library ? library.filter(x => x.includes(map['key'])) : []
        }


        const filters: {key: string, value: number | boolean | object | string }[] = []
        //Expand out array search
        Object.entries(map).forEach(filter => {
            if(Array.isArray(filter[1])){
                filter[1].forEach(x => {
                    filters.push({key: filter[0], value: x})
                })
            } else {
                filters.push({key: filter[0], value: filter[1]})
            }
        })

        if(!!options){
            //Apply expansion option
            if(!!options.expand) {
                expansions = options.expand
            }
            if(!!options.exclude){
                Object.entries(options.exclude).forEach(x => {
                    if(Array.isArray(x[1])){
                        x[1].forEach(y => {
                            exclusions.push({key: x[0], value: y})
                        })
                    } else {
                        exclusions.push({key: x[0], value: x[1]})
                    }
                })
            }
            if(!!options.isDate){
                dates = options.isDate
            }
        }

        //Ignore items that are functions
        let filteredLibrary = library.filter(x => typeof x != 'function')

        //Identify excluded Items
        exclusions.forEach(exclusion => {
            for (let index = 0; index < filteredLibrary.length;index++) {
                if (exclusion.key in filteredLibrary[index] && checkItem(filteredLibrary[index][exclusion.key],exclusion.value)){

                    excludedItems.push(filteredLibrary[index])
                }
            }
        })

        const originalLength = filteredLibrary.length

        //Apply Each Filter
        for (let filterIndex = 0;filterIndex < filters.length;filterIndex++) {
            const next: Item[] = []
            const lookup = filters[filterIndex].key
            //Return an Empty Result
            if(filteredLibrary.length == 0){
                return []
            }


            //on expansion search full library otherwise only current results
            const isFilterDown = !expansions.includes(lookup)
            const itemsToCheck = isFilterDown ? filteredLibrary : library.filter(x => typeof x != 'function')

            //check each item
            for (let index = 0; index < itemsToCheck.length;index++) {
                let item = itemsToCheck[index]

                onLoop.forEach(plugin => {
                    try {
                        plugin.customFunction(item,index,next)
                    } catch(err) {
                        console.error( plugin.name + ' triggered ' + err )
                    }
                })

                if(config.logLoop){
                    console.log(item,lookup,filters[filterIndex].value,checkItem(item[lookup],filters[filterIndex].value))
                }

                //ignore unknown keys
                if (lookup in item && !dates.includes(lookup) && checkItem(item[lookup],filters[filterIndex].value)){
                    next.push(item)
                    //for dates
                } else if(lookup in item && !dates.includes(lookup) && typeof filters[filterIndex].value == 'string' && typeof item[lookup] == 'string' && checkDate(item[lookup],filters[filterIndex].value.toString())){
                    next.push(item)
                }
            }
            //In case of expansion concat verse replace except on first pass
            if(!isFilterDown && filteredLibrary.length != originalLength) {
                filteredLibrary = filteredLibrary.concat(next)
            } else {
                filteredLibrary = next.filter(x => typeof x != 'function')
            }
        }
        const endTime = performance.now()

        if(config.timeFilter){
            console.log(`Filter took ${endTime - startTime} milliseconds`)
        }

        onFilterReturn.forEach(plugin => {
            try {
                plugin.customFunction(filteredLibrary,map,options)
            } catch(err) {
                console.error( plugin.name + ' triggered ' + err )
            }
        })

        if(excludedItems.length > 0){
            return filteredLibrary.filter(x => !excludedItems.includes(x))
        } else {
            return filteredLibrary
        }
    }

    /*
 * Add extended functionality
 * */
    function addOnInit(plugin : { name: string, customFunction: (initialValue) => void }){
        onInit.push(plugin)
    }

    function addOnAdd(plugin : { name: string, customFunction: (passedValue: Item | Item[]) => void }){
        onAdd.push(plugin)
    }

    function addOnFilter(plugin : { name: string, customFunction: (query,settings) => void }){
        onFilter.push(plugin)
    }

    function addOnFilterReturn(plugin : { name: string, customFunction: (currentReturnWithoutExclusions,query,settings) => void }){
        onFilterReturn.push(plugin)
    }

    function addOnLoop(plugin : { name: string, customFunction: (value, index, currentReturn) => void }){
        onLoop.push(plugin)
    }

    function createStore(key: string, value: any){
        if(key in store){
            console.error('duplicate store keys used')
        } else {
            store[key] = value
        }
    }

    function appendStore(key: string, value: any){
        if(key in store){
            if( Array.isArray(store[key])){
                store[key].push(value)
            } else if (typeof store[key] == 'string' || typeof store[key] == 'number') {
                store[key] += value
            } else {
                store[key] = value
            }
        } else {
            console.error(`no store ${key} found`)
        }
    }

    function addExtension(setExtension: (context) => void){
        if(typeof setExtension == 'function'){
            setExtension({
                onInit: addOnInit,
                onAdd: addOnAdd,
                onFilter: addOnFilter,
                onLoop: addOnLoop,
                getLibrary: getLibrary,
                getPast: getPast,
                addStore: createStore,
                getStore: getStoreValue,
                addOnFilterReturn: addOnFilterReturn,
                appendStore: appendStore
            })
        }
    }


    //Add Methods
    //@ts-ignore
    library.add = add
    //@ts-ignore
    library.smartFilter = filter
    //@ts-ignore
    library.clear = clear
    //@ts-ignore
    library.config = setConfig
    //@ts-ignore
    library.getStoreValue = getStoreValue

    //pass reference
    return library
}
