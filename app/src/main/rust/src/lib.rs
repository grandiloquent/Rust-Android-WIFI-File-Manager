#![allow(unused_qualifications)]
#![feature(decl_macro)]
#![feature(addr_parse_ascii)]

#[macro_use]
extern crate rocket;

mod asset;
mod error;
mod util;
mod res;
mod server;
mod mimetypes;
mod strings;
mod handlers;
mod headers;
mod data;

use jni::{JNIEnv};
use jni::objects::{JObject, JString};
use crate::data::config::{Database, Server};
use crate::server::run_server;
use crate::util::{get_asset_manager, get_string};

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

    #[cfg(target_os = "android")]
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Trace)
            .with_tag("Rust"),
    );
    // unsafe {
    //     log::error!("{}",get_string(env, context, "port").parse::<u16>().unwrap_or(5432));
    // }
    let ass = get_asset_manager(env, asset_manager);
    unsafe {
        run_server(Server {
            host: _host,
            port,
            temp_dir: "/storage/emulated/0".to_string(),
        }, Database {
            host:get_string(env,context,"v_host"),
            port:get_string(env,context,"v_port").parse::<u16>().unwrap_or(5432),
            db_name:get_string(env,context,"v_db_name"),
            user:get_string(env,context,"v_user"),
            password:get_string(env,context,"v_password")
        }, ass);
    }
}

