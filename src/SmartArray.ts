/*
* This allows you to search complex items in an array
* */

interface filterOptions {
    isDate?: string[], //dates must be a string formatted YYYY-MM-DD/YYYY-MM-DD
    exclude?: {
        [key: string] : string | number | object
    },
    expand?: string[]
}

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




export class SmartArray<Item> extends Array {
    constructor(){
        super()
        const hidden = Object.getPrototypeOf(this)
        hidden.history = []
        hidden.config = {
            timerFilter: false,
            logLoop: false
        }
    }

    /*
    * Add an item or new Array
    * */
    add(items?: Item | Item[] | any, mapFunction?: (any) => Item){
        if (items instanceof Array) {
            if (typeof mapFunction == 'function') {
                //with mapping function
                items?.forEach(item => {
                    this.push(mapFunction(item))
                })
            } else {
                //without mapping function
                items?.forEach(item => {
                    this.push(item)
                })
            }
        } else if(!!items) {
            if (typeof mapFunction == 'function') {
                //with mapping function
                this.push(mapFunction(items))
            } else {
                //without mapping function
                this.push(items)
            }
        }

        return this
    }

  /*
    Do a search of complex items
   */
    smartFilter(map: { [key: string] : any }, options?: filterOptions | null){
        const startTime = performance.now()
        // @ts-ignore
        this.history.push({map: map, options: options })
        let exclusions: {key: string, value: number | boolean | object | string }[] = []
        const filters: {key: string, value: number | boolean | object | string }[] = []
        //list of items to exclude
        let excludedItems: Item[] = []
        //list of keys
        let expansions: string[] = []
        //list of keys
        let dates: string[] = []

        if(!map){
            console.warn("No Map Provided")
            return this
        }

        // Expand out search term arrays
        Object.entries(map).forEach(filter => {
            if(Array.isArray(filter[1])){
                filter[1].forEach(x => {
                    filters.push({key: filter[0], value: x})
                })
            } else {
                filters.push({key: filter[0], value: filter[1]})
            }
        })

        // Expand out the options object
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
        let filteredLibrary = this.filter(x => typeof x != 'function')

        //Identify excluded Items
        exclusions.forEach(exclusion => {
            for (let index = 0; index < filteredLibrary.length;index++) {
                if (exclusion.key in filteredLibrary[index] && checkItem(filteredLibrary[index][exclusion.key],exclusion.value)){

                    excludedItems.push(filteredLibrary[index])
                }
            }
        })

        //used for clarity of code
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
            const itemsToCheck = isFilterDown ? filteredLibrary : this.filter(x => typeof x != 'function')

            //check each item
            for (let index = 0; index < itemsToCheck.length;index++) {
                let item = itemsToCheck[index]

                // @ts-ignore
                if(this.config.logLoop){
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

        // @ts-ignore
        if(this.config.timeFilter){
            console.log(`Filter took ${endTime - startTime} milliseconds`)
        }

        if(excludedItems.length > 0){
            return filteredLibrary.filter(x => !excludedItems.includes(x))
        } else {
            return filteredLibrary
        }
    }
}