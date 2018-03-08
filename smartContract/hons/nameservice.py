from boa.interop.Neo.Runtime import CheckWitness, Notify
from boa.interop.Neo.Storage import *
from hons.token.nep5 import *
from hons.token.honstoken import *
from hons.utils.serialization import *

NS_REGISTER_FEE = 10 * 100_000_000  # 10 to owners * 10^8
NS_TRANSFER_FEE = 5 * 100_000_000   # 5 to owners * 10^8
NS_STORAGE_PREFIX = 'NAMESERVICE'

def handle_name_service(ctx, operation, args):

    arg_error = 'Incorrect Arg Length'

    # retreive the address associated with a given name
    # anyone can call
    if operation == 'query':
        if len(args) != 1:
            return arg_error

        name = args[0]
        return query(ctx, name)

    # retreive a list of names associated with this address
    # anyone can call
    # output: array as bytearray
    if operation == 'queryAddress':
        if len(args) != 1:
            return arg_error

        address = args[0]
        return queryAddress(ctx, address)

    # remove a link between a given name and it's address
    # can only be called by name owner
    if operation == 'unregister':
        if len(args) != 1:
            return arg_error

        name = args[0]
        return unregister(ctx, name)

    # create a name to address association for a small fee
    # can only be called by owner of address being registered
    if operation == 'register':
        print('register;')
        print(len(args))
        if len(args) != 2:
            return arg_error

        name = args[0]
        ownerAddress = args[1]
        return register(ctx, name, ownerAddress)

    # transfer of a name from owner to a new address
    # needs to be called twice, once by owner, and once by requester
    # first one to call creates transfer agreement
    # secong one to call finalizes transfer agreement, and transfer is executed
    # if both parties to not fulfil agreement, transfer will not take place
    if operation == 'transfer':
        if len(args) != 3:
            return arg_error

        name = args[0]
        ownerAddress = args[1]
        newOwnerAddress = args[2]
        return transfer(ctx, name, ownerAddress, newOwnerAddress)

    if operation == 'preApproveTransfer':
        if len(args) != 3:
            return arg_error

        name = args[0]
        ownerAddress = args[1]
        newOwnerAddress = args[2]
        return preApproveTransfer(ctx, name, ownerAddress, newOwnerAddress)

    if operation == 'requestTransfer':
        if len(args) != 3:
            return arg_error

        name = args[0]
        ownerAddress = args[1]
        newOwnerAddress = args[2]
        return requestTransfer(ctx, name, ownerAddress, newOwnerAddress)


def query(ctx, name):
    return getName(ctx, name)


def queryAddress(ctx, address):
    serializedList = getName(ctx, address)
    addressNameList = deserialize_bytearray(serializedList)
    return addressNameList


def unregister(ctx, name):
    ownerAddress = getName(ctx, name)
    isOwnerAddress = CheckWitness(ownerAddress)

    if not ownerAddress:
        print('unregister; record does not exist')
        return False

    if not isOwnerAddress:
        print('unregister; caller is not owner of record')
        return False

    return do_unregister(ctx, name, ownerAddress)


def register(ctx, name, ownerAddress):
    isOwnerAddress = CheckWitness(ownerAddress)
    currentOwnerAddress = getName(ctx, name)

    if not isOwnerAddress:
        print('register; contract caller is not same as ownerAddress')
        return False

    if currentOwnerAddress:
        if currentOwnerAddress == ownerAddress:
            print('register; name is already registered to caller address')
        else:
            print('register; name is already registered to another address')
        return False

    print('register; all qualifications are met, about to pay fee')
    transferArgs = [ownerAddress, TOKEN_OWNER, NS_REGISTER_FEE]
    feePaid = handle_nep51(ctx, 'transfer', transferArgs)

    if not feePaid:
        print('Insufficient funds to pay registration fee')
        return False

    print('register; fees paid, record registration')
    return do_register(ctx, name, ownerAddress)

