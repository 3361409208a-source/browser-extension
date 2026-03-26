<div align="center">

<img src="1.png" width="120" height="120" alt="Form AutoFill Logo">

# 🚀 Form AutoFill Debugger

**一键填充表单、选择选项、监听请求的浏览器扩展**

**One-click form filling, option selection & request monitoring browser extension**

[![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://chrome.google.com)
[![Edge](https://img.shields.io/badge/Edge-0078D7?style=flat-square&logo=microsoft-edge&logoColor=white)](https://microsoft.com/edge)
[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white)](https://firefox.com)

[中文](#功能特性) | [English](#features)

</div>

---

## 📋 功能特性 | Features

### 🚀 自动填充 | Auto Fill

<table>
<tr>
<td width="50%">

**中文**
- **一键填充** - 同时执行所有填充操作
- **填充输入框** - 自动填充文本框和数字框
- **选择选项** - 自动选择单选/多选框（每组最多2个）
- **下拉菜单** - 智能选择 Element Plus 下拉菜单
- **日期填充** - 自动填充今天的日期
- **自动点击** - 自动点击确定/提交/保存按钮

</td>
<td width="50%">

**English**
- **One-click Fill** - Execute all fill operations at once
- **Fill Inputs** - Auto-fill text and number fields
- **Select Options** - Auto-select radio/checkbox (max 2 per group)
- **Dropdowns** - Smart selection for Element Plus dropdowns
- **Date Fill** - Auto-fill today's date
- **Auto Click** - Click confirm/submit/save buttons automatically

</td>
</tr>
</table>

### 👤 用户信息 | User Info

<table>
<tr>
<td width="50%">

**中文**
- 读取 localStorage / sessionStorage
- 读取 Pinia / Vuex store 数据
- 读取 cookies
- 详细调试日志
- 分屏显示调试信息

</td>
<td width="50%">

**English**
- Read localStorage / sessionStorage
- Read Pinia / Vuex store data
- Read cookies
- Detailed debug logs
- Split-screen debug view

</td>
</tr>
</table>

### 📡 请求监听 | Request Monitor

<table>
<tr>
<td width="50%">

**中文**
- 拦截 fetch / XMLHttpRequest
- 实时显示请求方法和 URL
- 点击复制完整载荷
- 侧边栏设计，不遮挡主面板
- 自动格式化 JSON

</td>
<td width="50%">

**English**
- Intercept fetch / XMLHttpRequest
- Real-time request method & URL display
- Click to copy full payload
- Sidebar design, non-intrusive
- Auto-format JSON data

</td>
</tr>
</table>

---

## 📦 安装方法 | Installation

### Chrome / Edge

<details>
<summary>点击查看安装步骤 | Click to view installation steps</summary>

**中文**
1. 打开浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `browser-extension` 文件夹

**English**
1. Open browser, visit `chrome://extensions/` or `edge://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `browser-extension` folder

</details>

### Firefox

<details>
<summary>点击查看安装步骤 | Click to view installation steps</summary>

**中文**
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件**
3. 选择 `browser-extension/manifest.json`

**English**
1. Visit `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `browser-extension/manifest.json`

</details>

---

## 🎯 使用方法 | Usage

### 方式1：扩展弹窗 | Method 1: Extension Popup

<table>
<tr>
<td width="50%">

**中文**
1. 点击浏览器工具栏的扩展图标
2. 在弹出面板中点击对应按钮
3. 可配置文本值和数字值

</td>
<td width="50%">

**English**
1. Click the extension icon in toolbar
2. Click buttons in the popup panel
3. Configure text and number values

</td>
</tr>
</table>

### 方式2：固定面板（推荐）| Method 2: Fixed Panel (Recommended)

<table>
<tr>
<td width="50%">

**中文**
1. 点击 **📌 固定到页面**
2. 页面上会出现可拖拽的固定面板
3. 点击面板按钮执行操作
4. 点击 **📡 请求监听** 展开侧边栏
5. 点击请求即可复制载荷

</td>
<td width="50%">

**English**
1. Click **📌 Pin to Page**
2. A draggable panel appears on page
3. Click panel buttons to execute
4. Click **📡 Request Monitor** to expand sidebar
5. Click requests to copy payload

</td>
</tr>
</table>

---

## ⚙️ 配置选项 | Configuration

<table>
<tr>
<th>选项 | Option</th>
<th>默认值 | Default</th>
<th>说明 | Description</th>
</tr>
<tr>
<td>文本值 | Text Value</td>
<td>测试数据 | Test Data</td>
<td>填充到文本框的值 | Value for text inputs</td>
</tr>
<tr>
<td>数字值 | Number Value</td>
<td>100</td>
<td>填充到数字框的值 | Value for number inputs</td>
</tr>
</table>

---

## 🛠️ 技术特性 | Tech Features

<table>
<tr>
<td width="50%">

**中文**
- ✅ Element Plus 组件支持
- ✅ 下拉菜单串行处理
- ✅ 详细的控制台日志
- ✅ 深拷贝保护原始数据
- ✅ 网络请求拦截（无副作用）
- ✅ 赛博朋克科技感 UI

</td>
<td width="50%">

**English**
- ✅ Element Plus component support
- ✅ Serial dropdown processing
- ✅ Detailed console logs
- ✅ Deep copy protects original data
- ✅ Request interception (no side effects)
- ✅ Cyberpunk tech-style UI

</td>
</tr>
</table>

---

## 📁 文件结构 | File Structure

```
browser-extension/
├── 📄 manifest.json       # 扩展配置 | Extension config
├── 🖼️ popup.html          # 弹窗界面 | Popup UI
├── ⚡ popup.js            # 弹窗逻辑 | Popup logic
├── 🔧 content.js          # 内容脚本 | Content script
├── 🎨 content.css         # 样式文件 | Styles
├── 🌟 1.png               # 扩展图标 | Extension icon
└── 📖 README.md           # 说明文档 | Documentation
```

---

## 📝 注意事项 | Notes

<table>
<tr>
<td width="50%">

**中文**
- 请求监听集成在固定面板侧边栏
- 下拉菜单串行处理，每个间隔400ms
- 关闭固定面板会恢复原始 fetch/XHR
- 扩展图标需使用 PNG 格式

</td>
<td width="50%">

**English**
- Request monitor integrated in fixed panel sidebar
- Dropdowns processed serially, 400ms interval
- Closing panel restores original fetch/XHR
- Extension icon must be PNG format

</td>
</tr>
</table>

---

## 📜 更新日志 | Changelog

### v1.0.0

<table>
<tr>
<td width="50%">

**中文**
- ✅ 基础自动填充功能
- ✅ 赛博朋克风格 UI
- ✅ 固定面板功能
- ✅ 用户信息查看
- ✅ 请求载荷监听
- ✅ 下拉菜单智能选择

</td>
<td width="50%">

**English**
- ✅ Basic auto-fill features
- ✅ Cyberpunk-style UI
- ✅ Fixed panel functionality
- ✅ User info viewer
- ✅ Request payload monitor
- ✅ Smart dropdown selection

</td>
</tr>
</table>

---

<div align="center">

**Made with ❤️ for developers**

[⭐ Star this repo](https://github.com/3361409208a-source/browser-extension) · [🐛 Report issues](https://github.com/3361409208a-source/browser-extension/issues)

</div>
