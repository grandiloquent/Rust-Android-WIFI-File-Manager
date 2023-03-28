#![allow(unused_qualifications)]

mod utils;

use std::collections::HashMap;
use std::ptr::NonNull;
use jni::JNIEnv;
use jni::objects::{JObject, JString};
use ndk::asset::AssetManager;
use regex::Regex;
use serde::{Deserialize, Serialize};
use tiny_http::{Server, Response, Header, Request};
use crate::utils::{extension_to_mime, get_asset_manager, get_header, read_asset, read_resource_file};


fn run_server(host: &str, ass: AssetManager) {
    let server = Server::http(host).unwrap();
    let cache: HashMap<String, String> = HashMap::new();
    let headers: HashMap<String, Header> = HashMap::new();
    let re = Regex::new(r"/[^/]+(?:js|css)").unwrap();
    for request in server.incoming_requests() {
        let url = request.url().to_owned();
        if url == "/" {
            let data = read_asset("index.html", cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header("index.html", &headers)));
        } else if re.is_match(url.as_str()) {
            let data = read_asset(&url[1..], cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(&url[1..], &headers)));
        }
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    asset_manager: JObject, host: JString,
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
        run_server(_host.as_str(), ass);
    }
}
