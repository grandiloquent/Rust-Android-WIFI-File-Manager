use rocket::serde::json::{json, Value};
use std::path::Path;
// https://doc.rust-lang.org/std/fs/
use rocket::http::Status;
use std::fs;
#[get("/api/file/new_file?<path>")]
pub fn api_file_new_file(path: String) -> Result<(), Status> {
    let p = Path::new(path.as_str());
    // https://doc.rust-lang.org/std/path/struct.Path.html#method.is_file
    if !p.is_file() {
        return match fs::write(p, b"") {
            Ok(_) => Ok(()),
            // https://doc.rust-lang.org/std/io/struct.Error.html
            Err(error) => {
                log::error!("{}: {}", error.to_string(), path);
                Err(Status::InternalServerError)
            }
        };
    } else {
        Err(Status::NotFound)
    }
}
#[get("/api/file/new_dir?<path>")]
pub fn api_file_new_dir(path: String) -> Value {
    let p = Path::new(path.as_str());
    // https://doc.rust-lang.org/std/path/struct.Path.html#method.is_file
    if !p.is_dir() {
        // https://doc.rust-lang.org/std/fs/fn.create_dir_all.html
        return match fs::create_dir_all(p) {
            Ok(_) => {
                json!({
                    "error":0
                })
            }
            // https://doc.rust-lang.org/std/io/struct.Error.html
            Err(error) => {
                json!({
                    "error":1,
                    "message":""
                })
            }
        };
    } else {
        json!({
            "error":1,
            "message":""
        })
    }
}