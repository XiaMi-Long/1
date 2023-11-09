import fs from 'fs'
import * as vscode from 'vscode'
import { createReadStream, nextPage } from './method/stream'
import { createStatusBarItem } from './method/statusBar'

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "helloworld" is now active!')

    let disposable = vscode.commands.registerCommand('readerBook.add-text', async () => {
        // 创建读写流
        createReadStream()
        // 创建活动栏
        createStatusBarItem()

        // const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)
        // myStatusBarItem.text = '12塞尔达四大四带上死的还是的四大四大行时代你擦四十'
        // myStatusBarItem.tooltip = 'click to read'

        // myStatusBarItem.show()
    })

    let nextPageDisposable = vscode.commands.registerCommand('extension.nextPage', () => {
        console.log('nextPage')
        nextPage()
    })

    let backPageDisposable = vscode.commands.registerCommand('extension.backPage', () => {
        console.log('backPage')
    })

    context.subscriptions.push(disposable, nextPageDisposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
