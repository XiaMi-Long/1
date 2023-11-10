import fs from 'fs'
import * as vscode from 'vscode'
import { setText } from './statusBar'

type readerLineType = {
    showText: string | Buffer
    bookData: (string | Buffer)[]
    isReadClose: boolean
    historys: string[]
}

const readData: readerLineType = {
    showText: '',
    bookData: [],
    isReadClose: true,
    historys: [],
}

export let stream: fs.ReadStream

export async function createReadStream() {
    const file = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            txt: ['txt', 'epub'],
        },
        title: '选择文件',
    })

    if (file === undefined) {
        vscode.window.showInformationMessage('你没有选择文件')
    }

    if (file) {
        if (stream) {
            stream.destroy()
            reset()
        }

        setText('加载文件中.....')
        stream = fs.createReadStream(file[0].fsPath, { encoding: 'utf8', highWaterMark: 400 })

        stream.on('data', function (chunk) {
            stream.pause()
            if (readData.bookData.length === 0) {
                readData.bookData = (chunk as string).trim().replace(/\s+/g, '').split('')
                nextPage()
            }
        })
        readData.isReadClose = false

        stream.on('close', function () {
            readData.isReadClose = true
            vscode.window.showInformationMessage('选取的文件即将到结尾')
            // console.log('stream close')
        })

        stream.on('error', function () {
            reset()
            vscode.window.showErrorMessage('读取文件出现意外错误!')
        })
    }
}

export function nextPage() {
    const textSize = Number(vscode.workspace.getConfiguration('reader-text').get('textSize')) || 20

    readData.showText = readData.bookData.splice(0, textSize).join('')
    if (readData.showText.length > 0) {
        setText(readData.showText)
        console.log('本次行数据为:' + readData.showText)
    }

    if (readData.showText.length === 0) {
        if (!readData.isReadClose) {
            // console.log('准备读取第二次的数据............')
            stream.resume()
        }

        if (readData.isReadClose) {
            vscode.window.showInformationMessage('已经是最后一页')
        }
    }
}

export function destroyStream() {
    if (stream) {
        stream.destroy()
    }
}

function reset() {
    readData.bookData = []
    readData.showText = 'R'
    readData.isReadClose = true
}
