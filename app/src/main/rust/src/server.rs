use crate::asset::Cache;
use crate::handlers;
use crate::{error, Server};
use ndk::asset::AssetManager;
use rocket::config::LogLevel;
use rocket::data::{Limits, ToByteUnit};
use rocket::figment::Figment;
use rocket::routes;
use std::sync::Arc;

#[tokio::main]
pub async fn run_server(srv: Server, ass: AssetManager) {
    let limits = Limits::default()
        .limit("json", 3.mebibytes())
        .limit("string", 3.mebibytes())
        .limit("data-form", 5.gibibytes())
        .limit("file", 5.gibibytes());

    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, srv.host))
        .merge((rocket::Config::PORT, srv.port))
        .merge((rocket::Config::TEMP_DIR, srv.temp_dir))
        .merge((rocket::Config::LIMITS, limits))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let mut server = rocket::custom(figment)
        .attach(handlers::cors::CORS)
        .attach(handlers::content_disposition::ContentDisposition)
        .mount(
            "/",
            routes![
                handlers::api_asset_file::api_asset_file,
                handlers::api_file::api_file,
                handlers::api_file::api_file_post,
                handlers::api_files::api_files,
                handlers::api_files::api_files_clear,
                handlers::api_files::api_files_rename,
                handlers::api_file_delete::api_file_delete,
                handlers::api_file_new::api_file_new_file,
                handlers::api_file_new::api_file_new_dir,
                handlers::api_file_rename::api_file_rename,
                handlers::api_file_rename::api_file_move,
                handlers::api_zip::api_zip,
                handlers::compress_zip::compress_zip,
                handlers::file::file,
                handlers::index::index,
                handlers::index_file::index_file,
                handlers::markdown::markdown,
                handlers::markdown::markdown_file,
                handlers::subtitle::subtitle,
                handlers::upload::upload,
                handlers::video::video
            ],
        )
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found]);

    let _ = server.launch().await;
}
// cargo ndk -t arm64-v8a --platform 31 -o C:\Users\Administrator\Desktop\file\Killer\app\src\main\jniLibs build --release
