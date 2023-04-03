use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::res::Asset;

#[get("/index/<path>")]
pub fn index_file(path: String, cache: &State<Arc<Cache>>) -> Asset {
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