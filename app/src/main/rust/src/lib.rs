
#![allow(unused_qualifications)]
#![feature(decl_macro)]

#[macro_use] extern crate rocket;
mod handler;
mod asset;

use jni::JNIEnv;
use jni::objects::{JObject, JString};
use ndk::asset::AssetManager;
use crate::asset::get_asset_manager;
use crate::handler::run_server;

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    asset_manager: JObject, host: JString, port: u16,
) {
    let _host: std::string::String =
        env.get_string(host).expect("Couldn't get java string!").into();

    #[cfg(target_os = "android")]
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Trace)
            .with_tag("Rust"),
    );
    let ass = get_asset_manager(env, asset_manager);
    unsafe {
        run_server(_host.as_str(), port,ass);
    }
}
