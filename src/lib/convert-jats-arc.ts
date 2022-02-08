/*!
 * © 2020 Atypon Systems LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  ContainedModel,
  fromPrototype,
  InvalidInput,
  isFigure,
  loadBundledDependencies,
  parseJATSArticle,
} from '@manuscripts/manuscript-transform'
import archiver, { Archiver } from 'archiver'
import fs from 'fs-extra'
import createHttpError from 'http-errors'

import { createJSON } from './create-json'
import { fixImageReferences } from './fix-jats-references'
import { logger } from './logger'
import { promiseHandler } from './utils'

interface Options {
  addBundledData?: boolean
}

export const convertJATSArc = async (
  dir: string,
  doc: Document,
  options: Options = {}
): Promise<Archiver> => {
  logger.debug('Converting Word file to JATS XML with Arc')

  const archive = archiver.create('zip')
  // parse the JATS XML and fix data references
  const imageDirPath: string = dir + '/images'
  await fixImageReferences(imageDirPath, doc)

  // convert JATS XML to Manuscripts data
  const [data, error] = await promiseHandler(parseJATSArticle(doc))
  if (error instanceof InvalidInput) {
    throw createHttpError(400, error)
  } else if (error) {
    throw new Error(error)
  }
  const manuscriptModels = data as ContainedModel[]

  // add bundled data if needed
  if (options.addBundledData) {
    const dependencies = await loadBundledDependencies()
    manuscriptModels.push(...dependencies.map(fromPrototype))
  }

  // TODO: add template data and requirements if needed
  // TODO: set manuscript.pageLayout?
  // TODO: choose citation style and set manuscript.bundle?

  // output JSON
  const index = createJSON(manuscriptModels)
  archive.append(index, {
    name: 'index.manuscript-json',
  })

  for (const model of manuscriptModels) {
    if (isFigure(model)) {
      if (model.originalURL) {
        if (await fs.pathExists(`${dir}/${model.originalURL}`)) {
          const name = model._id.replace(':', '_')

          logger.debug(`Adding ${model.originalURL} as Data/${name}`)

          archive.append(fs.createReadStream(`${dir}/${model.originalURL}`), {
            name,
            prefix: 'Data/',
          })
        } else {
          logger.warn(`Missing file ${model.originalURL}`)
        }
      }
    }
  }

  archive.finalize()

  return archive
}
