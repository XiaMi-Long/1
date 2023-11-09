import fs from 'fs'
import * as vscode from 'vscode'
import { setText } from './statusBar'

type readerLineType = {
    showText: string | Buffer
    bookData: (string | Buffer)[]
    isReadClose: boolean
}

const readData: readerLineType = {
    showText: '',
    bookData: [],
    isReadClose: true,
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
        stream = fs.createReadStream(file[0].fsPath, { encoding: 'utf8', highWaterMark: 400 })
        stream.on('data', function (chunk) {
            stream.pause()

            if (readData.bookData.length === 0) {
                readData.bookData = (chunk as string).trim().replaceAll('\r\n', '').split('')
                nextPage()
            }

            // 显示这部分内容给用户

            // 然后，你可以暂停流，等待用户点击“下一页”按钮

            // setTimeout(() => {
            //     console.log('666666666666666666666666666666666666666666666666666666666666666666666666666666')

            //     stream.resume()
            //     // stream.pause()
            // }, 3000)

            // 当用户点击“下一页”按钮时，你可以恢复流
            // stream.resume();
        })
        readData.isReadClose = false

        // TODO 需要关闭流处理
        stream.on('close', function () {
            readData.isReadClose = true
            vscode.window.showInformationMessage('选取的文件即将到结尾')
            console.log('stream close')
        })

        // TODO 需要意外处理
        stream.on('error', function () {
            readData.bookData = []
            readData.showText = 'R'
            readData.isReadClose = true
            vscode.window.showErrorMessage('读取文件出现意外错误!')
        })
    }
}

export const nextPage = function () {
    readData.showText = readData.bookData.splice(0, 20).join('')
    if (readData.showText.length > 0) {
        setText(readData.showText)
        console.log('本次行数据为:' + readData.showText)
    }

    if (readData.showText.length === 0) {
        if (!readData.isReadClose) {
            console.log('准备读取第二次的数据............')
            stream.resume()
        }

        if (readData.isReadClose) {
            vscode.window.showInformationMessage('已经是最后一页')
        }
    }
}
