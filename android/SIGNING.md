# 拾账 Android 升级签名

Android 覆盖升级要求新版与旧版使用完全相同的包名和签名证书。构建升级包时请设置以下环境变量：

```bash
export SHIZHANG_UPDATE_KEYSTORE="/absolute/path/to/shizhang-update.keystore"
export SHIZHANG_UPDATE_STORE_PASSWORD="android"
export SHIZHANG_UPDATE_KEY_ALIAS="androiddebugkey"
export SHIZHANG_UPDATE_KEY_PASSWORD="android"
npm run android:build
```

旧版 `拾账-v1.1.apk` 的签名证书 SHA-256 指纹为：

```text
A6:83:AB:8A:B6:F0:E0:42:C0:8E:FE:42:F5:57:08:23:86:C1:22:8D:5A:7E:2C:72:D9:5A:9E:1B:68:1E:12:C4
```

签名文件不得提交到 Git 仓库或公开传输。若遗失旧密钥，Android 将拒绝覆盖安装，用户只能卸载旧版后再安装。
