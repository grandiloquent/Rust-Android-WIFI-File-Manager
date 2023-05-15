#[macro_use]
extern crate rocket;

mod asset;
mod data;
mod error;
mod handlers;
mod headers;
mod mimetypes;
mod res;
mod server;
mod strings;
mod util;

use crate::data::config::{Database, Server};
use crate::server::run_server;
use crate::util::{get_asset_manager, get_string};
use jni::objects::{JObject, JString};
use jni::JNIEnv;

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    context: JObject,
    asset_manager: JObject,
    host: JString,
    port: u16,
) {
    let _host: std::string::String = env
        .get_string(host)
        .expect("Couldn't get java string!")
        .into();

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
        run_server(
            Server {
                host: _host,
                port,
                temp_dir: "/storage/emulated/0".to_string(),
            },
            ass,
        );
    }
}
