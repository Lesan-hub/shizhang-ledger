# 拾账账户版 Android 升级签名

Android 覆盖升级要求新旧安装包使用相同包名和签名证书。账户版包名固定为 `com.shizhang.accounts`，构建升级包时请设置：

```bash
export SHIZHANG_ACCOUNTS_UPDATE_KEYSTORE="/absolute/path/to/shizhang-accounts-update.keystore"
export SHIZHANG_ACCOUNTS_UPDATE_STORE_PASSWORD="android"
export SHIZHANG_ACCOUNTS_UPDATE_KEY_ALIAS="androiddebugkey"
export SHIZHANG_ACCOUNTS_UPDATE_KEY_PASSWORD="android"
npm run android:build
```

首个公开账户版安装包的签名证书 SHA-256 指纹为：

```text
F2:62:2D:97:34:0A:2E:D2:42:FB:96:2B:00:31:26:AA:3B:6B:70:95:82:22:06:86:68:0D:DE:FB:CA:38:46:51
```

签名文件不得提交到 Git 仓库或公开传输。若丢失旧密钥，Android 将拒绝覆盖安装，用户只能卸载旧版后重新安装。
