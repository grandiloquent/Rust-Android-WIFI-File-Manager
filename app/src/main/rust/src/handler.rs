// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use std::sync::Arc;
use ndk::asset::AssetManager;
use rocket::{routes, State};
use crate::error;
use rocket::config::LogLevel;
use rocket::figment::Figment;
use crate::asset::Cache;
use crate::res::{Asset};


#[get("/")]
fn index<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("index/index.html") {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data: data,
                content_type: "",
            }
        }
    }
}

#[tokio::main]
pub async fn run_server(host: &str, port: u16, ass: AssetManager) {
    log::error!("Starting server {}:{}", host, port);
    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, host))
        .merge((rocket::Config::PORT, port))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let _ = rocket::custom(figment)
        .mount("/", routes![index])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found])
        .launch().await;
}

