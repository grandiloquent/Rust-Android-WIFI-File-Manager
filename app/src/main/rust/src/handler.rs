// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use std::collections::HashMap;
use std::error::Error;
use std::future::Future;
use std::io::Write;
use std::net::{IpAddr, SocketAddr};
use std::sync::{Arc, LockResult, RwLock};
use std::task::Context;
use log::log;
use ndk::asset::AssetManager;
use ndk::configuration::HDR::No;
use ndk::event::Keycode::{H, O};
use rocket::{Config, Request, routes, State};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::response::content;
use crate::asset::read_resource_file;
use crate::error;
use rocket::{response::content::RawHtml};
use rocket::config::LogLevel;
use rocket::figment::Figment;

struct Cache {
    ass: AssetManager,
    data: Arc<RwLock<HashMap<String, String>>>,
}

impl Cache {
    fn new(ass: AssetManager) -> Cache {
        Cache {
            ass,
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    fn get(&self, key: &str) -> Option<String> {
        match self.data.write() {
            Ok(mut v) => {
                match v.get(key) {
                    None => {
                        match read_resource_file(&self.ass, key) {
                            Ok(value) => {
                                v.insert(key.to_string(), value.clone());
                                Some(value)
                            }
                            Err(_) => None
                        }
                    }
                    Some(v) => {
                        Some(v.to_string())
                    }
                }
            }
            Err(_) => {
                None
            }
        }
    }
}

#[get("/")]
fn hello(cache: &State<Arc<Cache>>) -> RawHtml<String> {
    match cache.get("index.html") {
        None => {
            RawHtml("".to_string())
        }
        Some(data) => {
            RawHtml(data)
        }
    }
}
#[tokio::main]
pub async fn run_server(host: &str, port: u16, ass: AssetManager) {
    log::error!("Starting server {}:{}", host, port);
    let figment = Figment::from(rocket::Config::default())
        .clone()
        .merge((rocket::Config::ADDRESS, host))
        .merge((rocket::Config::PORT, port))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let _ = rocket::custom(figment)
        .mount("/", routes![hello])
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found])
        .launch().await;
}

