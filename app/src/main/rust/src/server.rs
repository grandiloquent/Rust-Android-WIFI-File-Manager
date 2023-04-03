use std::sync::Arc;
use deadpool_postgres::{ManagerConfig, Pool, Runtime};
use postgres::NoTls;
use ndk::asset::AssetManager;
use rocket::{routes};
use crate::{data, Database, error, Server};
use rocket::config::LogLevel;
use rocket::figment::Figment;
use crate::asset::Cache;
use crate::handlers;

#[tokio::main]
pub async fn run_server(srv: Server, db: Database, ass: AssetManager) {
    log::error!("host = {},port = {},tempDir = {}",srv.host,srv.port,srv.temp_dir);
    log::error!("host = {},\nport = {},\ndbName = {},\nuser = {},\npassword = {}",db.host,db.port,db.db_name,db.user,db.password);
    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, srv.host))
        .merge((rocket::Config::PORT, srv.port))
        .merge((rocket::Config::TEMP_DIR, srv.temp_dir))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let mut server = rocket::custom(figment)
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
            handlers::api_zip::api_zip,
            handlers::api_file_new::api_file_new_file,
            handlers::api_file_new::api_file_new_dir,
            handlers::upload::upload
               ])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found]);
    let mut config = deadpool_postgres::Config::new();
    config.manager = Some(ManagerConfig {
        recycling_method: deadpool_postgres::RecyclingMethod::Fast,
    });
    match config.create_pool(Some(Runtime::Tokio1), NoTls) {
        Ok(pool) => {
            server = server.manage(pool);
        }
        Err(err) => {}
    };
    server.launch().await;
}

