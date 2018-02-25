from boa.blockchain.vm.Neo.Runtime import GetTrigger, Notify, CheckWitness
from boa.blockchain.vm.Neo.TriggerType import Application, Verification
from hons.utils.storage import StorageAPI
from hons.token.honstoken import Token
from hons.utils.transaction import Attachments,get_asset_attachments
from hons.token.nep5 import NEP5Handler
from hons.token.crowdsale import Crowdsale
from hons.nameservice import NameService

# input types 0710 (string, array)
# return type 05 (bytearray)
def Main(operation, args):

    # it's important to instanciate these in the start of the contract
    # I previously instancited each within each of the subfiles,
    # but started to run into issues executing the contract properly
    trigger = GetTrigger()
    token = Token()
    storage = StorageAPI()

    # In the case that a user sends NEO/GAS to this contract address
    # trigger will be set to Verification, and enter this flow
    if trigger == Verification:
        # In the case that the contract owner is sending or receiving
        # from the contract address, we will always approve
        # This allows the contract owner to manage assets received
        # by the contract
        is_owner = CheckWitness(token.owner)
        if is_owner:
            return True

        # Calls helper to pull transaction information in an object
        # Contains info like who the sender and recever is,
        # and how much neo/gas is attached
        attachments = get_asset_attachments()  # type:Attachments

        # users may also send neo/gas to the contract in the case of a
        # crowd sale. In this case we can handle their transactions of
        # whether or not to accept the amount or refund
        crowdsale = Crowdsale()
        return crowdsale.can_exchange(token, attachments, storage, True)

    # this is called when users invoke a contract directly
    elif trigger == Application:

        if operation != None:

            # handle all nep5 transactions first,
            # since these are commonly accepted operations we
            # do not want to prefix this like we are below for the nameServices
            nep = NEP5Handler()

            for op in nep.get_methods():
                if operation == op:
                    return nep.handle_nep51(operation, args, token, storage)

            if operation == 'deploy':
                return deploy(token, storage)

            if operation == 'circulation':
                return token.get_circulation(storage)

            sale = Crowdsale()

            # direct call to contract with neo/gas attached
            # if qualified, contract will receive accets and assign tokens
            if operation == 'mintTokens':
                return sale.exchange(token, storage)

            # this is meant to be called by the contract owner not individual users
            # kyc registration will occur off chain, and owner will submit validation record to blockchain
            if operation == 'crowdsale_register':
                return sale.kyc_register(token, storage, args)

            if operation == 'crowdsale_status':
                return sale.kyc_status(storage, args)

            if operation == 'crowdsale_available':
                return token.crowdsale_available_amount(storage)

            if len(args) <= 0 or args[0] == None:
                print('invalid operation')
                return False

            # this is an approach for handling sub contract modules
            # contract calls will be routed to their sub modules appropriately
            # with the first argument being the operation intended
            # for the sub modules method routing
            subOperation = args[0]
            args.remove(0)

            if operation == 'NameServiceInvoke':
                nameService = NameService()
                return nameService.invoke(subOperation, args, nep, token, storage)

        return False

# called once after contract is imported to network
# This will kick off the initial tokens and put them into
# circulation under the contract owner
def deploy(token: Token, storage: StorageAPI):
    """

    :param token: Token The token to deploy
    :return:
        bool: Whether the operation was successful
    """
    if not CheckWitness(token.owner):
        print("Must be owner to deploy")
        return False

    print("deploy; Storage")
    if not storage.get('initialized'):
        print("deploy; initialized")

        # do deploy logic
        storage.put('initialized', 1)
        storage.put(token.owner, token.initial_amount)
        token.add_to_circulation(token.initial_amount, storage)

        return True

    return False
