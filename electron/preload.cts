import { contextBridge, ipcRenderer, webUtils, type IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("tintd", {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  },
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
});
