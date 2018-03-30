from boa.interop.Neo.Runtime import CheckWitness, Notify
from boa.interop.Neo.Storage import *
from boa.builtins import concat
from hons.nep5 import *
from hons.token import *
from hons.serialization import *
from hons.arrayUtil import *
#
NS_REGISTER_FEE = 10 * 100_000_000  # 10 to owners * 10^8
NS_TRANSFER_FEE = 5 * 100_000_000   # 5 to owners * 10^8
NS_STORAGE_PREFIX = 'NAMESERVICE'

def handle_name_service(ctx, operation, args):

    # retreive the address associated with a given name
    # anyone can call
    if operation == 'nameServiceQuery':
        return query(ctx, args[0])

    # retreive a list of names associated with this address
    # anyone can call
    # output: array as bytearray
    elif operation == 'nameServiceQueryAddress':
        return queryAddress(ctx, args[0])

    # remove a link between a given name and it's address
    # can only be called by name owner
    elif operation == 'nameServiceUnregister':
        return unregister(ctx, args[0])

    # create a name to address association for a small fee
    # can only be called by owner of address being registered
    elif operation == 'nameServiceRegister':
        return register(ctx, args[0], args[1])

    # # transfer of a name from owner to a new address
    # # needs to be called twice, once by owner, and once by requester
    # # first one to call creates transfer agreement
    # # secong one to call finalizes transfer agreement, and transfer is executed
    # # if both parties to not fulfil agreement, transfer will not take place

    elif operation == 'nameServicePreApproveTransfer':
        return preApproveTransfer(ctx, args[0], args[1], args[2])

    elif operation == 'nameServiceRequestTransfer':
        return requestTransfer(ctx, args[0], args[1], args[2])

    elif operation == 'nameServiceQueryForSale':
        return queryForSale(ctx, args[0])

    elif operation == 'nameServicePostForSale':
        return postForSale(ctx, args[0], args[1])

    elif operation == 'nameServiceAcceptSale':
        return acceptSale(ctx, args[0], args[1])

    return False

def query(ctx, name):
    return getName(ctx, name)


def queryAddress(ctx, address):
    return getName(ctx, address)


def unregister(ctx, name):
    ownerAddress = getName(ctx, name)
    isOwnerAddress = CheckWitness(ownerAddress)

    if ownerAddress == b'':
        print('unregister; record does not exist')
        return False

    if isOwnerAddress == False:
        print('unregister; caller is not owner of record')
        return False

    return ns_do_unregister(ctx, name, ownerAddress)


def register(ctx, name, ownerAddress):
    isOwnerAddress = CheckWitness(ownerAddress)
    currentOwnerAddress = getName(ctx, name)

    if isOwnerAddress == False:
        print('register; contract caller is not same as ownerAddress')
        return False

    if currentOwnerAddress != b'':
        if currentOwnerAddress == ownerAddress:
            print('register; name is already registered to caller address')
        else:
            print('register; name is already registered to another address')
        return False

    print('register; all qualifications are met, about to pay fee')
    feePaid = do_fee_collection(ctx, ownerAddress, NS_REGISTER_FEE)
    print('just paid')

    if feePaid == False:
        print('Insufficient funds to pay registration fee')
        return False

    print('register; fees paid, record registration')
    return ns_do_register(ctx, name, ownerAddress)

