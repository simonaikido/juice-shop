/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import * as utils from '../utils'
import logger from '../logger'
import { copyFile, access } from 'node:fs/promises'
import { glob } from 'glob'

const exists = async (filePath: string) => await access(filePath).then(() => true).catch(() => false)

const restoreOverwrittenFilesWithOriginals = async () => {
  await copyFile(path.resolve('data/static/legal.md'), path.resolve('ftp/legal.md'))

  if (await exists(path.resolve('frontend/dist'))) {
    await copyFile(
      path.resolve('data/static/owasp_promo.vtt'),
      path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
    )
  }

  try {
    const files = await glob(path.resolve('data/static/i18n/*.json'), { windowsPathsNoEscape: true })
    await Promise.all(
      files.map(async (filename: string) => {
        const base = path.resolve('data/static/i18n')
        const target = path.resolve(filename)
        const relative = path.relative(base, target)
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          throw new Error('Invalid file path')
        }
        await copyFile(target, path.resolve('i18n/', filename.substring(filename.lastIndexOf('/') + 1)))
      })
    )
  } catch (err) {
    logger.warn('Error listing JSON files in /data/static/i18n folder: ' + utils.getErrorMessage(err))
  }
}

export default restoreOverwrittenFilesWithOriginals
