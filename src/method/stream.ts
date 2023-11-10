import fs from 'fs'
import * as vscode from 'vscode'
import { setText } from './statusBar'
import { outputChannel } from '../extension'
import { globalState, updateGlobalState } from './globalState'

type readerLineType = {
    showText: string | Buffer
    bookData: (string | Buffer)[]
    isReadClose: boolean
    historys: string[]
    filePath: string
    readPosition: number
    historyBookDataLength: number
}

export const readData: readerLineType = {
    showText: '',
    bookData: [],
    isReadClose: true,
    historys: [],
    filePath: '',
    readPosition: 0,
    historyBookDataLength: 0,
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

    setText('加载文件中.....')
    readData.filePath = filePath
    stream = fs.createReadStream(filePath, { start: readData.readPosition, encoding: 'utf8', highWaterMark: 400 })

    stream.on('data', function (chunk) {
        readData.readPosition += chunk.length

        stream.pause()
        if (readData.bookData.length === 0) {
            readData.bookData = (chunk as string).trim().replace(/\s+/g, '').split('')
            readData.historyBookDataLength = readData.bookData.length
            updateGlobalState()
            nextPage()
        }
    })
    readData.isReadClose = false

    stream.on('close', streamCloseCallBack)

    stream.on('error', streamErrorCallBack)
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
        updateGlobalStart()
        stream.destroy()
    }
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

function updateGlobalStart() {
    globalState.filePath = readData.filePath
    globalState.startRead = readData.readPosition - readData.bookData.length
}

function reset(resetTpe: 'error' | 'select-file') {
    readData.bookData = []
    readData.showText = 'R'
    readData.readPosition = 0
    readData.isReadClose = true
    readData.historyBookDataLength = 0

    if (resetTpe === 'select-file') {
        globalState.startRead = 0
        updateGlobalState()
    }
    outputChannel.appendLine(`数据已清空`)
}
