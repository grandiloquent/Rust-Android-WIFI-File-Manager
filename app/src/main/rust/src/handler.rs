// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use std::path::PathBuf;
use std::sync::Arc;
use log::log;
use rocket::{State};
use crate::asset::Cache;
use crate::res::{Asset};

#[get("/")]
pub fn index<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("index/index.html") {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: "text/html; charset=utf8",
            }
        }
    }
}

#[get("/<b>")]
pub fn file<'a>(b: String, cache: &State<Arc<Cache>>) -> Asset {
    match cache.get(b.as_str()) {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: if b.ends_with(".js") {
                    "application/javascript"
                } else {
                    "text/html; charset=utf8"
                },
            }
        }
    }
}

#[get("/index/<path>")]
pub fn indexFile<'a>(path: String, cache: &State<Arc<Cache>>) -> Asset {
    match cache.get(("index/".to_string() + path.as_str()).as_str()) {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: if path.ends_with(".js") {
                    "application/javascript"
                } else {
                    "text/css; charset=utf8"
                },
            }
        }
    }
}
