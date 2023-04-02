use std::sync::Arc;
use ndk::asset::AssetManager;
use rocket::{routes};
use crate::error;
use rocket::config::LogLevel;
use rocket::figment::Figment;
use crate::asset::Cache;
use crate::handlers;

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
            handlers::index::index,
            handlers::index_file::index_file,
            handlers::file::file,
            handlers::api_files::api_files,
            handlers::api_asset_file::api_asset_file,
            handlers::api_file::api_file,
            handlers::video::video,
            handlers::api_file_rename::api_file_rename,
            handlers::api_file_delete::api_file_delete,
            handlers::api_file_rename::api_file_move,
            handlers::api_zip::api_zip
               ])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found])
        .launch().await;
}

