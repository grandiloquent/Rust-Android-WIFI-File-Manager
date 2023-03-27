use jni::{
    objects::JObject,
    JNIEnv,
};

use std::{net::SocketAddr, collections::HashMap};
// https://docs.rs/android_logger/0.13.1/android_logger/
use android_logger::Config;
use jni::objects::JString;
use log::{LevelFilter, log};
use warp::{
    filters::cors::CorsForbidden, http::Method, http::StatusCode, reject::Reject, Filter,
    Rejection, Reply,
};
use std::sync::Arc;
use ndk::asset::{Asset, AssetManager};
use tokio::sync::RwLock;
use std::{ffi::CString, io::Error, ptr::NonNull};
use std::borrow::Borrow;
use std::ffi::CStr;
use std::io::Read;
use std::ptr::null;
use serde::__private::de::Content::String;
use tokio::io::AsyncWriteExt;

fn get_asset_manager(env: JNIEnv, asset_manager_object: JObject) -> AssetManager {
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

async fn return_error(r: Rejection) -> Result<impl Reply, Rejection> {
    if let Some(error) = r.find::<CorsForbidden>() {
        Ok(warp::reply::with_status(
            error.to_string(),
            StatusCode::FORBIDDEN,
        ))
    } else {
        Ok(warp::reply::with_status(
            "Route not found".to_string(),
            StatusCode::NOT_FOUND,
        ))
    }
}

#[derive(Clone)]
struct Store {
    cache: Arc<RwLock<HashMap<std::string::String, std::string::String>>>,
    ass: Arc<AssetManager>,
}

#[tokio::main]
async unsafe fn run_server(host: &str, ass: AssetManager) {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("content-type")
        .allow_methods(&[Method::PUT, Method::DELETE, Method::GET, Method::POST]);

    let store: Store = Store {
        cache: Arc::new(RwLock::new(HashMap::new())),
        ass: Arc::new(ass),
    };
    let store_filter = warp::any().map(move || store.clone());

    let home = warp::get()
        .and(warp::path::end())
        .and(warp::query())
        .and(store_filter.clone())
        .and_then(get_home);

    let routes = home.with(cors).recover(return_error);
    let server: SocketAddr = host.parse().expect("Unable to parse socket address");
    warp::serve(routes).run(server).await;
}

fn read_resource_file(store: Store, n: &str) -> std::string::String {
    match store.ass.open(&CString::new("index.html").unwrap()) {
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

async fn get_home(params: HashMap<std::string::String, std::string::String>, store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    let mut founded = true;
    let s = match store.cache.write().await.get("index.html") {
        Some(v) => v.to_string(),
        None => {
            let s = read_resource_file(store.clone(), "index.html");
            founded = false;
            s
        }
    };
    if !founded {
        store.cache.write().await.insert("index.html".to_string(), s.clone());
    }
    return Ok(warp::reply::html(s));
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
        Config::default()
            .with_max_level(LevelFilter::Trace)
            .with_tag("Rust"),
    );
    let ass = get_asset_manager(env, asset_manager);
    unsafe {
        run_server(_host.as_str(), ass);
    }
}