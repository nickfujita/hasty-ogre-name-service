from boa.interop.Neo.Storage import *

"""
Basic settings for an NEP5 Token and crowdsale
"""

TOKEN_NAME = 'Hasty Ogre Name Service Token'

TOKEN_SYMBOL = 'HONS'

TOKEN_DECIMALS = 8

# This is the script hash of the address for the owner of the token
# This can be found in ``neo-python`` with the walet open, use ``wallet`` command
TOKEN_OWNER = b'#\xba\'\x03\xc52c\xe8\xd6\xe5"\xdc2 39\xdc\xd8\xee\xe9'
# TOKEN_OWNER = b'\xfe\xc0BGnq\xfc\x9f\xdb_d+\x12\x94\xec\x85[\x17\x0f\xf9'

TOKEN_CIRC_KEY = b'in_circulation'

TOKEN_TOTAL_SUPPLY = 100_000_000 * 100_000_000  # 10m total supply * 10^8 ( decimals)

TOKEN_INITIAL_AMOUNT = 3_000_000 * 100_000_000  # 2.5m to owners * 10^8

# for now assume 1 dollar per token, and one neo = 40 dollars * 10^8
TOKENS_PER_NEO = 400 * 100_000_000

# for now assume 1 dollar per token, and one gas = 20 dollars * 10^8
TOKENS_PER_GAS = 200 * 100_000_000

# maximum amount you can mint in the limited round ( 500 neo/person * 400 Tokens/NEO * 10^8 )
MAX_EXCHANGE_LIMITED_ROUND = 500 * 400 * 100_000_000

# when to start the crowdsale
BLOCK_SALE_START = 900

# when to end the initial limited round
# NEVER, not that it matters on testnet since people can make new addresses
# and kyc is disabled in this contract
LIMITED_ROUND_END = 999999999999

KYC_KEY = b'kyc_ok'

LIMITED_ROUND_KEY = b'r1'

def crowdsale_available_amount(ctx):
    """

    :return: int The amount of tokens left for sale in the crowdsale
    """

    in_circ = Get(ctx, TOKEN_CIRC_KEY)

    return TOKEN_TOTAL_SUPPLY - in_circ


def add_to_circulation(ctx, amount):
    """
    Adds an amount of token to circlulation

    :param amount: int the amount to add to circulation
    :param storage:StorageAPI A StorageAPI object for storage interaction
    """
    current_supply = Get(ctx, TOKEN_CIRC_KEY)

    current_supply += amount

    Put(ctx, TOKEN_CIRC_KEY, current_supply)


def get_circulation(ctx):
    """
    Get the total amount of tokens in circulation

    :param storage:StorageAPI A StorageAPI object for storage interaction
    :return:
        int: Total amount in circulation
    """
    return Get(ctx, TOKEN_CIRC_KEY)
