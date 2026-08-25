# 拾账 · 账户版

为有多个支付账户、信用卡和固定账单的职场人设计的轻量账户与还款管理工具。

> [!IMPORTANT]
> 这是“拾账”的另一条独立产品线，不是默认基础版的替代更新。只想快速记录日常收支，请使用 [`main` 基础版](https://github.com/Lesan-hub/shizhang-ledger)；需要多账户、信用卡、还款和分期管理，再选择本账户版。

[在线体验账户版](https://shizhang-accounts.jliu88000.chatgpt.site) · [查看基础版](https://github.com/Lesan-hub/shizhang-ledger/tree/main)

[下载拾账账户版 v0.2 APK](https://github.com/Lesan-hub/shizhang-ledger/releases/tag/accounts-v0.2.0)

![拾账账户版预览](public/account-preview.webp)

## 两个版本如何选择

| 版本 | 适合人群 | 核心重点 |
| --- | --- | --- |
| 基础版 `main` | 想快速记一笔、查看今日花费的用户 | 简洁记账、预算、分类与统计 |
| 账户版 `edition/accounts` | 有多个支付账户、信用卡和固定账单的职场用户 | 账户余额、信用待还、分期、固定账单与报销 |

## 核心能力

- 微信、支付宝、银行卡、现金和信用卡账户
- 信用额度、账单日、还款日与信用待还
- 信用卡分期及月供提示
- 还款按账户转账处理，避免重复统计支出
- 固定账单与未来 7 天待付提醒
- 待报销、已报销状态
- 按账户筛选明细和查看账户支出
- 点击统计分类、账户或具体日期，直接查看对应账目与备注
- 每日趋势可按七天区间前后翻页，追溯当月更早记录
- CSV 导出，包含账户、报销和分期字段
- 所有数据默认只保存在当前设备

## 与基础版的关系

本项目位于独立开发线 `edition/accounts`，使用独立的浏览器存储键和 Android 包名 `com.shizhang.accounts`，可以和基础版“拾账”同时安装、分别保存数据。

当前账户版处于 `0.2` 预览阶段，优先验证真实记账、还款和分期流程；基础版会继续在 `main` 分支独立维护。

## Android 安装

账户版使用独立包名 `com.shizhang.accounts`，可与基础版同时安装。下载 [账户版 v0.2 APK](https://github.com/Lesan-hub/shizhang-ledger/releases/tag/accounts-v0.2.0) 后直接打开即可安装。

从账户版 `v0.1` 覆盖升级至 `v0.2` 时，包名、签名与本地存储键均保持不变，原有账目和账户设置会继续保留。升级前仍建议在“我的 → 设置”中导出 CSV 备份。

## 账务原则

信用卡消费只在发生时记录一次支出。信用卡还款记录为账户之间的资金移动，不再次计入支出；分期计划只用于展示未来月供和剩余付款压力。

## 本地运行

```bash
npm install
npm run dev
```

构建网站：

```bash
npm run build
```

构建 Android 调试安装包：

```bash
npm run android:build
```

构建产物位于 `android/app/build/outputs/apk/debug/app-debug.apk`。制作可覆盖旧版的升级包时必须沿用旧签名并提高 `versionCode`，详见 [Android 升级签名说明](android/SIGNING.md)。
