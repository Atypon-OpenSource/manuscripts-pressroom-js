/*!
 * © 2023 Atypon Systems LLC
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

import { ContainedModel } from '@manuscripts/transform'
import express from 'express'

import { AttachmentData } from '../attachments'
import { PDFPreviewError } from '../errors'
import { createPrincePDF } from '../prince-html'
import { IAsyncPdf } from './IPdf'

export class PrinceHtmlEngine implements IAsyncPdf {
  engineName: string
  async createPdf(
    _dir: string,
    _data: Array<ContainedModel>,
    _manuscriptID: string,
    _imageDir: string,
    _attachments: AttachmentData[],
    _res: express.Response,
    _theme?: string | undefined,
    _articleOptions?: {
      allowMissingElements: boolean
      generateSectionLabels: boolean
    }
  ): Promise<void> {
    try {
      await createPrincePDF(
        _dir,
        _data,
        _manuscriptID,
        'Data',
        _attachments,
        _theme,
        _articleOptions
      )
      _res.download(_dir + '/manuscript.pdf')
    } catch (e) {
      throw new PDFPreviewError('Conversion failed when exporting to PDF')
    }
  }
}
