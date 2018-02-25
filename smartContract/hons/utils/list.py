from boa.code.builtins import list

# these helpers are important because builtin highlevel array operators like push
# are not available
# Also, arrays are fixed in length, so if the size of your array will change, you should make a new one

# adds an item to the end of the array
def push(array, item):
    newArrayLen = len(array) + 1
    i = 0
    newArray = list(length=newArrayLen)
    while i < len(array):
        oldValue = array[i]
        newArray[i] = oldValue
        i = i + 1
    newArray[i] = item
    return newArray

# assumes array contains unique values
# used to find an item in a unique array, and remove it
def delete(array, item):
    oldArrayLen = len(array)
    if oldArrayLen == 1:
        return []

    newArrayLen = oldArrayLen - 1
    i = 0
    j = 0
    newArray = list(length=newArrayLen)
    while i < len(array):
        oldValue = array[i]
        i = i + 1
        if oldValue != item:
            newArray[j] = oldValue
            j = j + 1
    return newArray
