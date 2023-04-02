use std::sync::Arc;
use ndk::asset::AssetManager;
use rocket::{routes};
use crate::error;
use rocket::config::LogLevel;
use rocket::figment::Figment;
use crate::asset::Cache;
use crate::handler;

#[tokio::main]
pub async fn run_server(host: &str, port: u16, ass: AssetManager) {
    log::error!("Starting server {}:{}", host, port);
    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, host))
        .merge((rocket::Config::PORT, port))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let _ = rocket::custom(figment)
        .mount("/",
               routes![
            handler::index,
            handler::indexFile,
            handler::file,
            handler::api_files,
            handler::apiFile,
            handler::api_asset_file,
            handler::video
               ])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found])
        .launch().await;
}

