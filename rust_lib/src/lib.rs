mod java_glue;
use std::{net::SocketAddr, string, collections::HashMap};

pub use crate::java_glue::*;

// https://docs.rs/android_logger/0.13.1/android_logger/
use android_logger::Config;
use log::LevelFilter;
use rifgen::rifgen_attr::*;

use ndk::asset::AssetManager;
use warp::{
    filters::cors::CorsForbidden, http::Method, http::StatusCode, reject::Reject, Filter,
    Rejection, Reply,
};

pub struct RustLog;

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
#[tokio::main]
async fn run_server(host: &str) {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("content-type")
        .allow_methods(&[Method::PUT, Method::DELETE, Method::GET, Method::POST]);

    let home = warp::get()
        .and(warp::path("/"))
        .and(warp::path::end())
        .and(warp::query())
        .and_then(get_home);

    let routes = home.with(cors).recover(return_error);
    let server: SocketAddr = host.parse().expect("Unable to parse socket address");
    warp::serve(routes).run(server).await;
}
impl RustLog {
    //set up logging
    #[generate_interface]
    pub fn start_server(host: &str) {
        #[cfg(target_os = "android")]
        android_logger::init_once(
            Config::default()
                .with_max_level(LevelFilter::Trace)
                .with_tag("Rust"),
        );
        run_server(host);
    }
}
async fn get_home(params: HashMap<String, String>) -> Result<impl warp::Reply, warp::Rejection> {
    return Ok(warp::reply::with_status("Question updated", StatusCode::OK));
}
