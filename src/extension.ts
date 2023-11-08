// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fs from 'fs'
import * as vscode from 'vscode'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld" is now active!')

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('readerBook.add-text', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello CC!')

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
            const stream = fs.createReadStream(file[0].fsPath, { encoding: 'utf8', highWaterMark: 64 * 1024 })
            // 监听data事件
            stream.on('data', function (chunk) {
                // 显示这部分内容给用户
                console.log(chunk)

                // 然后，你可以暂停流，等待用户点击“下一页”按钮
                stream.pause()

                setTimeout(() => {
                    console.log('666666666666666666666666666666666666666666666666666666666666666666666666666666')

                    stream.resume()
                    // stream.pause()
                }, 3000)

                // 当用户点击“下一页”按钮时，你可以恢复流
                // stream.resume();
            })
        }

        console.log(file)

        // const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)
        // myStatusBarItem.text = '12塞尔达四大四带上死的还是的四大四大行时代你擦四十'
        // myStatusBarItem.tooltip = 'click to read'

        // myStatusBarItem.show()
    })

    context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
