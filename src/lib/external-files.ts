/*!
 * © 2021 Atypon Systems LLC
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
import { ContainedModel } from '@manuscripts/manuscript-transform'
import {
  ExternalFile,
  Figure,
  ObjectTypes,
} from '@manuscripts/manuscripts-json-schema'

import { processElements, XLINK_NAMESPACE } from './data'
import { logger } from './logger'

export const importExternalFiles = async (
  document: Document,
  data: Array<ContainedModel>,
  doi: string
): Promise<Document> => {
  const externalFiles = data.filter(
    (el) => el.objectType == ObjectTypes.ExternalFile
  ) as Array<ExternalFile>
  const externalFilesMap = new Map<string, ExternalFile>()
  for (const externalFile of externalFiles) {
    externalFilesMap.set(externalFile.publicUrl, externalFile)
  }
  const objectIDGenerator = generateObjectID(doi)
  const articleMeta = document.querySelector('article-meta')

  const figures = data.filter(
    (el) => el.objectType == ObjectTypes.Figure
  ) as Array<Figure>
  for (const figure of figures) {
    const name = figure._id.replace(':', '_')
    await processElements(
      document,
      `//graphic[starts-with(@xlink:href,"graphic/${name}")]`,
      async (graphic) => {
        const parentFigure = graphic.closest('fig')
        if (!parentFigure) {
          logger.error('graphic not wrapped inside a fig element')
          return
        }
        if (figure.originalURL) {
          const staticImage = externalFilesMap.get(figure.originalURL)
          if (staticImage) {
            const imageName = staticImage.filename
            const nodeName = graphic.nodeName.toLowerCase()

            graphic.setAttributeNS(
              XLINK_NAMESPACE,
              'href',
              `${nodeName}/${imageName}`
            )
          }
        }

        if (figure.externalFileReferences) {
          const externalFileURLs = figure.externalFileReferences
            .filter((el) => el.url != figure.originalURL)
            .map((el) => el.url)

          const interactiveHtml: Array<string> = []
          const downloadable: Array<string> = []
          externalFileURLs.forEach((url) => {
            const externalFile = externalFilesMap.get(url)
            if (!externalFile) {
              return
            }

            if (externalFile.designation === 'interactive-html') {
              interactiveHtml.push(url)
            } else {
              downloadable.push(url)
            }
          })

          if (downloadable.length > 0) {
            const caption = document.createElement('caption')
            caption.setAttribute('content-type', 'supplementary-material')
            downloadable.forEach((url) => {
              const externalFile = externalFilesMap.get(url)
              if (externalFile) {
                const inlineSupplementary = createInlineSupplementaryMaterial(
                  externalFile,
                  document
                )
                caption.appendChild(inlineSupplementary)
              }
              parentFigure.insertBefore(caption, graphic)
            })
          }

          if (interactiveHtml.length > 0) {
            const alternatives = document.createElement('alternatives')
            const clone = graphic.cloneNode(true)
            alternatives.appendChild(clone)
            interactiveHtml.forEach((url) => {
              const externalFile = externalFilesMap.get(url)
              if (externalFile) {
                const supplementary = createSupplementaryMaterial(
                  externalFile,
                  document
                )
                const objectID = objectIDGenerator.next().value
                if (objectID) {
                  supplementary.appendChild(objectID)
                }
                if (articleMeta) {
                  articleMeta.appendChild(supplementary.cloneNode(true))
                }
                alternatives.appendChild(supplementary)
              }
            })
            graphic.replaceWith(alternatives)
          }
        }
      }
    )
  }
  return document
}

function* generateObjectID(doi: string, index = 1) {
  while (true) {
    const objectID = new DOMParser().parseFromString(
      '<object-id pub-id-type="doi" specific-use="metadata"></object-id>',
      'application/xml'
    ).firstElementChild
    if (objectID) {
      objectID.textContent = `${doi}suppl${index++}`
    }
    yield objectID
  }
}

const createInlineSupplementaryMaterial = (
  externalFile: ExternalFile,
  document: Document
): Element => {
  const supplementaryMaterial = document.createElement(
    'inline-supplementary-material'
  )
  setSupplementaryMaterialAttributes(supplementaryMaterial, externalFile)
  const rootParagraph = document.createElement('p')

  rootParagraph.appendChild(supplementaryMaterial)
  return rootParagraph
}

const createSupplementaryMaterial = (
  externalFile: ExternalFile,
  document: Document
): Element => {
  const supplementaryMaterial = document.createElement('supplementary-material')

  setSupplementaryMaterialAttributes(supplementaryMaterial, externalFile)
  return supplementaryMaterial
}

const setSupplementaryMaterialAttributes = (
  supplementaryMaterial: Element,
  externalFile: ExternalFile
) => {
  supplementaryMaterial.setAttribute('mimetype', externalFile.MIME)
  supplementaryMaterial.setAttributeNS(
    XLINK_NAMESPACE,
    'href',
    `external/${externalFile.filename}`
  )
  supplementaryMaterial.setAttribute('content-type', externalFile.designation)
  if (externalFile.description) {
    supplementaryMaterial.textContent = externalFile.description
  }
}
