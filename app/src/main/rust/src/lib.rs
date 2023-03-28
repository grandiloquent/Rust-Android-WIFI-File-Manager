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
use crate::routes::assets::{assets, home};
use crate::routes::utils::get_asset_manager;
use crate::store::Store;
use crate::types::fileItem::FileItem;



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
        .and_then(home);

    let assets = warp::get()
        .and(warp::path("assets"))
        .and(warp::path::param())
        .and(store_filter.clone())
        .and_then(assets);

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