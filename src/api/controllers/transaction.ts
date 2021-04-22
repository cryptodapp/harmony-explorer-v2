import {stores} from 'src/store'
import {ShardID, Transaction} from 'src/types/blockchain'
import {validator} from 'src/api/controllers/validators/validators'
import {
  is64CharHexHash,
  isBlockNumber,
  isOrderDirection,
  isOrderBy,
  isShard,
  isOffset,
  isLimit,
  isOneOf,
  isFilters,
  Void,
} from 'src/api/controllers/validators'
import {Filter, TransactionQueryField, TransactionQueryValue} from 'src/types/api'

export async function getTransactionByField(
  shardID: ShardID,
  field: TransactionQueryField,
  value: TransactionQueryValue
): Promise<Transaction | Transaction[] | null> {
  validator({
    field: isOneOf(field, ['block_number', 'block_hash', 'hash', 'hash_harmony']),
  })
  if (field === 'block_number') {
    validator({
      value: isBlockNumber(value),
    })
  } else {
    validator({
      value: is64CharHexHash(value),
    })
  }

  const txs = await stores[shardID].transaction.getTransactionsByField(shardID, field, value)
  if (!txs!.length) {
    if (field === 'hash') {
      // if tx not found by hash, give it another shot with harmony hash
      return getTransactionByField(shardID, 'hash_harmony', value)
    }

    return null
  }

  if (['hash', 'hash_harmony'].includes(field)) {
    return txs![0]
  }

  return txs
}

export async function getTransactions(shardID: ShardID, filter?: Filter) {
  validator({
    shardID: isShard(shardID),
  })

  if (filter) {
    validator({
      offset: isOffset(filter.offset),
      limit: isLimit(filter.limit),
      orderBy: isOrderBy(filter.orderBy, ['block_number']),
      orderDirection: isOrderDirection(filter.orderDirection),
      filter: isFilters(filter.filters, ['block_number']),
    })
  } else {
    filter = {
      offset: 0,
      limit: 10,
      orderBy: 'block_number',
      orderDirection: 'desc',
      filters: [],
    }
  }
  return await stores[shardID].transaction.getTransactions(shardID, filter)
}
