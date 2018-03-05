from boa.interop.Neo.Runtime import GetTrigger, Notify, CheckWitness
from boa.interop.Neo.TriggerType import Application, Verification
from boa.interop.Neo.Storage import *
from hons.token.crowdsale import *
from hons.token.honstoken import *
from hons.token.nep5 import *
from hons.utils.transaction import *
from hons.nameservice import *

# input types 0710 (string, array)
# return type 05 (bytearray)
def Main(operation, args):

    # it's important to instanciate these in the start of the contract
    # I previously instancited each within each of the subfiles,
    # but started to run into issues executing the contract properly
    ctx = GetContext()
    trigger = GetTrigger()

    # In the case that a user sends NEO/GAS to this contract address
    # trigger will be set to Verification, and enter this flow
    if trigger == Verification():
        # In the case that the contract owner is sending or receiving
        # from the contract address, we will always approve
        # This allows the contract owner to manage assets received
        # by the contract
        if CheckWitness(TOKEN_OWNER):
            return True

        # Calls helper to pull transaction information in an object
        # Contains info like who the sender and recever is,
        # and how much neo/gas is attached
        attachments = get_asset_attachments()  # type:Attachments

        # users may also send neo/gas to the contract in the case of a
        # crowd sale. In this case we can handle their transactions of
        # whether or not to accept the amount or refund
        return can_exchange(ctx, attachments, True)

    # this is called when users invoke a contract directly
    elif trigger == Application():

        if operation != None:

            # handle all nep5 transactions first,
            # since these are commonly accepted operations we
            # do not want to prefix this like we are below for the nameServices

            for op in NEP5_METHODS:
                if operation == op:
                    return handle_nep51(ctx, operation, args)

            if operation == 'deploy':
                return deploy()

            elif operation == 'circulation':
                return get_circulation(ctx)

            # direct call to contract with neo/gas attached
            # if qualified, contract will receive accets and assign tokens
            elif operation == 'mintTokens':
                return exchange(ctx)

            # this is meant to be called by the contract owner not individual users
            # kyc registration will occur off chain, and owner will submit validation record to blockchain
            elif operation == 'crowdsale_register':
                return kyc_register(ctx, args)

            elif operation == 'crowdsale_status':
                return kyc_status(ctx, args)

            elif operation == 'crowdsale_available':
                return crowdsale_available_amount(ctx)

            elif len(args) <= 0 or args[0] == None:
                print('invalid operation')
                return False

            # this is an approach for handling sub contract modules
            # contract calls will be routed to their sub modules appropriately
            # with the first argument being the operation intended
            # for the sub modules method routing
            subOperation = args[0]
            args.remove(0)

            if operation == 'NameServiceInvoke':
                return handle_name_service(ctx, subOperation, args)

        return False

# called once after contract is imported to network
# This will kick off the initial tokens and put them into
# circulation under the contract owner
def deploy(ctx):
    """

    :param token: Token The token to deploy
    :return:
        bool: Whether the operation was successful
    """
    if not CheckWitness(TOKEN_OWNER):
        print("Must be owner to deploy")
        return False

    print("deploy; Storage")
    if not Get(ctx, 'initialized'):
        print("deploy; initialized")

        # do deploy logic
        Put(ctx, 'initialized', 1)
        Put(TOKEN_OWNER, TOKEN_INITIAL_AMOUNT)
        return add_to_circulation(ctx, TOKEN_INITIAL_AMOUNT)

    return False
