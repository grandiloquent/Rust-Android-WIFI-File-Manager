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
use std::cell::Cell;

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
struct Store  {
    cache: Arc<RwLock<HashMap<String, String>>>,
    ass: Arc<AssetManager> ,
}

#[tokio::main]
async unsafe fn run_server (host: &str, ass:AssetManager) {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("content-type")
        .allow_methods(&[Method::PUT, Method::DELETE, Method::GET, Method::POST]);

    let store: Store = Store {
        cache: Arc::new(RwLock::new(HashMap::new())),
        ass:  Arc::new(ass),
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


async fn get_home(params: HashMap<String, String>, store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    return Ok(warp::reply::with_status("Question updated", StatusCode::OK));
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    asset_manager: JObject, host: JString,
) {
    let _host: String =
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