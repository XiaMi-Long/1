import * as vscode from 'vscode'
import { readData } from './stream'
import { outputChannel } from '../extension'

type globalStateType = {
    /**
     *  计算下次打开窗口,继续阅读从多少字节开始
     */
    startRead: number

    /**
     * 记录上次读取的文件路径
     */
    filePath: string
}

let vscodeExtensionContext: vscode.ExtensionContext

export const globalState: globalStateType = {
    startRead: 0,
    filePath: '',
}

/**
 * 获取本地存储,初始化全局变量
 * @param context vscode.ExtensionContext类型的对象,以调用其内部的globalState方法
 */
export function initGlobalState(context: vscode.ExtensionContext) {
    vscodeExtensionContext = context

    const state = context.globalState.get('moyu-read-global-state')
    if (state) {
        globalState.filePath = (state as globalStateType).filePath || ''
        globalState.startRead = (state as globalStateType).startRead || 0
        readData.readPosition = globalState.startRead
    }
    outputChannel.appendLine(`已经获取到本地存储数据,数据为:${JSON.stringify(state)}`)
    console.log(globalState)
}

/**
 * 更新本地的存储变量
 * 1. 在切换下一页的时候会调用此方法,会重新更新本地的存储变量,防止vscode出现崩溃导致读取进度丢失
 * 此方法更新的进度,会相对于真正的阅读进度少一部分
 */
export function updateGlobalState() {
    vscodeExtensionContext.globalState.update('moyu-read-global-state', {
        startRead: globalState.startRead,
        filePath: globalState.filePath,
    })
    outputChannel.appendLine(`已经向本地存储数据,数据为:${JSON.stringify(globalState)}`)
}

/**
 * 在插件卸载或者关闭的时候调用,清除本地所有已经存储的数据
 */
export function clearAllLocalState() {
    vscodeExtensionContext.globalState.update('moyu-read-global-state', null)
    outputChannel.appendLine(`已经在插件卸载时,清空所有本地数据`)
}
