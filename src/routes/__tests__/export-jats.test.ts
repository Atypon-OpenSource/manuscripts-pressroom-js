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
import { NextFunction, Request, Response } from 'express'
import { parseXml } from 'libxmljs2'
import request from 'supertest'

import { csl, locale } from './__fixtures__/mockCSL'

jest.mock('express-jwt', () => ({
  expressjwt: () => (req: Request, res: Response, next: NextFunction) => {
    req.auth = { email: 'test@atypon.com' }
    next()
  },
}))

const route = '/api/v2/export/jats'

describe('export literatum JATS', () => {
  test('exports to a ZIP file containing a JATS XML', async () => {
    const { app } = await import('../../app')

    const response = await request(app)
      .post(route)
      .attach('file', __dirname + '/__fixtures__/attachment-ids.zip')
      .field(
        'manuscriptID',
        'MPManuscript:9E0BEDBC-1084-4AA1-AB82-10ACFAE02232'
      )
      .field('doi', '10.1234/567')
      .field('frontMatterOnly', false)
      .field('citationStyle', csl)
      .field('locale', locale)
      .field(
        'supplementaryMaterialDOIs',
        JSON.stringify([
          {
            url: 'attachment:db76bde-4cde-4579-b012-24dead961adc',
            doi: '10.1000/xyz123',
          },
        ])
      )
      .field(
        'attachments',
        JSON.stringify([
          {
            url: 'attachment:db76bde-4cde-4579-b012-24dead961add',
            name: 'figure 2.jpg',
            MIME: 'image/jpeg',
            designation: 'figure',
          },
          {
            url: 'attachment:db76bde-4cde-4579-b012-24dead961ada',
            name: 'hon-20-0144.pdf',
            MIME: 'application/pdf',
            designation: 'submission-pdf',
          },
          {
            url: 'attachment:db76bde-4cde-4579-b012-24dead961adc',
            name: 'html-asset.zip',
            MIME: 'application/pdf',
            designation: 'interactive-html',
          },
          {
            url: 'attachment:db76bde-4cde-4579-b012-24dead961adb',
            name: 'hon-20-0144-r1.docx',
            MIME: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            designation: 'document',
          },
          {
            url: 'attachment:1e2364ea-3c36-4801-b523-70c660fcc2a4',
            name: 'supporting information.pdf',
            MIME: 'application/pdf',
            designation: 'supplementary',
          },
        ])
      )
      .responseType('blob')

    expect(response.status).toBe(200)
    expect(response.get('Content-Type')).toBe('application/xml; charset=utf-8')

    const xml = response.body.toString()
    const doc = parseXml(xml, {
      dtdload: true,
      dtdvalid: true,
      nonet: true,
    })

    expect(doc.errors.length).toBe(0)

    expect(doc.getDtd()).toEqual({
      externalId:
        '-//NLM//DTD JATS (Z39.96) Journal Archiving and Interchange DTD with OASIS Tables with MathML3 v1.2 20190208//EN',
      name: 'article',
      systemId:
        'http://jats.nlm.nih.gov/archiving/1.2/JATS-archive-oasis-article1-mathml3.dtd',
    })
    expect(xml).toMatchSnapshot()
  })
})
