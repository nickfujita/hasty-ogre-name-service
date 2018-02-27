from boa.blockchain.vm.Neo.Runtime import CheckWitness, Notify
from hons.utils.storage import StorageAPI
from hons.token.nep5 import NEP5Handler
from hons.token.honstoken import Token
from hons.utils.serialization import deserialize_bytearray, serialize_array, serialize_var_length_item

class NameService():

    register_fee = 10 * 100000000  # 10 to owners * 10^8
    transfer_fee = 5 * 100000000   # 5 to owners * 10^8
    storagePrefix = 'NAMESERVICE'

    def invoke(self, operation, args, nep5: NEP5Handler, token: Token, storage: StorageAPI):

        arg_error = 'Incorrect Arg Length'

        Notify(args)

        # retreive the address associated with a given name
        # anyone can call
        if operation == 'query':
            if len(args) != 1:
                return arg_error

            name = args[0]
            return self.query(storage, name)

        # retreive a list of names associated with this address
        # anyone can call
        # output: array as bytearray
        if operation == 'queryAddress':
            if len(args) != 1:
                return arg_error

            address = args[0]
            return self.queryAddress(storage, address)

        # remove a link between a given name and it's address
        # can only be called by name owner
        if operation == 'unregister':
            if len(args) != 1:
                return arg_error

            name = args[0]
            return self.unregister(storage, name)

        # create a name to address association for a small fee
        # can only be called by owner of address being registered
        if operation == 'register':
            if len(args) != 2:
                return arg_error

            name = args[0]
            ownerAddress = args[1]
            return self.register(storage, token, nep5, name, ownerAddress)

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
            return self.transfer(storage, token, nep5, name, ownerAddress, newOwnerAddress)


    def query(self, storage: StorageAPI, name):
        return self.getName(storage, name)


    def queryAddress(self, storage: StorageAPI, address):
        serializedList = self.getName(storage, address)
        addressNameList = deserialize_bytearray(serializedList)
        return addressNameList


    def unregister(self, storage: StorageAPI, name):
        ownerAddress = self.getName(storage, name)
        isOwnerAddress = CheckWitness(ownerAddress)

        if not ownerAddress:
            print('unregister; record does not exist')
            return False

        if not isOwnerAddress:
            print('unregister; caller is not owner of record')
            return False

        print('self')
        return self.do_unregister(storage, name, ownerAddress)


    def register(self, storage: StorageAPI, token: Token, nep5: NEP5Handler, name, ownerAddress):
        isOwnerAddress = CheckWitness(ownerAddress)
        currentOwnerAddress = self.getName(storage, name)

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
        transferArgs = [ownerAddress, token.owner, self.register_fee]
        feePaid = nep5.handle_nep51('transfer', transferArgs, token, storage)

        if not feePaid:
            print('Insufficient funds to pay registration fee')
            return False

        print('register; fees paid, record registration')
        return self.do_register(storage, name, ownerAddress)


    def transfer(self, storage: StorageAPI, token: Token, nep5: NEP5Handler, name, ownerAddress, newOwnerAddress):
        print('transfer')
        isOwnerAddress = CheckWitness(ownerAddress)
        isNewOwnerAddress = CheckWitness(newOwnerAddress)
        currentOwnerAddress = self.getName(storage, name)
        approvalRecordKey = concat(name, ownerAddress, newOwnerAddress)
        print('approvalRecordKey')
        print(approvalRecordKey)
        approvalRecordRaw = self.getName(storage, approvalRecordKey)

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
                feesCollected = self.do_fee_collection(storage, token, nep5, ownerAddress, self.transfer_fee)
                if feesCollected:
                    valueRaw = [True, False]
                    value = serialize_array(valueRaw)
                    return self.putName(storage, approvalRecordKey, value)
                return False

            elif ownerApproves and not newOwnerApproves:
                print('transfer; owner pre approval already created, but waiting for new owner')
                return False

            elif not ownerApproves and newOwnerApproves:
                print('transfer; approval record exists and new owner pre approved transfer; execute transfer')
                feesCollected = self.do_fee_collection(storage, token, nep5, ownerAddress, self.transfer_fee)
                if feesCollected:
                    return self.do_transfer(storage, name, ownerAddress, newOwnerAddress, approvalRecordKey)
                return False

        elif isNewOwnerAddress:
            print('transfer; contract caller is new owner')

            if not approvalRecord:
                print('transfer; no approval record, create one with approval from new owner')
                feesCollected = self.do_fee_collection(storage, token, nep5, newOwnerAddress, self.transfer_fee)
                if feesCollected:
                    valueRaw = [False, True]
                    value = serialize_array(valueRaw)
                    return self.putName(storage, approvalRecordKey, value)
                return False

            if not ownerApproves and newOwnerApproves:
                print('transfer; new owner pre approval already created, but waiting for current owner')
                return False

            if ownerApproves and not newOwnerApproves:
                print('transfer; approval record exists and current owner pre approved transfer; execute transfer')
                feesCollected = self.do_fee_collection(storage, token, nep5, newOwnerAddress, self.transfer_fee)
                if feesCollected:
                    print('feesCollected => do_transfer')
                    print(approvalRecordKey)
                    return self.do_transfer(storage, name, ownerAddress, newOwnerAddress, approvalRecordKey)
                return False

        return False


    def do_fee_collection(self, storage: StorageAPI, token: Token, nep5: NEP5Handler, address, fee):
        transferArgs = [address, token.owner, fee]
        feePaid = nep5.handle_nep51('transfer', transferArgs, token, storage)

        if not feePaid:
            print('Insufficient funds to pay registration fee')
            return False

        print('register; fees paid, record registration')
        return True


    def do_transfer(self, storage: StorageAPI, name, ownerAddress, newOwnerAddress, approvalRecordKey):
        # print('do_transfer')
        # print(approvalRecordKey)
        # didDeleteRecordKey = self.deleteName(storage, approvalRecordKey)
        # print('do_transfer; delete approvalRecordKey completed')
        # didUnregisterOriginalOwner = self.do_unregister(storage, name, ownerAddress)
        # print('do_transfer; unregister completed')
        # didRegisterNewOwner = self.do_register(storage, name, newOwnerAddress)
        # print('do_transfer; register completed')
        # return didDeleteRecordKey and didUnregisterOriginalOwner and didRegisterNewOwner

        didDeleteApprovalKey = self.deleteName(storage, approvalRecordKey)

        print('delete approval record key complated, not removing record from owner list')
        prevOwnerAddressNameList = self.getName(storage, ownerAddress)
        if not prevOwnerAddressNameList:
            print('not possible')
            return False
        else:
            prevOwnerAddressNameList = deserialize_bytearray(prevOwnerAddressNameList)
            prevOwnerAddressNameList = prevOwnerAddressNameList.remove(name)

        if len(prevOwnerAddressNameList) == 0:
            didUpdatePrevOwnerList = self.deleteName(storage, ownerAddress)
            # fails without this print statement?!?!?!
            print('')
        else:
            serializedList = serialize_array(prevOwnerAddressNameList)
            didUpdatePrevOwnerList = self.putName(storage, ownerAddress, serializedList)


        print('removed record from prev owner list, about to add to new owner list')
        newOwnerAddressNameList = self.getName(storage, newOwnerAddress)
        if not newOwnerAddressNameList:
            print('if not addressNameList')
            newOwnerAddressNameList = []
        else:
            newOwnerAddressNameList = deserialize_bytearray(newOwnerAddressNameList)

        newOwnerAddressNameList = newOwnerAddressNameList.append(name)
        serializedList = serialize_array(newOwnerAddressNameList)
        didUpdateNewOwnerList = self.putName(storage, newOwnerAddress, serializedList)


        print('name added to new owner list')
        didOverwriteNameRecord = self.putName(storage, name, newOwnerAddress)

        return didDeleteApprovalKey and didUpdatePrevOwnerList and didUpdateNewOwnerList and didOverwriteNameRecord


    def do_register(self, storage: StorageAPI, name, newOwnerAddress):
        # get current list of names for ownerAddress
        # append name to list
        # put list back
        # put name -> address record
        print('do_register')
        addressNameList = self.getName(storage, newOwnerAddress)
        if not addressNameList:
            print('if not addressNameList')
            addressNameList = []
        else:
            addressNameList = deserialize_bytearray(addressNameList)

        addressNameList = addressNameList.append(name)
        serializedList = serialize_array(addressNameList)
        putListSuccess = self.putName(storage, newOwnerAddress, serializedList)
        putNameSuccess = self.putName(storage, name, newOwnerAddress)
        return putListSuccess and putNameSuccess


    def do_unregister(self, storage: StorageAPI, name, ownerAddress):
        # get current list of names for ownerAddress
        # delete name from list
        # put list back
        # delete name -> address record
        print('do_unregister')
        addressNameList = self.getName(storage, ownerAddress)
        if not addressNameList:
            print('not possible')
            return False
        else:
            addressNameList = deserialize_bytearray(addressNameList)
            addressNameList = addressNameList.remove(name)

        if len(addressNameList) == 0:
            updateListSuccess = self.deleteName(storage, ownerAddress)
            # fails without this print statement?!?!?!
            print('')
        else:
            serializedList = serialize_array(addressNameList)
            updateListSuccess = self.putName(storage, ownerAddress, serializedList)

        deleteNameSuccess = self.deleteName(storage, name)
        return updateListSuccess and deleteNameSuccess


    def putName(self, storage: StorageAPI, key, value):
        print('putName')
        prefixedKey = self.prefixStorageKey(key)
        print(prefixedKey)
        print(key)
        sucess = storage.put(prefixedKey, value)
        print('sucess')
        print(sucess)
        return True


    def getName(self, storage: StorageAPI, key):
        print('getName')
        prefixedKey = self.prefixStorageKey(key)
        print('prefixedKey')
        print(prefixedKey)
        obj = storage.get(prefixedKey)
        Notify(obj)
        return obj


    def deleteName(self, storage: StorageAPI, key):
        print('deleteName')
        prefixedKey = self.prefixStorageKey(key)
        print('prefixedKey')
        storage.delete(prefixedKey)
        print('deleteName; done delete')
        return True


    def prefixStorageKey(self, key):
        print('prefixStorageKey')
        print(key)
        cat = concat(self.storagePrefix, key)
        print(self.storagePrefix)
        print(cat)
        return cat
