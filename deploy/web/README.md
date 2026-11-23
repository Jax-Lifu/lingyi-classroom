# 01课堂

[打开森森森林](https://jax-lifu.github.io/lingyi-classroom/) · [下载绿联 NAS 版](https://github.com/Jax-Lifu/lingyi-classroom/releases/latest/download/lingyi-classroom-nas.zip)

[查看源码和资源下载实现](https://github.com/Jax-Lifu/lingyi-classroom/tree/source)

## 在绿联云 NAS 上使用

适用于已安装 Docker 应用的 UGOS Pro。通用包适配 Intel、AMD 和 ARM64 机型。

1. 下载上面的 NAS 压缩包，在 NAS 的一个项目目录中解压。确认目录内直接包含 `compose.yaml`、`nginx.conf` 和 `docs/`。
2. 打开 **Docker → 项目 → 创建**，选择该目录作为项目路径，导入其中的 `compose.yaml` 并部署。首次启动会下载 Nginx 镜像。
3. 手机或电脑连接家庭局域网，在浏览器打开 `http://NAS的局域网IP:18080/`。端口已被占用时，可以调整 Compose 中冒号左侧的端口。

插画、语音和课程随包提供。孩子点开剧场、听读或笔顺时，浏览器从 NAS 加载相应资源。学习印章按浏览器及访问地址保存；请为孩子收藏一个固定地址。

手机首次打开时可选择「下载课程资源」。GitHub Pages 或 HTTPS NAS 地址支持分包续传和离线重开。在普通 HTTP 局域网地址，预载使用浏览器的 HTTP 缓存。跳过后可以从「家长选课 → 设置 → 管理资源下载」重新打开。清理浏览器网站数据后需重新下载。

### 离线导入

在 [版本下载页](https://github.com/Jax-Lifu/lingyi-classroom/releases/latest) 选择适合 NAS 的离线包。Intel / AMD 选择 `amd64`，ARM64 选择 `arm64`。解压后在绿联 Docker 的「镜像」页导入 `classroom.tar`，再到「项目」中选择解压目录并导入同包的 `compose.yaml`。离线包中的镜像已包含站点和服务器。

命令行也可在相应项目目录执行 `docker compose up -d`。离线包先执行 `docker load -i classroom.tar`。[绿联 Docker 项目说明](https://support.ugnas.com/detail/article/en-US/236)
