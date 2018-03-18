def removeItem(array, item):
    newList = []
    for currentItem in array:
        if currentItem != item:
            newList.append(currentItem)
    return newList
