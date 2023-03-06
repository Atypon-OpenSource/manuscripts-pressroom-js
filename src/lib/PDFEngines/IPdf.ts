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

import { ContainedModel } from '@manuscripts/transform'
import express from 'express'

import { AttachmentData } from '../attachments'

export interface ISyncPdf {
  engineName: string

  createJob(
    dir: string,
    _data: Array<ContainedModel>,
    _manuscriptID: string,
    _imageDir: string,
    _attachments: Array<AttachmentData>,
    _theme?: string,
    _articleOptions?: {
      allowMissingElements: boolean
      generateSectionLabels: boolean
    }
  ): Promise<string>

  jobStatus(job_id: string): Promise<string>

  jobResult(job_id: string): Promise<Buffer | null>
}

export interface IAsyncPdf {
  engineName: string

  createPdf(
    _dir: string,
    _data: Array<ContainedModel>,
    _manuscriptID: string,
    _imageDir: string,
    _attachments: Array<AttachmentData>,
    _res: express.Response,
    _theme?: string,
    _articleOptions?: {
      allowMissingElements: boolean
      generateSectionLabels: boolean
    }
  ): Promise<void>
}

export type SyncEnginesType = 'SampleEngine' | 'DummyEngine'
export type AsyncEnginesType = 'prince-html'

export const AsyncEngines: AsyncEnginesType[] = ['prince-html']
export const SyncEngines: SyncEnginesType[] = ['SampleEngine', 'DummyEngine']
