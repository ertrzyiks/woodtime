import {createWorker, Worker} from 'tesseract.js'

export async function buildWorker() {
  const worker = createWorker(typeof process === 'object'
    ? {}
    : {
      corePath: require('file-loader!tesseract.js-core/tesseract-core.asm.js').default
    }
  )

  await worker.load();
  await worker.loadLanguage('pol');
  await worker.initialize('pol');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789AĄBCĆDĘEFGHIJKLŁMNŃOÓPRSŚTUVWXYZŻŹ !?-'
  })

  return worker
}

export async function scan(worker: Worker, image: string) {
  const { data: { text } } = await worker.recognize(image)

  return text
}
