use std::path::{Path};
use rocket::serde::json::{json, Value};
use std::fs;

// https://github.com/zip-rs/zip

#[get("/api/zip?<path>")]
pub async fn api_zip(path: String) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html

    let p = Path::new(path.as_str());
    if !p.is_file() {
        json!({
            "error":1
        })
    } else {
        //https://doc.rust-lang.org/std/fs/struct.File.html#method.open
        if let Ok(file) = fs::File::open(p) {
            //   https://docs.rs/zip/latest/zip/read/struct.ZipArchive.html#method.new
            if let Ok(archive) = zip::ZipArchive::new(file) {} else {}
        } else {}

// https://doc.rust-lang.org/std/fs/fn.rename.html

        json!({
            "error":0
        })
    }
}