use std::ffi::CString;
use std::io::Read;
use std::ptr::NonNull;
use jni::JNIEnv;
use jni::objects::JObject;
use ndk::asset::AssetManager;
use crate::Store;

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

fn read_resource_file(store: Store, n: &str) -> std::string::String {
    match store.ass.open(&CString::new(n).unwrap()) {
        Some(mut a) => {
            let mut text = std::string::String::new();
            a.read_to_string(&mut text).expect("TODO: panic message");
            return text;
        }
        None => {
            return std::string::String::new();
        }
    }
}

pub async fn response_asset(name: &str, store: Store) -> Result<impl warp::Reply, warp::Rejection>
{
    let mut founded = true;
    let s = match store.cache.write().await.get(name) {
        Some(v) => v.to_string(),
        None => {
            let s = read_resource_file(store.clone(), name);
            founded = false;
            s
        }
    };
    if !founded {
        store.cache.write().await.insert(name.to_string(), s.clone());
    }
    // 根据文件名后缀设置 MIME TYPE
    let mut content_type = "text/html";
    if name.ends_with(".js") {
        content_type = "text/javascript";
    } else if name.ends_with(".css") {
        content_type = "text/css";
    }
    return Ok(warp::http::response::Builder::new()
        .header("content-type", content_type)
        .body(s.to_string()));
}
