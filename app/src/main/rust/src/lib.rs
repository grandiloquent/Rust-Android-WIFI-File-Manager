#![allow(unused_qualifications)]
#![feature(decl_macro)]
#![feature(addr_parse_ascii)]

#[macro_use]
extern crate rocket;

mod handler;
mod asset;
mod error;
mod util;
mod res;
mod server;
mod mimetypes;
mod header;
mod strings;

use jni::{JavaVM, JNIEnv};
use jni::objects::{JObject, JString, JValue};
use jni::sys::jstring;
use crate::server::run_server;
use crate::util::get_asset_manager;

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    context: JObject,
    asset_manager: JObject, host: JString, port: u16,
) {
    let _host: std::string::String =
        env.get_string(host).expect("Couldn't get java string!").into();
    let class = env.get_object_class(context).unwrap();


    #[cfg(target_os = "android")]
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Trace)
            .with_tag("Rust"),
    );
    let ass = get_asset_manager(env, asset_manager);
    run_server(_host.as_str(), port, ass);
}