def preApproveTransfer(ctx, name, ownerAddress, newOwnerAddress):
    print('preApproveTransfer')

    if ownerAddress == newOwnerAddress:
        print('transfer; ownerAddress and newOwnerAddress are the same')
        return False

    if CheckWitness(ownerAddress) == False:
        print('transfer; contract caller is not same as ownerAddress or newOwnerAddress')
        return False

    currentOwnerAddress = getName(ctx, name)
    if currentOwnerAddress == b'':
        print('transfer; name record is empty, please register instead')
        return False

    if currentOwnerAddress != ownerAddress:
        print('transfer; contract caller is not owner of name record')
        return False

    # if passing concat method more than 2 arguments, it pushes extra item on stack
    approvalRecordKey = concat(name, ownerAddress)
    approvalRecordKey = concat(approvalRecordKey, newOwnerAddress)
    approvalRecordRaw = getName(ctx, approvalRecordKey)

    if approvalRecordRaw == b'':
        print('transfer; no approval record, create one with approval from owner')
        feesCollected = do_fee_collection(ctx, ownerAddress, NS_TRANSFER_FEE)
        if feesCollected:
            valueRaw = [True, False]
            value = serialize_array(valueRaw)
            putName(ctx, approvalRecordKey, value)
            return True
        return False

    print('approvalRecordRaw')
    # [{ownerAddressApproval: boolean}, {newOwnerAddress_approval: boolean}]
    approvalRecord = deserialize_bytearray(approvalRecordRaw)
    print('approvalRecord')
    ownerApproves = approvalRecord[0]
    print('ownerApproves')
    newOwnerApproves = approvalRecord[1]
    print('newOwnerApproves')

    # if not this format, gets error from compiler
    # [I 180307 16:44:24 pytoken:253] Op Not Converted: JUMP_IF_FALSE_OR_POP
    if ownerApproves == True:
        if newOwnerApproves == False:
            print('transfer; owner pre approval already created, but waiting for new owner')
            return False

    # if not this format, gets error from compiler
    # [I 180307 16:44:24 pytoken:253] Op Not Converted: JUMP_IF_FALSE_OR_POP
    if ownerApproves == False:
        if newOwnerApproves == True:
            print('transfer; approval record exists and new owner pre approved transfer; execute transfer')
            feesCollected = do_fee_collection(ctx, ownerAddress, NS_TRANSFER_FEE)
            if feesCollected:
                deleteName(ctx, approvalRecordKey)
                return ns_do_transfer(ctx, name, ownerAddress, newOwnerAddress)
            return False

    return False

def requestTransfer(ctx, name, ownerAddress, newOwnerAddress):
    print('transfer')
    isNewOwnerAddress = CheckWitness(newOwnerAddress)

    if isNewOwnerAddress == False:
        print('transfer; contract caller is not the same as new owner')
        return False

    currentOwnerAddress = getName(ctx, name)

    if currentOwnerAddress == b'':
        print('transfer; name record is empty, please register instead')
        return False

    if currentOwnerAddress != ownerAddress:
        print('transfer; request from owner is not owner of this name')
        return False

    # if passing concat method more than 2 arguments, it pushes extra item on stack
    approvalRecordKey = concat(name, ownerAddress)
    approvalRecordKey = concat(approvalRecordKey, newOwnerAddress)
    approvalRecordRaw = getName(ctx, approvalRecordKey)

    if approvalRecordRaw == b'':
        print('transfer; no approval record, create one with approval from new owner')
        feesCollected = do_fee_collection(ctx, newOwnerAddress, NS_TRANSFER_FEE)
        if feesCollected:
            valueRaw = [False, True]
            value = serialize_array(valueRaw)
            putName(ctx, approvalRecordKey, value)
            return True
        return False

    print('approvalRecordRaw')
    # [{ownerAddressApproval: boolean}, {newOwnerAddress_approval: boolean}]
    approvalRecord = deserialize_bytearray(approvalRecordRaw)
    print('approvalRecord')
    ownerApproves = approvalRecord[0]
    print('ownerApproves')
    newOwnerApproves = approvalRecord[1]
    print('newOwnerApproves')

    # if not this format, gets error from compiler
    # [I 180307 16:44:24 pytoken:253] Op Not Converted: JUMP_IF_FALSE_OR_POP
    if ownerApproves == False:
        if newOwnerApproves == True:
            print('transfer; new owner pre approval already created, but waiting for current owner')
            return False

    # if not this format, gets error from compiler
    # [I 180307 16:44:24 pytoken:253] Op Not Converted: JUMP_IF_FALSE_OR_POP
    if ownerApproves == True:
        if newOwnerApproves == False:
            print('transfer; approval record exists and current owner pre approved transfer; execute transfer')
            feesCollected = do_fee_collection(ctx, newOwnerAddress, NS_TRANSFER_FEE)
            if feesCollected :
                print('feesCollected => do_transfer')
                deleteName(ctx, approvalRecordKey)
                return ns_do_transfer(ctx, name, ownerAddress, newOwnerAddress)

    return False

def postForSale(ctx, name, amount):
    print('postForSale')
    ownerAddress = getName(ctx, name)
    isOwnerAddress = CheckWitness(ownerAddress)

    if ownerAddress == b'':
        print('unregister; record does not exist')
        return False

    if isOwnerAddress == False:
        print('unregister; caller is not owner of record')
        return False

    if amount > 0:
        putName(ctx, concat('FORSALE', name), amount)

    return True

def queryForSale(ctx, name):
    return getName(ctx, concat('FORSALE', name))

