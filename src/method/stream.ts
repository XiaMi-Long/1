import fs from 'fs'
import * as vscode from 'vscode'
import { outputChannel } from '../extension'
import { globalState, updateGlobalState as update } from './globalState'
import { setText } from './statusBar'

type readerLineType = {
    showText: string | Buffer
    bookData: {
        byteLength: number
        utf8Text: string
    }[]
    isReadClose: boolean
    historys: string[]
    filePath: string
    readPosition: number
}

export const readData: readerLineType = {
    showText: '',
    bookData: [],
    isReadClose: true,
    historys: [],
    filePath: '',
    readPosition: 0,
}

export let stream: fs.ReadStream

async function selectFile(): Promise<string> {
    const file = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            txt: ['txt', 'epub'],
        },
        title: '选择文件',
    })

    if (file === undefined) {
        vscode.window.showInformationMessage('你没有选择文件')
        return ''
    }
    return file[0].fsPath
}

export async function createReadStream(createType: 'init' | 'add-commands') {
    let filePath = ''
    if (createType === 'add-commands') {
        const path = await selectFile()
        if (path.length === 0) {
            return
        }

        if (path.length > 0) {
            filePath = path
        }

        readData.readPosition = 0

        outputChannel.appendLine(`本次行为是打开弹窗进行文件选择获取路径---获取到的路径为[${filePath}]`)
    }

    if (createType === 'init') {
        filePath = globalState.filePath || ''
        outputChannel.appendLine(`本次行为是根据本地存储获取路径---获取到的路径为[${filePath}]`)

        if (stream) {
            outputChannel.appendLine(`目前有在读的文件,已取消本次行为`)
            return
        }
    }

    if (filePath.length === 0) {
        vscode.window.showInformationMessage('请先选择文件')
        outputChannel.appendLine(`本次是刚刚安装插件,没有选择文件本地也没有文件---获取到的路径为[${filePath}]`)
        return
    }

    if (stream) {
        stream.off('close', streamCloseCallBack)
        stream.destroy()
        reset('select-file')
    }

    readData.filePath = filePath
    stream = fs.createReadStream(filePath, { start: readData.readPosition, highWaterMark: 400 })

    stream.on('data', function (chunk) {
        console.log(chunk.length)
        console.log(chunk.toString('utf8').length)
        stream.pause()
        if (readData.bookData.length === 0) {
            getLineText(chunk as Buffer)
            nextPage()
        }
    })
    readData.isReadClose = false

    stream.on('close', streamCloseCallBack)

    stream.on('error', streamErrorCallBack)
}

export function nextPage() {
    // 如果刚刚开始下一页,就没有数据
    if (readData.bookData.length === 0) {
        readData.isReadClose = true
        outputChannel.appendLine('已经是最后一页')
        vscode.window.showInformationMessage('已经是最后一页')
        return
    }

    const lineData = readData.bookData.shift()
    console.log(lineData)

    if (lineData) {
        readData.showText = lineData.utf8Text

        if (readData.showText.length > 0) {
            setText(readData.showText)
            readData.readPosition += lineData.byteLength
            updateGlobalState()
            outputChannel.appendLine('本次行数据为:' + readData.showText)
        }

        // 如果shift完之后,数组里面没有数据了
        if (readData.bookData.length === 0) {
            outputChannel.appendLine('准备读取下一次的数据...')
            stream.resume()
        }
    }
}

export function destroyStream() {
    if (stream) {
        updateGlobalState()
        stream.destroy()
    }
}

function getLineText(chunk: Buffer) {
    let result: Buffer[] = []
    for (let i = 0; i < chunk.length; i += 100) {
        let chunks = Buffer.from(chunk.slice(i, i + 100))
        result.push(chunks)
    }

    result.forEach((item) => {
        readData.bookData.push({
            byteLength: item.length,
            utf8Text: item.toString('utf8').replace(/\s+/g, ''),
        })
    })
    console.log(result)
    console.log(readData.bookData)
}

function streamCloseCallBack() {
    readData.isReadClose = true
    outputChannel.appendLine('stream close')
    vscode.window.showInformationMessage('选取的文件即将到结尾')
}

function streamErrorCallBack() {
    reset('error')
    vscode.window.showErrorMessage('读取文件出现意外错误!')
}

function updateGlobalState() {
    globalState.filePath = readData.filePath
    globalState.startRead = readData.readPosition
    update()
}

function reset(resetTpe: 'error' | 'select-file') {
    readData.bookData = []
    readData.showText = 'R'
    readData.readPosition = 0
    readData.isReadClose = true

    if (resetTpe === 'select-file') {
        globalState.startRead = 0
        updateGlobalState()
    }
    outputChannel.appendLine(`数据已清空`)
}
