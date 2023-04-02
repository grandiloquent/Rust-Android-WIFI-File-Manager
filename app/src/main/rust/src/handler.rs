// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use std::path::{Path, PathBuf};
use std::sync::Arc;
use rocket::{State};
use rocket::fs::NamedFile;
use rocket::response::content::RawJson;
use urlencoding::decode;
use crate::asset::Cache;
use crate::header::Referer;
use crate::res::{Asset};
use crate::strings::StringExt;
use crate::util::{get_file_list};

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
pub fn indexFile(path: String, cache: &State<Arc<Cache>>) -> Asset {
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

#[get("/api/files?<path>")]
pub fn api_files(path: String) -> RawJson<String> {
    RawJson(serde_json::to_string(&get_file_list(path, "/storage/emulated/0")).unwrap_or("".to_string()))
}


#[get("/api/file?<path>")]
pub async fn api_file(path: String, referer: Referer) -> Option<NamedFile> {
    let p = Path::new(path.as_str());
    if p.exists() {
        NamedFile::open(path).await.ok()
    } else {
        let query = referer.0.substring_after("path=").substring_before("&");
        let file_path = decode(query.as_str()).unwrap().to_string().substring_before_last("/");
        NamedFile::open(file_path + path.substring_after_last("/api").as_str()).await.ok()
    }
}

#[get("/api/<path..>")]
pub async fn api_asset_file(path: PathBuf, referer: Referer) -> Option<NamedFile> {
    let query = referer.0.substring_after("path=").substring_before("&");
    let file_path = decode(query.as_str()).unwrap().to_string().substring_before_last("/");
    NamedFile::open(file_path + "/" + path.to_str().unwrap()).await.ok()
}

#[get("/video/<path>")]
pub fn video(path: String, cache: &State<Arc<Cache>>) -> Asset {
    let extension = match path.rfind(".") {
        Some(_) => "",
        None => ".html"
    };
    match cache.get(format!("video/{}{}", path, extension).as_str()) {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: if path.ends_with(".js") {
                    "application/javascript"
                } else if path.ends_with(".css") {
                    "text/css; charset=utf8"
                } else {
                    "text/html; charset=utf8"
                },
            }
        }
    }
}