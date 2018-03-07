from boa.interop.Neo.Storage import *

"""
Basic settings for an NEP5 Token and crowdsale
"""

def TOKEN_NAME():
    return 'Hasty Ogre Name Service Token'

def TOKEN_SYMBOL():
    return 'HONS'

def TOKEN_DECIMALS():
    return 8

# This is the script hash of the address for the owner of the token
# This can be found in ``neo-python`` with the walet open, use ``wallet`` command
def TOKEN_OWNER():
    return b'#\xba\'\x03\xc52c\xe8\xd6\xe5"\xdc2 39\xdc\xd8\xee\xe9'

def TOKEN_CIRC_KEY():
    return b'in_circulation'

def TOKEN_TOTAL_SUPPLY():
    return 100_000_000 * 100_000_000  # 10m total supply * 10^8 ( decimals)

def TOKEN_INITIAL_AMOUNT():
    return 3_000_000 * 100_000_000  # 2.5m to owners * 10^8

# for now assume 1 dollar per token, and one neo = 40 dollars * 10^8
def TOKENS_PER_NEO():
    return 400 * 100_000_000

# for now assume 1 dollar per token, and one gas = 20 dollars * 10^8
def TOKENS_PER_GAS():
    return 200 * 100_000_000

# maximum amount you can mint in the limited round ( 500 neo/person * 400 Tokens/NEO * 10^8 )
def MAX_EXCHANGE_LIMITED_ROUND():
    return 500 * 400 * 100_000_000

# when to start the crowdsale
def BLOCK_SALE_START():
    return 900

# when to end the initial limited round
# NEVER, not that it matters on testnet since people can make new addresses
# and kyc is disabled in this contract
def LIMITED_ROUND_END():
    return 999999999999

def KYC_KEY():
    return b'kyc_ok'

def LIMITED_ROUND_KEY():
    return b'r1'

def crowdsale_available_amount(ctx):
    """

    :return: int The amount of tokens left for sale in the crowdsale
    """

    in_circ = Get(ctx, TOKEN_CIRC_KEY())

    available = TOKEN_TOTAL_SUPPLY() - in_circ

    return available


def add_to_circulation(ctx, amount):
    """
    Adds an amount of token to circlulation

    :param amount: int the amount to add to circulation
    :param storage:StorageAPI A StorageAPI object for storage interaction
    """
    current_supply = Get(ctx, TOKEN_CIRC_KEY())

    current_supply += amount

    Put(ctx, TOKEN_CIRC_KEY(), current_supply)


def get_circulation(ctx):
    """
    Get the total amount of tokens in circulation

    :param storage:StorageAPI A StorageAPI object for storage interaction
    :return:
        int: Total amount in circulation
    """
    return Get(ctx, TOKEN_CIRC_KEY())
