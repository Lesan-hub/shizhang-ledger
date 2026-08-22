# 拾账

一款轻量、简洁、数据仅保存在本机的个人记账 App。

![拾账](public/og.png)

## 功能

- 支出与收入快速记账
- 加减计算键盘、备注与日期
- 自定义支出和收入分类
- 分类显示、隐藏与删除
- 月度预算、收支统计和趋势分析
- 自定义主题、昵称与本地头像
- CSV 账单导出
- Android 返回手势优先关闭记账或设置页面
- 不包含示例账目，新账本从零开始

## 在线体验

<https://qingzhang-ledger.jliu88000.chatgpt.site>

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

## 构建

网页版：

```bash
npm run build
```

移动端与 Android：

```bash
npm run build:mobile
npx cap sync android
cd android
./gradlew assembleDebug
```

## 数据说明

账目、预算、主题、自定义分类和个人资料均保存在当前设备的本地存储中，不会上传到服务器。卸载应用或清除应用数据会删除本机账本，建议定期导出 CSV 备份。

