import { buildWorker, scan } from './scan'
import { detectHarpus } from './detectHarpus'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as Buffer from "buffer";
import {Worker} from "tesseract.js";

const fixture8CHĘ = readFileSync(resolve(__dirname, '../fixtures/harpus/8-CHĘ.jpg'))
const fixture10ZMĘ = readFileSync(resolve(__dirname, '../fixtures/harpus/10-ZMĘ.jpg'))
const fixture16ĄBB = readFileSync(resolve(__dirname, '../fixtures/harpus/16-ĄBB.jpg'))

function bufferToDataURL(mimeType: string, buffer: Buffer) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`
}

async function processFile(worker: Worker, buffer: Buffer) {
  return await scan(worker, bufferToDataURL('image/jpg', buffer))
}

describe('detectHarpus', () => {
  let worker

  beforeEach(async () => {
    worker = await buildWorker()
  })

  afterEach(async () => {
    await worker.terminate()
  })

  it('find point id and code within scanned text', async () => {
    const text = await processFile(worker, fixture8CHĘ)
    expect(detectHarpus(text)).toEqual({ id: 8, code: 'CHĘ'})

    const text2 = await processFile(worker, fixture10ZMĘ)
    expect(detectHarpus(text2)).toEqual({ id: 10, code: 'ZMĘ'})

    const text3 = await processFile(worker, fixture16ĄBB)
    expect(detectHarpus(text3)).toEqual({ id: 16, code: 'ĄBB'})
  })
})
