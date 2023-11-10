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
export const outputChannel = vscode.window.createOutputChannel('moyu-read')

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
            stream.off('close', streamCloseCallBack)
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

        stream.on('close', streamCloseCallBack)

        stream.on('error', streamErrorCallBack)
    }
}

export function nextPage() {
    const textSize = Number(vscode.workspace.getConfiguration('reader-text').get('textSize')) || 20

    readData.showText = readData.bookData.splice(0, textSize).join('')
    if (readData.showText.length > 0) {
        setText(readData.showText)
        outputChannel.appendLine('本次行数据为:' + readData.showText)
    }

    if (readData.showText.length === 0) {
        if (!readData.isReadClose) {
            outputChannel.appendLine('准备读取第二次的数据............')
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

function streamCloseCallBack() {
    readData.isReadClose = true
    vscode.window.showInformationMessage('选取的文件即将到结尾')
    outputChannel.appendLine('stream close')
}

function streamErrorCallBack() {
    reset()
    vscode.window.showErrorMessage('读取文件出现意外错误!')
}

function reset() {
    readData.bookData = []
    readData.showText = 'R'
    readData.isReadClose = true
    outputChannel.appendLine(`数据已清空`)
}
