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
import { DummyPdfEngine } from './DummyPdfEngine'
import { ASyncEnginesType, IASyncPdf } from './IASyncPdf'
import { SampleEngine } from './SampleEngine'

export class ASyncPdfEnginesFactory {
  private static instances: Record<ASyncEnginesType, IASyncPdf> = {
    DummyEngine: new DummyPdfEngine(),
    SampleEngine: new SampleEngine(),
  }
  static createPdfEngine(engine: ASyncEnginesType): IASyncPdf {
    const instance = ASyncPdfEnginesFactory.instances[engine]
    if (!instance) {
      throw new Error('Sync engine not supported.')
    }
    return instance
  }
}
