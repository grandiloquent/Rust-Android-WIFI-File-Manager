use std::path::{Path};
use rocket::serde::json::{json, Value};
use std::fs;
use rocket::serde::{json::Json};
#[post("/api/file/delete", data = "<list>")]
pub async fn api_file_delete(list: Json<Vec<String>>) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html
    for path in list.into_inner() {
        let p = Path::new(path.as_str());
        if p.is_dir() {
            fs::remove_dir_all(p);
        } else {
            fs::remove_file(p);
        }
    }
// https://doc.rust-lang.org/stable/std/fs/fn.remove_dir_all.html
    json!({
            "error":0
        })
}