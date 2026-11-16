# 啊咿呀哇嘞 · 个人网站

静态网站，不需要构建、安装依赖或启动后端。

- `index.html`：个人主页，包含开发项目、游戏、K-pop／音乐、剪辑作品四个独立区块。游戏轮播的顺序和图片维护在首页的 `game-shots` 清单中；剪辑封面存放在 `images/edits/`，点击作品进入 B 站原视频。
- `delveforge/index.html`：DelveForge 独立产品页。操作界面是流程示意，不是真实运行记录。

## 本机预览

在此目录打开 PowerShell，运行：

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 [个人首页](http://127.0.0.1:8080/) 或 [DelveForge](http://127.0.0.1:8080/delveforge/)。也可以双击 `index.html` 查看；内部链接使用相对路径。

## 以后部署

将 `index.html`、`site.css`、`delveforge/` 和首页引用的 `images/` 图片按原相对路径复制到静态站点的文档根目录。当前只做本地开发，没有部署。

## 本地版本记录

最早的本地提交是重建的旧版界面基线，用于对照或回退。后续改版先检查桌面和手机排版，再新增本地提交；提交不等于部署。
