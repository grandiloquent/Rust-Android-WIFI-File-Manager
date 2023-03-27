# Rust Android Example

1. 添加工具链

    rustup target add aarch64-linux-android
2. 安装 **cargo-ndk** 工具

    cargo install cargo-ndk

更多信息可参阅 https://github.com/willir/cargo-ndk-android-gradle

## Troubleshooting

### failed to run custom build command for `ring v0.16.20`

修改 `rust_lib\.cargo\config.toml` 添加环境参数

```toml
[env]
TARGET_CC = "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk\\ndk\\23.1.7779620\\toolchains\\llvm\\prebuilt\\windows-x86_64\\bin\\aarch64-linux-android21-clang.cmd"
TARGET_AR= "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk\\ndk\\23.1.7779620\\toolchains\\llvm\\prebuilt\\windows-x86_64\\bin\\llvm-ar.exe"
```

