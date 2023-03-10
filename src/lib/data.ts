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
export const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

export const processElements = async (
  doc: Document,
  selector: string,
  callback: (element: Element) => Promise<void>
): Promise<void> => {
  const nodes = doc.evaluate(
    selector,
    doc,
    doc.createNSResolver(doc),
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
  )

  for (let i = 0; i < nodes.snapshotLength; i++) {
    await callback(nodes.snapshotItem(i) as Element)
  }
}