def acceptSale(ctx, name, account):
    print('acceptSale')
    ownerAddress = getName(ctx, name)
    forSaleRecord = getName(ctx, concat('FORSALE', name))
    isCallerAddress = CheckWitness(account)

    if ownerAddress == b'':
        print('acceptSale; name record does not exist')
        return False

    if forSaleRecord == b'':
        print('acceptSale; for sales record does not exist')
        return False

    if isCallerAddress == False:
        print('acceptSale; caller is not same as transfer to')
        return False

    accountBalance = Get(ctx, account)
    requiredBalance = forSaleRecord + NS_REGISTER_FEE
    if requiredBalance <= accountBalance:
        feePaid = do_fee_collection(ctx, account, NS_REGISTER_FEE)
        saleAmountPaid = do_transfer(ctx, account, TOKEN_OWNER, forSaleRecord)
        deleteName(ctx, concat('FORSALE', name))
        return ns_do_transfer(ctx, name, ownerAddress, account)

    return False

def do_fee_collection(ctx, address, fee):
    feePaid = do_transfer(ctx, address, TOKEN_OWNER, fee)

    if not feePaid:
        print('Insufficient funds to pay registration fee')
        return False

    print('register; fees paid, record registration')
    return True


def ns_do_transfer(ctx, name, ownerAddress, newOwnerAddress):

    print('delete approval record key complated, not removing record from owner list')
    prevOwnerAddressNameList = getName(ctx, ownerAddress)
    if not prevOwnerAddressNameList:
        print('not possible')
        return False
    else:
        prevOwnerAddressNameList = deserialize_bytearray(prevOwnerAddressNameList)
        newList = removeItem(prevOwnerAddressNameList, name)

    if len(newList) == 0:
        deleteName(ctx, ownerAddress)
        # fails without this print statement?!?!?!
        print('')
    else:
        serializedList = serialize_array(newList)
        putName(ctx, ownerAddress, serializedList)


    print('removed record from prev owner list, about to add to new owner list')
    newOwnerAddressNameList = getName(ctx, newOwnerAddress)
    if newOwnerAddressNameList == b'':
        print('if not addressNameList')
        newOwnerAddressNameList = []
    else:
        newOwnerAddressNameList = deserialize_bytearray(newOwnerAddressNameList)

    newOwnerAddressNameList = newOwnerAddressNameList.append(name)
    serializedList = serialize_array(newOwnerAddressNameList)
    putName(ctx, newOwnerAddress, serializedList)


    print('name added to new owner list')
    putName(ctx, name, newOwnerAddress)

    return True


def ns_do_register(ctx, name, newOwnerAddress):
    # get current list of names for ownerAddress
    # append name to list
    # put list back
    # put name -> address record
    print('ns_do_register')
    addressNameList = getName(ctx, newOwnerAddress)
    if addressNameList == b'':
        print('if not addressNameList')
        addressNameList = [name]
    else:
        addressNameList = deserialize_bytearray(addressNameList)
        addressNameList = addItem(addressNameList, name)

    serializedList = serialize_array(addressNameList)
    putName(ctx, newOwnerAddress, serializedList)
    putName(ctx, name, newOwnerAddress)
    return True


def ns_do_unregister(ctx, name, ownerAddress):
    # get current list of names for ownerAddress
    # delete name from list
    # put list back
    # delete name -> address record
    print('ns_do_unregister')
    addressNameList = getName(ctx, ownerAddress)

    if addressNameList == b'':
        print('not possible')
        return False

    else:
        addressNameList = deserialize_bytearray(addressNameList)
        # previously used Array.remove function before python 3.6 neo-boa 0.3.7
        # however does not appear to be working anymore
        # addressNameList = addressNameList.remove(name)
        newList = removeItem(addressNameList, name)

    if len(newList) == 0:
        deleteName(ctx, ownerAddress)
        # fails without this print statement?!?!?!
        print('')
    else:
        serializedList = serialize_array(newList)
        putName(ctx, ownerAddress, serializedList)

    deleteName(ctx, name)
    return True


def putName(ctx, key, value):
    return Put(ctx, prefixStorageKey(key), value)


def getName(ctx, key):
    return Get(ctx,  prefixStorageKey(key))


def deleteName(ctx, key):
    return Delete(ctx, prefixStorageKey(key))


def prefixStorageKey(key):
    return concat(NS_STORAGE_PREFIX, key)
