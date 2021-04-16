import {logger} from './logger'
import {api} from 'src/api'
import {indexer} from 'src/indexer'
import {config} from 'src/config'

const l = logger(module)

// todo checks on start. shard chainId
const run = async () => {
  l.info(`Harmony Explorer v${config.info.version}. Git commit hash: ${config.info.gitCommitHash}`)

  try {
    if (config.api.isEnabled) {
      l.info(`API starting... Shards[${config.api.shards.join(', ')}]`)
      await api()
    } else {
      l.debug('API is disabled')
    }

    if (config.indexer.isEnabled) {
      l.info(`Indexer starting... Shards[${config.indexer.shards.join(', ')}]`)
      await indexer()
    } else {
      l.debug('Indexer is disabled')
    }
  } catch (err) {
    l.error(err)
    process.exit(1)
  }
}

run()
