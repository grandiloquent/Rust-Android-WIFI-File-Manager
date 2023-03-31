use std::collections::HashMap;
use ndk::asset::AssetManager;
use jni::JNIEnv;
use jni::objects::JObject;
use std::ffi::CString;
use std::fmt::Error;
use std::io::{ErrorKind, Read};
use std::ptr::NonNull;
/*
获取用于访问assets目录下文件的对象。
https://developer.android.com/reference/android/content/res/AssetManager
https://doc.rust-lang.org/std/fs/fn.read_to_string.html
https://github.com/rust-mobile/ndk
https://docs.rs/ndk/0.7.0/ndk/
*/
pub fn get_asset_manager(env: JNIEnv, asset_manager_object: JObject) -> AssetManager {
    let aasset_manager_pointer = unsafe {
        ndk_sys::AAssetManager_fromJava(env.get_native_interface(), *asset_manager_object)
    };
    let asset_manager = unsafe {
        ndk::asset::AssetManager::from_ptr(NonNull::<ndk_sys::AAssetManager>::new_unchecked(
            aasset_manager_pointer,
        ))
    };
    asset_manager
}

pub fn read_resource_file(ass: &AssetManager, n: &str) -> Result<String, Box<dyn std::error::Error>> {
    let filename = &CString::new(n)?;
    match ass.open(filename) {
        Some(mut a) => {
            let mut text = std::string::String::new();
            a.read_to_string(&mut text)?;
            Ok(text)
        }
        None => {
            Err("Error reading")?
        }
    }

    //
    // match ass.open(&CString::new(n).unwrap()) {
    //     Some(mut a) => {
    //         let mut text = std::string::String::new();
    //         a.read_to_string(&mut text).expect("TODO: panic message");
    //         return text;
    //     }
    //     None => {
    //         return std::string::String::new();
    //     }
    // }
    // match ass.open(&CString::new(n).unwrap()) {
    //     Some(mut a) => {
    //         let mut text = std::string::String::new();
    //         a.read_to_string(&mut text).expect("TODO: panic message");
    //         return text;
    //     }
    //     None => {
    //         return std::string::String::new();
    //     }
    // }
}

pub fn read_asset<'a>(name: String, cache: &HashMap<&'a str, String>, ass: &AssetManager) -> Result<String, Box<dyn std::error::Error>> {
    let data = match cache.get(name.as_str()) {
        Some(v) => v.to_string(),
        None => {
            let s = read_resource_file(&ass, name.as_str())?;
            cache.clone().insert(name.as_str(), s.to_string());
            s
        }
    };
    Ok(data)
}