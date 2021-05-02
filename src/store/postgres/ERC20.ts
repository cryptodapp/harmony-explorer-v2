import {IStorageERC20} from 'src/store/interface'
import {Address, Contract, Filter, IERC20} from 'src/types'
import {Query} from 'src/store/postgres/types'
import {fromSnakeToCamelResponse, generateQuery} from 'src/store/postgres/queryMapper'
import {buildSQLQuery} from 'src/store/postgres/filters'

export class PostgresStorageERC20 implements IStorageERC20 {
  query: Query

  constructor(query: Query) {
    this.query = query
  }

  addERC20 = async (erc20: IERC20) => {
    const {query, params} = generateQuery(erc20)

    return await this.query(`insert into erc20 ${query} on conflict (address) do nothing;`, params)
  }

  getERC20 = async (filter: Filter): Promise<IERC20[]> => {
    const q = buildSQLQuery(filter)
    const res = await this.query(`select * from erc20 ${q}`, [])

    return res.map(fromSnakeToCamelResponse)
  }

  updateERC20 = async (erc20: IERC20) => {
    return this.query(
      `update erc20 set total_supply=$1, holders=$2, transaction_count=$3 where address=$4;`,
      [erc20.totalSupply, erc20.holders, erc20.transactionCount, erc20.address]
    )
  }

  getERC20Balance = async (owner: Address, token: Address): Promise<string | null> => {
    const res = await this.query(
      `select balance from erc20_balance where owner_address=$1 and token_address=$2`,
      [owner, token]
    )

    return res[0] || null
  }

  setNeedUpdate = async (owner: Address, token: Address) => {
    return this.query(
      `
            insert into erc20_balance(owner_address, token_address, need_update) values($1, $2, true)
                on conflict(owner_address, token_address)
                do update set need_update = true;
          `,
      [owner, token]
    )
  }
}
