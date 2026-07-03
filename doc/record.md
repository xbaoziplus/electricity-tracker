# 电费记账本 · PWA

一个纯本地、可离线的手机电费记录应用：记电表读数、记缴费、看用电趋势、按阶梯电价估算电费。
无后端、无账号，**数据只保存在你手机的浏览器里**（localStorage）。

## 目录结构

```
electricity-tracker/
├─ app/                 ← 最终成品（部署这个文件夹）
│  ├─ index.html        ← 应用本体（单文件，全部功能）
│  ├─ manifest.webmanifest
│  ├─ sw.js             ← Service Worker（离线缓存）
│  └─ icons/            ← 应用图标
├─ design-demos/        ← 三个设计方向的可交互版本（备选存档）
├─ shots/               ← 截图
└─ spec.md              ← 设计与计算规格
```

## 怎么装到手机上

PWA 需要 HTTPS 才能完整工作（离线缓存 + 添加到主屏幕）。三选一：

### 方式 A · GitHub Pages（推荐，免费长期可用）
1. 新建一个 GitHub 仓库，把 `app/` 里的 4 项（index.html、manifest.webmanifest、sw.js、icons/）传到仓库根目录
2. 仓库 Settings → Pages → Source 选 `main` 分支根目录，保存
3. 一分钟后得到 `https://你的用户名.github.io/仓库名/`，手机浏览器打开即可

### 方式 B · Netlify Drop（最快，拖拽即得网址）
打开 <https://app.netlify.com/drop>，把整个 `app/` 文件夹拖进去，立即得到一个 HTTPS 网址。

### 方式 C · 局域网快速体验（不装离线缓存，先试试）
电脑上在 `app/` 目录运行 `python -m http.server 8000`（或任意静态服务器），
手机连同一 Wi-Fi，访问 `http://电脑IP:8000`。此方式 Service Worker 不生效（非 HTTPS），仅供体验。

### 添加到主屏幕
- **iPhone**：Safari 打开网址 → 分享按钮 → 「添加到主屏幕」
- **Android**：Chrome 打开网址 → 菜单 → 「安装应用 / 添加到主屏幕」

之后从主屏幕图标启动，全屏无地址栏，和原生 APP 一样；断网也能打开。

## 使用要点

- **先在设置页把电价改成你当地的**：默认阶梯表是国网典型年阶梯（2160/4800 度分档），各省市标准不同，以你的电费单为准；也可切换成单一电价
- 第一次抄表只是「表底」，记第二次读数后开始出用电量和估算
- 想先看看效果：设置 → 「载入示例数据」，玩完一键清空
- **数据在本机**：换手机/换浏览器前，用 设置 → 「导出 JSON」备份，新设备上「导入 JSON」恢复
- 所有电费为估算值，以供电公司账单为准

## 验证记录（2026-07-03）

Playwright + Chrome 实测 11/11 通过：空状态引导、manifest、Service Worker 激活、
读数/缴费增删改、刷新持久化、**断网重载可用**、趋势图渲染、设置交互、零 JS 错误。