def preApproveTransfer(ctx, name, ownerAddress, newOwnerAddress):
    print('preApproveTransfer')

    if ownerAddress == newOwnerAddress:
        print('transfer; ownerAddress and newOwnerAddress are the same')
        return False

    if not CheckWitness(ownerAddress):
        print('transfer; contract caller is not same as ownerAddress or newOwnerAddress')
        return False

    currentOwnerAddress = getName(ctx, name)
    if not currentOwnerAddress:
        print('transfer; name record is empty, please register instead')
        return False

    if currentOwnerAddress != ownerAddress:
        print('transfer; contract caller is not owner of name record')
        return False

    approvalRecordKey = concat(name, ownerAddress, newOwnerAddress)
    approvalRecordRaw = getName(ctx, approvalRecordKey)

    if not approvalRecordRaw:
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

    # if ownerApproves != None and newOwnerApproves == None:
    #     print('transfer; owner pre approval already created, but waiting for new owner')
    #     return False

    if ownerApproves == None and newOwnerApproves != None:
        print('transfer; approval record exists and new owner pre approved transfer; execute transfer')
        feesCollected = do_fee_collection(ctx, ownerAddress, NS_TRANSFER_FEE)
        if feesCollected:
            return do_transfer(ctx, name, ownerAddress, newOwnerAddress, approvalRecordKey)
        return False

    return False

def requestTransfer(ctx, name, ownerAddress, newOwnerAddress):
    print('transfer')
    isNewOwnerAddress = CheckWitness(newOwnerAddress)

    if not isNewOwnerAddress:
        print('transfer; contract caller is not the same as new owner')
        return False

    currentOwnerAddress = getName(ctx, name)

    if not currentOwnerAddress:
        print('transfer; name record is empty, please register instead')
        return False

    approvalRecordKey = concat(name, ownerAddress, newOwnerAddress)
    approvalRecordRaw = getName(ctx, approvalRecordKey)

    if not approvalRecordRaw:
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

    if not ownerApproves and newOwnerApproves:
        print('transfer; new owner pre approval already created, but waiting for current owner')
        return False

    # if not this format, gets error from compiler
    # [I 180307 16:44:24 pytoken:253] Op Not Converted: JUMP_IF_FALSE_OR_POP
    if ownerApproves:
        if not newOwnerApproves:
            print('transfer; approval record exists and current owner pre approved transfer; execute transfer')
            feesCollected = do_fee_collection(ctx, newOwnerAddress, NS_TRANSFER_FEE)
            if feesCollected :
                print('feesCollected => do_transfer')
                print(approvalRecordKey)
                return do_transfer(ctx, name, ownerAddress, newOwnerAddress, approvalRecordKey)

    return False


def transfer(ctx, name, ownerAddress, newOwnerAddress):
    Notify('DEPRECATED: please use preApproveTransfer when calling from name owner and requestTransfer when calling from requester. This consolidated transfer operation is too heavy')
    print('transfer')
    isOwnerAddress = CheckWitness(ownerAddress)
    isNewOwnerAddress = CheckWitness(newOwnerAddress)
    currentOwnerAddress = getName(ctx, name)
    approvalRecordKey = concat(name, ownerAddress, newOwnerAddress)
    print('approvalRecordKey')
    print(approvalRecordKey)
    approvalRecordRaw = getName(ctx, approvalRecordKey)

    if approvalRecordRaw:
        print('approvalRecordRaw')
        # [{ownerAddressApproval: boolean}, {newOwnerAddress_approval: boolean}]
        approvalRecord = deserialize_bytearray(approvalRecordRaw)
        print('approvalRecord')
        ownerApproves = approvalRecord[0]
        print('ownerApproves')
        newOwnerApproves = approvalRecord[1]
        print('newOwnerApproves')

    if not currentOwnerAddress:
        print('transfer; name record is empty, please register instead')
        return False

    elif not isOwnerAddress and not isNewOwnerAddress:
        print('transfer; contract caller is not same as ownerAddress or newOwnerAddress')
        return False

    elif isOwnerAddress:
        print('transfer; contract caller is owner')

        if currentOwnerAddress != ownerAddress:
            print('transfer; contract caller is not owner of name record')
            return False

        elif not approvalRecord:
            print('transfer; no approval record, create one with approval from owner')
            feesCollected = do_fee_collection(ctx, ownerAddress, NS_TRANSFER_FEE)
            if feesCollected:
                valueRaw = [True, False]
                value = serialize_array(valueRaw)
                putName(ctx, approvalRecordKey, value)
                return True
            return False

        elif ownerApproves and not newOwnerApproves:
            print('transfer; owner pre approval already created, but waiting for new owner')
            return False

        elif not ownerApproves and newOwnerApproves:
            print('transfer; approval record exists and new owner pre approved transfer; execute transfer')
            feesCollected = do_fee_collection(ctx, ownerAddress, NS_TRANSFER_FEE)
            if feesCollected:
                return do_transfer(ctx, name, ownerAddress, newOwnerAddress, approvalRecordKey)
            return False

    elif isNewOwnerAddress:
        print('transfer; contract caller is new owner')

        if not approvalRecord:
            print('transfer; no approval record, create one with approval from new owner')
            feesCollected = do_fee_collection(ctx, newOwnerAddress, NS_TRANSFER_FEE)
            if feesCollected:
                valueRaw = [False, True]
                value = serialize_array(valueRaw)
                putName(ctx, approvalRecordKey, value)
                return True
            return False

        if not ownerApproves and newOwnerApproves:
            print('transfer; new owner pre approval already created, but waiting for current owner')
            return False

        if ownerApproves and not newOwnerApproves:
            print('transfer; approval record exists and current owner pre approved transfer; execute transfer')
            feesCollected = do_fee_collection(ctx, newOwnerAddress, NS_TRANSFER_FEE)
            if feesCollected:
                print('feesCollected => do_transfer')
                print(approvalRecordKey)
                return do_transfer(ctx, name, ownerAddress, newOwnerAddress, approvalRecordKey)
            return False

    return False


