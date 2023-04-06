use std::sync::Arc;
use deadpool_postgres::{ManagerConfig, Runtime};
use postgres::NoTls;
use ndk::asset::AssetManager;
use rocket::{routes};
use crate::{Database, error, Server};
use rocket::config::LogLevel;
use rocket::data::{Limits, ToByteUnit};
use rocket::figment::Figment;
use crate::asset::Cache;
use crate::handlers;

#[tokio::main]
pub async fn run_server(srv: Server, db: Database, ass: AssetManager) {
    log::error!("host = {},port = {},tempDir = {}",srv.host,srv.port,srv.temp_dir);
    log::error!("host = {},\nport = {},\ndbName = {},\nuser = {},\npassword = {}",db.host,db.port,db.db_name,db.user,db.password);
    let limits = Limits::default()
        .limit("json", 3.mebibytes())
        .limit("file", 5.gibibytes());
    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, srv.host))
        .merge((rocket::Config::PORT, srv.port))
        .merge((rocket::Config::TEMP_DIR, srv.temp_dir))
        .merge((rocket::Config::LIMITS, limits))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let mut server = rocket::custom(figment)
        .mount("/",
               routes![
            handlers::index::index,
            handlers::index_file::index_file,
            handlers::file::file,
            handlers::api_files::api_files,
            handlers::api_files::api_files_clear,
            handlers::api_files::api_files_rename,
            handlers::api_asset_file::api_asset_file,
            handlers::api_file::api_file,
            handlers::video::video,
            handlers::api_file_rename::api_file_rename,
            handlers::api_file_delete::api_file_delete,
            handlers::api_file_rename::api_file_move,
            handlers::api_zip::api_zip,
            handlers::api_file_new::api_file_new_file,
            handlers::api_file_new::api_file_new_dir,
            handlers::upload::upload,
            handlers:: api_article:: api_article,
            handlers:: api_article:: api_article_update,
            handlers:: api_article:: api_articles,
            handlers::note::notes,
            handlers::editor::editor,
            handlers::editor::editor_file,
            handlers::subtitle::subtitle,
            handlers::markdown::markdown,
            handlers::markdown::markdown_file,
            handlers::title::title,
               ])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found]);
    let mut config = deadpool_postgres::Config::new();
    config.host = Some(db.host);
    config.port = Some(db.port);
    config.dbname = Some(db.db_name);
    config.user = Some(db.user);
    config.password = Some(db.password);
    config.manager = Some(ManagerConfig {
        recycling_method: deadpool_postgres::RecyclingMethod::Fast,
    });
    match config.create_pool(Some(Runtime::Tokio1), NoTls) {
        Ok(pool) => {
            server = server.manage(pool);
        }
        Err(err) => {
            log::error!("Error creating pool")
        }
    };
    server.launch().await;
}

