import * as vscode from 'vscode'

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)

export function createStatusBarItem() {
    myStatusBarItem.text = 'R'
    myStatusBarItem.tooltip = 'R'
    myStatusBarItem.show()
}

export function setText(text: string) {
    myStatusBarItem.text = text
}

export function show() {
    myStatusBarItem.show()
}

export function hide() {
    myStatusBarItem.hide()
}
