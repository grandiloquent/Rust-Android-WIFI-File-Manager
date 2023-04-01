use std::ffi::CString;
use std::io::Read;
use std::ptr::NonNull;
use jni::JNIEnv;
use jni::objects::JObject;
use ndk::asset::AssetManager;

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

}