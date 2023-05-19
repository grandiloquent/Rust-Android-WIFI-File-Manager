use jni::objects::{JObject, JString, JValue};
use jni::JNIEnv;
use ndk::asset::AssetManager;
use rocket::serde::Deserialize;
use rocket::serde::Serialize;
use std::ffi::CString;
use std::fs;
use std::io::Read;
use std::path::Path;
use std::ptr::NonNull;
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

pub fn get_asset_manager(env: JNIEnv, asset_manager_object: JObject) -> AssetManager {
    let aasset_manager_pointer = unsafe {
        // https://docs.rs/android-ndk-sys/latest/android_ndk_sys/
        ndk_sys::AAssetManager_fromJava(env.get_native_interface(), *asset_manager_object)
    };
    let asset_manager = unsafe {
        // https://docs.rs/ndk/latest/ndk/asset/struct.AssetManager.html#method.from_ptr
        ndk::asset::AssetManager::from_ptr(NonNull::<ndk_sys::AAssetManager>::new_unchecked(
            aasset_manager_pointer,
        ))
    };
    // https://docs.rs/ndk-sys/0.4.0/ndk_sys/struct.AAssetManager.html
    asset_manager
}

pub fn read_resource_file(
    ass: &AssetManager,
    n: &str,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let filename = &CString::new(n)?;
    match ass.open(filename) {
        Some(mut a) => {
            let mut bytes = vec![0; a.get_length()];
            a.read_exact(&mut bytes)?;
            Ok(bytes)
        }
        None => Err("Error reading")?,
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FileItem {
    pub path: String,
    pub is_directory: bool,
    pub size: u64,
}

pub fn get_file_list(query: String, is_size: bool) -> Vec<FileItem> {
    let mut path = query;
    match fs::read_dir(path) {
        Ok(v) => v
            .map(|res| {
               
                res.map(|e|{
                    let size = if is_size {
                        get_size(&e.path())
                    } else {
                        0
                    };
                    FileItem {
                        path: e.path().display().to_string(),
                        is_directory: e.file_type().unwrap().is_dir(),
                        size,
                    }
                })
            })
            .collect::<Result<Vec<_>, std::io::Error>>()
            .unwrap(),
        Err(_) => Vec::new(),
    }
}

pub unsafe fn get_string(env: JNIEnv, context: JObject, key: &str) -> String {
    let jv =
        |s: &str| -> jni::errors::Result<JValue> { Ok(JObject::from(env.new_string(s)?).into()) };
    let v = env
        .call_method(
            context,
            "getString",
            "(Ljava/lang/String;)Ljava/lang/String;",
            &[jv(key).unwrap()],
        )
        .unwrap()
        .l()
        .unwrap();
    let d = env.get_string(JString::from(v)).unwrap();
    d.into()
}

pub fn get_epoch_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
}
fn get_size(path: &Path) -> u64 {
    if path.is_dir() {
        let mut total: u64 = 0;
        for entry in WalkDir::new(path) {
            match entry {
                Ok(entry) => {
                    total += entry.metadata().map(|m| m.len()).unwrap_or(0);
                }
                Err(_) => {}
            };
        }
        total
    } else if path.is_file() {
        path.metadata().map(|m| m.len()).unwrap_or(0)
    } else {
        0
    }
}
