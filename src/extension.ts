import fs from 'fs'
import * as vscode from 'vscode'
import { createReadStream, nextPage, destroyStream } from './method/stream'
import { createStatusBarItem, show, hide } from './method/statusBar'

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('readerBook.add-text', async () => {
        // 创建活动栏
        createStatusBarItem()
        // 创建读写流
        createReadStream()
    })

    const showStatusBarItem = vscode.commands.registerCommand('readerBook.show', () => {
        show()
    })

    const hideStatusBarItem = vscode.commands.registerCommand('readerBook.hide', () => {
        hide()
    })

    const nextPageDisposable = vscode.commands.registerCommand('extension.nextPage', () => {
        console.log('nextPage')
        nextPage()
    })

    context.subscriptions.push(disposable, nextPageDisposable, showStatusBarItem, hideStatusBarItem)
}

// This method is called when your extension is deactivated
export function deactivate() {
    destroyStream()
}
