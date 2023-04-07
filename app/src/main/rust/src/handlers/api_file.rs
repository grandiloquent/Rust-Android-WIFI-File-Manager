use std::fs;
use std::path::{Path};
use rocket::http::Status;
use rocket_seek_stream::SeekStream;
#[get("/api/file?<path>")]
pub fn api_file<'a>(path: String) -> std::io::Result<SeekStream<'a>> {
    let p = Path::new(path.as_str());
    SeekStream::from_path(p)
}
#[post("/api/file?<path>", data = "<data>")]
pub fn api_file_post<'a>(path: String, data: String) -> Result<(), Status> {
    let p = Path::new(path.as_str());
    if !p.exists() {
        return Err(Status::NotFound);
    }
    fs::write(p, data);
    Ok(())
}