import * as core from '@actions/core'
import { getJobData } from './emcee-client'
import { TestJobStatus } from './types'
import { setTimeout } from 'timers/promises'

export const waitForRunEnd = async (jobs: string[]): Promise<void> => {
  let errors = 0
  let finished = false
  core.debug('Waiter started')
  do {
    core.debug(`Waiter errors: ${errors}`)
    core.debug(`Waiter finished: ${finished}`)
    try {
      const statuses = []
      for (const job of jobs) {
        const jobData = await getJobData(job)
        errors = 0
        statuses.push(jobData.status)
        if (
          statuses.length === jobs.length &&
          statuses.every(s => s !== TestJobStatus.inProgress)
        ) {
          finished = true
        }
      }
    } catch (e) {
      if (errors > 5) {
        throw e
      }
      errors++
      core.debug(`Waiter error: ${e as string}`)
    }
    core.debug('Waiter: sleep 10s')
    await setTimeout(10000)
  } while (!finished)
}
