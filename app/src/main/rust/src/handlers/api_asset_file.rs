// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use std::path::{ PathBuf};
use std::sync::Arc;
use rocket::{State};
use rocket::fs::NamedFile;
use urlencoding::decode;
use crate::asset::Cache;
use crate::header::Referer;
use crate::res::{Asset};
use crate::strings::StringExt;


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

