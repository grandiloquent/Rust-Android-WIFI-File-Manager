# Rust Android Example

使用 Rust 编写的一个在 Android 上运行的 Web 服务器。 

1. 添加工具链

    rustup target add aarch64-linux-android
2. 安装 **cargo-ndk** 工具

    cargo install cargo-ndk

更多信息可参阅 https://github.com/willir/cargo-ndk-android-gradle

## Troubleshooting

### failed to run custom build command for `ring v0.16.20`

修改 `.cargo\config.toml` 添加环境参数

```toml
[env]
TARGET_CC = "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk\\ndk\\23.1.7779620\\toolchains\\llvm\\prebuilt\\windows-x86_64\\bin\\aarch64-linux-android21-clang.cmd"
TARGET_AR= "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk\\ndk\\23.1.7779620\\toolchains\\llvm\\prebuilt\\windows-x86_64\\bin\\llvm-ar.exe"
```

### rustup override set nightly

```
rustup override set nightly
```

## 第三方库

### Rust

- https://github.com/seanmonstar/reqwest
- https://github.com/tiny-http/tiny-http
- https://github.com/rusqlite/rusqlite

## 更多

参考项目或源代码

- https://android.googlesource.com/platform/packages/apps/Gallery2/+/refs/heads/master/src/com/android/gallery3d/app/MoviePlayer.java
- https://github.com/DrKLO/Telegram

## 相关文档

- [Rust 连接 PostgreSQL 数据库](https://kpkpkp.cn/article?id=9)

