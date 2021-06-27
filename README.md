# NJUPT Auto Connect

用于自动登录连接/重连南京邮电大学校园网的工具。

难以忍受打游戏断连还得切出去联网的麻烦，用半小时糊了这个快速登录南邮校园网的工具。

## 安装

### 一般用户直接下载

到 [Release 发布页](https://github.com/dsrkafuu/njupt-auto-connect/releases)下载最新版可执行文件即可。

### 已有 Node 环境跑源码

```sh
git clone https://github.com/dsrkafuu/njupt-auto-connect.git
cd njupt-auto-connect
npm i
npm start
```

## 使用教程

初次运行时，工具会提示选择默认 AP，默认状态下 (什么都不输入) 的 AP 为 `NJUPT-CHINANET`，也即电信宽带。

随后工具会要求提供用户名和密码，用户名将被明文保存，密码将以 Base64 编码保存：

![](https://raw.githubusercontent.com/dsrkafuu/njupt-auto-connect/main/assets/init.jpg)

注意无论是有线还是无线连接都是支持的，但需要选择正确的 AP。

设置完成后，工具会将当前的配置文件写入用户目录，在 Windows 下为 `C:\Users\<USERNAME>\.nac.json`，Linux 下则为 `/home/<USERNAME>/.nac.json`。

完成初始化后，工具会持续监控当前网络状态，并在断连时自动登录。

![](https://raw.githubusercontent.com/dsrkafuu/njupt-auto-connect/main/assets/disconnected.jpg)

第二次及之后运行时，工具会检查是否依旧登录，若无网络连接则尝试自动登录：

![](https://raw.githubusercontent.com/dsrkafuu/njupt-auto-connect/main/assets/rerun.jpg)

## Q&A

Q: PC 上浏览器可以自动记住密码为什么还要这个工具？

A: 因为 "打开浏览器 - 选择接入 AP - 点击登录" 这个过程不如自动来的快，打游戏到一半断网重连不够快就会被踢出去。

Q: 和 iOS 上的自动登录快捷指令是什么关系？

A: 我是抄袭的。

Q: 为什么用 Node.js？

A: 因为可以半小时写完，然后打包给我的所有 Windows、Linux 和 macOS 电脑用。

Q: 有图形化界面吗？

A: 没有，不需要。

## License

This project and all contributors shall not be responsible for any dispute or loss caused by using this project.

This project is released under the `MIT License`, for more information read the [LICENSE](https://github.com/dsrkafuu/njupt-auto-connect/blob/master/LICENSE).

Check [Node.js repo](https://github.com/nodejs/node/blob/master/LICENSE) for LICENSE of embedded Node.js environment.
