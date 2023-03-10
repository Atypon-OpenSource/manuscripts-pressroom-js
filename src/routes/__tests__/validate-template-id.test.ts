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
import request from 'supertest'

import { config } from '../../lib/config'

const route = (templateId: string) =>
  `/api/v2/validate/templateId/${templateId}`

describe('validate temmplate id', () => {
  test('returns 200 if template id is found', async () => {
    const { app } = await import('../../app')
    const templateId =
      'MPManuscriptTemplate:www-zotero-org-styles-nature-genetics-Nature-Genetics-Journal-Publication-Article'
    const response = await request(app)
      .post(route(templateId))
      .set('Accept', 'application/json')
      .set('pressroom-api-key', config.api_key)
      .responseType('json')

    expect(response.status).toBe(200)
  })

  test('returns 404 if template id is found', async () => {
    const { app } = await import('../../app')
    const templateId = 'MPManuscriptTemplate:invalid-template'
    const response = await request(app)
      .post(route(templateId))
      .set('Accept', 'application/json')
      .set('pressroom-api-key', config.api_key)
      .responseType('json')

    expect(response.status).toBe(404)
  })
})