def do_fee_collection(ctx, address, fee):
    transferArgs = [address, TOKEN_OWNER, fee]
    feePaid = handle_nep51(ctx, 'transfer', transferArgs)

    if not feePaid:
        print('Insufficient funds to pay registration fee')
        return False

    print('register; fees paid, record registration')
    return True


def do_transfer(ctx, name, ownerAddress, newOwnerAddress, approvalRecordKey):

    deleteName(ctx, approvalRecordKey)

    print('delete approval record key complated, not removing record from owner list')
    prevOwnerAddressNameList = getName(ctx, ownerAddress)
    if not prevOwnerAddressNameList:
        print('not possible')
        return False
    else:
        prevOwnerAddressNameList = deserialize_bytearray(prevOwnerAddressNameList)
        prevOwnerAddressNameList = prevOwnerAddressNameList.remove(name)

    if len(prevOwnerAddressNameList) == 0:
        deleteName(ctx, ownerAddress)
        # fails without this print statement?!?!?!
        print('')
    else:
        serializedList = serialize_array(prevOwnerAddressNameList)
        putName(ctx, ownerAddress, serializedList)


    print('removed record from prev owner list, about to add to new owner list')
    newOwnerAddressNameList = getName(ctx, newOwnerAddress)
    if not newOwnerAddressNameList:
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


def do_register(ctx, name, newOwnerAddress):
    # get current list of names for ownerAddress
    # append name to list
    # put list back
    # put name -> address record
    print('do_register')
    addressNameList = getName(ctx, newOwnerAddress)
    if not addressNameList:
        print('if not addressNameList')
        addressNameList = []
    else:
        addressNameList = deserialize_bytearray(addressNameList)

    addressNameList = addressNameList.append(name)
    serializedList = serialize_array(addressNameList)
    putName(ctx, newOwnerAddress, serializedList)
    putName(ctx, name, newOwnerAddress)
    return True


def do_unregister(ctx, name, ownerAddress):
    # get current list of names for ownerAddress
    # delete name from list
    # put list back
    # delete name -> address record
    print('do_unregister')
    addressNameList = getName(ctx, ownerAddress)
    if not addressNameList:
        print('not possible')
        return False
    else:
        addressNameList = deserialize_bytearray(addressNameList)
        addressNameList = addressNameList.remove(name)

    if len(addressNameList) == 0:
        deleteName(ctx, ownerAddress)
        # fails without this print statement?!?!?!
        print('')
    else:
        serializedList = serialize_array(addressNameList)
        putName(ctx, ownerAddress, serializedList)

    deleteName(ctx, name)
    return True


def putName(ctx, key, value):
    prefixedKey = prefixStorageKey(key)
    Put(ctx, prefixedKey, value)


def getName(ctx, key):
    prefixedKey = prefixStorageKey(key)
    obj = Get(ctx, prefixedKey)
    return obj


def deleteName(ctx, key):
    prefixedKey = prefixStorageKey(key)
    Delete(ctx, prefixedKey)


def prefixStorageKey(key):
    cat = concat(NS_STORAGE_PREFIX, key)
    return cat
