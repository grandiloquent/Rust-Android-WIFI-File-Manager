use crate::asset::Cache;
use crate::res::Asset;
use rocket::State;
use std::sync::Arc;
#[get("/video/<path>")]
pub fn video(path: String, cache: &State<Arc<Cache>>) -> Asset {
    let extension = match path.rfind(".") {
        Some(_) => "",
        None => ".html",
    };
    match cache.get(format!("video/{}{}", path, extension).as_str()) {
        None => Asset::default(),
        Some(data) => Asset {
            data,
            content_type: if path.ends_with(".js") {
                "application/javascript"
            } else if path.ends_with(".css") {
                "text/css; charset=utf8"
            } else {
                "text/html; charset=utf8"
            },
        },
    }
}