from boa.interop.Neo.Blockchain import GetHeight
from boa.interop.Neo.Action import RegisterAction
from boa.interop.Neo.Runtime import Notify,CheckWitness
from boa.interop.Neo.Storage import *
from boa.code.builtins import concat
from hons.token.honstoken import *

from hons.utils.transaction import Attachments,get_asset_attachments

OnTransfer = RegisterAction('transfer', 'from', 'to', 'amount')
OnRefund = RegisterAction('refund', 'to', 'amount')

OnInvalidKYCAddress = RegisterAction('invalid_registration','address')
OnKYCRegister = RegisterAction('kyc_registration','address')


def kyc_register(ctx, args):
    """

    :param args:list a list of addresses to register
    :param token:Token A token object with your ICO settings
    :return:
        int: The number of addresses to register for KYC
    """
    ok_count = 0

    if CheckWitness(TOKEN_OWNER):

        for address in args:

            if len(address) == 20:

                kyc_storage_key = concat(KYC_KEY, address)
                Put(ctx, kyc_storage_key, True)

                OnKYCRegister(address)
                ok_count += 1

    return ok_count


def kyc_status(ctx, args):
    """
    Gets the KYC Status of an address

    :param args:list a list of arguments
    :return:
        bool: Returns the kyc status of an address
    """

    if len(args) > 0:
        addr = args[0]

        kyc_storage_key = concat(KYC_KEY, addr)

        return Get(ctx, kyc_storage_key)

    return False



def exchange(ctx):
    """

    :param token:Token The token object with NEP5/sale settings
    :return:
        bool: Whether the exchange was successful
    """

    attachments = get_asset_attachments()  # type:  Attachments
    receiver_addr = attachments[0]
    sender_addr = attachments[1]
    neo_attached = attachments[2]
    gas_attached = attachments[3]

    # this looks up whether the exchange can proceed
    can_exchange = can_exchange(ctx, attachments, False)

    if not can_exchange:
        print("Cannot exchange value")
        # This should only happen in the case that there are a lot of TX on the final
        # block before the total amount is reached.  An amount of TX will get through
        # the verification phase because the total amount cannot be updated during that phase
        # because of this, there should be a process in place to manually refund tokens
        if neo_attached > 0:
            OnRefund(sender_addr, neo_attached)
        # if you want to exchange gas instead of neo, use this
        if gas_attached > 0:
           OnRefund(sender_addr, gas_attached)
        return False


    # lookup the current balance of the address
    current_balance = Get(ctx, sender_addr)

    # calculate the amount of tokens the attached neo will earn
    exchanged_tokens = neo_attached * TOKENS_PER_NEO / 100000000

    # if you want to exchange gas instead of neo, use this
    exchanged_tokens += gas_attached * TOKENS_PER_GAS / 100000000


    # add it to the the exchanged tokens and persist in storage
    new_total = exchanged_tokens + current_balance
    Put(ctx, sender_addr, new_total)

    # update the in circulation amount
    add_to_circulation(ctx, exchanged_tokens)

    # dispatch transfer event
    OnTransfer(receiver_addr, sender_addr, exchanged_tokens)

    return True


def can_exchange(ctx, attachments, verify_only: bool) -> bool:
    """
    Determines if the contract invocation meets all requirements for the ICO exchange
    of neo or gas into NEP5 Tokens.
    Note: This method can be called via both the Verification portion of an SC or the Application portion

    When called in the Verification portion of an SC, it can be used to reject TX that do not qualify
    for exchange, thereby reducing the need for manual NEO or GAS refunds considerably

    :param token:Token A token object with your ICO settings
    :param attachments:Attachments An attachments object with information about attached NEO/Gas assets
    :param storage:StorageAPI A StorageAPI object for storage interaction
    :return:
        bool: Whether an invocation meets requirements for exchange
    """

    print('can_exchange')

    receiver_addr = attachments[0]
    sender_addr = attachments[1]
    neo_attached = attachments[2]
    gas_attached = attachments[3]

    if gas_attached == 0 and neo_attached == 0:
        print("no neo or gas attached")
        return False

    # if you are accepting gas, use this
   # if gas_attached == 0:
   #     print("no gas attached")
   #     return False

    # if youre accepting neo, use this
    # if neo_attached == 0:
    #     print("no neo attached")
    #     return False

    # the following looks up whether an address has been
    # registered with the contract for KYC regulations
    # this is not required for operation of the contract

    # turned off for testnet competition deploy
    #status = self.get_kyc_status(sender_addr, storage)
    # if not self.get_kyc_status(sender_addr, storage):
    #     return False

    #print("Will check can exchange") # @TODO [Compiler FIX] removing this print statement breaks the execution of this method in v 0.2.0 and below
    #                                    @TODO Fixed in version 0.2.1


    # caluclate the amount requested
    amount_requested = neo_attached * TOKENS_PER_NEO / 100000000

    # this would work for accepting gas
    amount_requested += gas_attached * TOKENS_PER_GAS / 100000000

    can_exchange = calculate_can_exchange(ctx, amount_requested, sender_addr, verify_only)

    return can_exchange


def get_kyc_status(ctx, address):
    """
    Looks up the KYC status of an address

    :param address:bytearray The address to lookup
    :param storage:StorageAPI A StorageAPI object for storage interaction
    :return:
        bool: KYC Status of address
    """
    kyc_storage_key = concat(KYC_KEY, address)

    return Get(ctx, kyc_storage_key)


def calculate_can_exchange(ctx, amount: int, address, verify_only: bool):
    """
    Perform custom token exchange calculations here.

    :param token:Token The token settings for the sale
    :param amount:int Number of tokens to convert from asset to tokens
    :param address:bytearray The address to mint the tokens to
    :return:
        bool: Whether or not an address can exchange a specified amount
    """
    height = GetHeight()

    current_in_circulation = Get(ctx, TOKEN_CIRC_KEY)

    new_amount = current_in_circulation + amount

    if new_amount > TOTAL_SUPPLY:
        print("amount greater than total supply")
        return False

    print("trying to calculate height????")
    if height < BLOCK_SALE_START:
        print("sale not begun yet")
        return False

    # if we are in free round, any amount
    if height > LIMITED_ROUND_END:
        print("Free for all, accept as much as possible")
        return True

    # check amount in limited round

    if amount <= MAX_EXCHANGE_LIMITED_ROUND:

        # check if they have already exchanged in the limited round
        r1key = concat(address, LIMITED_ROUND_KEY)

        amount_exchanged = Get(ctx, r1key)

        # updated to allow users to exchange as many times
        # as they want in the limit round up to their maximum
        new_exchanged_amount = amount + amount_exchanged

        # as long as they have not already exchanged more than the limited round amount
        if new_exchanged_amount <= MAX_EXCHANGE_LIMITED_ROUND:
            # note that this method can be invoked during the Verification trigger, so we have the
            # verify_only param to avoid the Storage.Put during the read-only Verification trigger.
            # this works around a "method Neo.Storage.Put not found in ->" error in InteropService.py
            # since Verification is read-only and thus uses a StateReader, not a StateMachine
            if not verify_only:
                Put(ctx, r1key, new_exchanged_amount)
            return True

        print("already exchanged in limited round")
        return False

    print("too much for limited round")
    return False
