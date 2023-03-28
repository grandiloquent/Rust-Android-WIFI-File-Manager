#![allow(unused_qualifications)]

mod utils;

use std::collections::HashMap;
use std::ptr::NonNull;
use jni::JNIEnv;
use jni::objects::{JObject, JString};
use ndk::asset::AssetManager;
use regex::Regex;
use tiny_http::{Server, Response, Header, Request};

use crate::utils::{extension_to_mime, get_asset_manager, get_file_list, get_header, read_asset, read_resource_file, StringExt};

fn run_server(host: &str, ass: AssetManager) {
    let server = Server::http(host).unwrap();
    let cache: HashMap<String, String> = HashMap::new();
    let headers: HashMap<String, Header> = HashMap::new();
    let re = Regex::new(r"/[^/]+(?:js|css)").unwrap();
    for request in server.incoming_requests() {
        let original_url = request.url().to_owned();
        let path = original_url.substring_before("?");
        if path == "/" {
            let data = read_asset("index.html", cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header("index.html", &headers)));
        } else if re.is_match(path.as_str()) {
            let data = read_asset(&path[1..], cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(&path[1..], &headers)));
        } else if path == "/api/files" {
            let query = original_url.substring_after("path=").substring_before("&");
            let list = get_file_list(query, "/storage/emulated/0");
            let data = serde_json::to_string(&list).unwrap();
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(".json", &headers)));
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
