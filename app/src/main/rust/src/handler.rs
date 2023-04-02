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




#[get("/api/files?<path>")]
pub fn api_files(path: String) -> RawJson<String> {
    RawJson(serde_json::to_string(&get_file_list(path, "/storage/emulated/0")).unwrap_or("".to_string()))
}




#[get("/api/<sub_path..>?<path>")]
pub async fn api_asset_file(sub_path: PathBuf, referer: Option<Referer>, path: Option<String>) -> Option<NamedFile> {
    match referer {
        None => {
            NamedFile::open("'").await.ok()
        }
        Some(v) => {
            let query = v.0.substring_after("path=").substring_before("&");
            let file_path = decode(query.as_str()).unwrap().to_string().substring_before_last("/");
            NamedFile::open(file_path + "/" + sub_path.to_str().unwrap()).await.ok()
        }
    }
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