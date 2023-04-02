use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::res::Asset;

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