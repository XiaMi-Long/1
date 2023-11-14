import fs from 'fs'
import * as vscode from 'vscode'
import { createStatusBarItem, show, hide } from './method/statusBar'
import { initGlobalState, clearAllLocalState } from './method/globalState'
import { createReadStream, nextPage, destroyStream } from './method/stream'

export const outputChannel = vscode.window.createOutputChannel('moyu-read')

export function activate(context: vscode.ExtensionContext) {
    createStatusBarItem()
    initGlobalState(context)

    const addFileTetx = vscode.commands.registerCommand('readerBook.add-text', () => {
        createReadStream('add-commands')
    })

    const read = vscode.commands.registerCommand('readerBook.read', () => {
        createReadStream('init')
    })

    const showStatusBarItem = vscode.commands.registerCommand('readerBook.show', () => {
        show()
    })

    const hideStatusBarItem = vscode.commands.registerCommand('readerBook.hide', () => {
        hide()
    })

    const nextPageDisposable = vscode.commands.registerCommand('extension.nextPage', () => {
        nextPage()
    })

    context.subscriptions.push(addFileTetx, read, nextPageDisposable, showStatusBarItem, hideStatusBarItem)
}

// This method is called when your extension is deactivated
export function deactivate() {
    destroyStream()
    clearAllLocalState()
}
