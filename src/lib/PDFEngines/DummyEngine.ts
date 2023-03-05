/* eslint-disable */
/*!
 * © 2022 Atypon Systems LLC
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

import {ContainedModel} from '@manuscripts/transform'
import fs from 'fs-extra'

import {AttachmentData} from '../attachments'
import {ISyncPdf} from "./IPdf";

export class DummyEngine implements ISyncPdf {


  public get engineName(): string {
    return 'DummyEngine'
  }

  public async createJob(dir: string, _data: Array<ContainedModel>, _manuscriptID: string, _imageDir: string, _attachments: Array<AttachmentData>, _theme?: string, _articleOptions?: { allowMissingElements: boolean; generateSectionLabels: boolean }): Promise<string> {
    const id = '987987'
    return `${id}:${this.engineName}`
  }

  public async jobResult(job_id: string): Promise<Buffer | null> {
    return fs.readFileSync(
        'src/assets/dummy-pdf/pressroom-pdf-sample.pdf'
    )
  }

  public async jobStatus(job_id: string): Promise<string> {
    return 'completed'
  }
}
