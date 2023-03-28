#![allow(unused_qualifications)]

mod store;
mod types;
mod routes;

use jni::{
    objects::JObject,
    JNIEnv,
};

use std::{net::SocketAddr, collections::HashMap, fs, io};
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
use tokio::io::AsyncWriteExt;
use warp::path::FullPath;

use urlencoding::decode;
use crate::store::Store;
use crate::types::fileItem::FileItem;

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

async fn response_asset(name: &str, store: Store) -> Result<impl warp::Reply, warp::Rejection>
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

async fn get_home(
    store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    return response_asset("index.html", store).await;
}

async fn get_assets(
    name: String,
    store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    return response_asset(name.as_str(), store).await;
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

        //.and(warp::header::<String>("Referrer"))
        .and(store_filter.clone())
        .and_then(get_home);

    let assets = warp::get()
        .and(warp::path("assets"))
        .and(warp::path::param())
        .and(store_filter.clone())
        .and_then(get_assets);

    let api_files = warp::get()
        .and(warp::path("api"))
        .and(warp::path("files"))
        .and(warp::query())
        .and_then(routes::files::files);

    let routes = home
        .or(assets)
        .or(api_files)
        .with(cors)
        .recover(return_error);
    let server: SocketAddr = host.parse().expect("Unable to parse socket address");
    warp::serve(routes).run(server).await;
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