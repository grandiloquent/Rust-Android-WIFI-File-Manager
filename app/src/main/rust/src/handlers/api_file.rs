use std::path::Path;
use rocket_seek_stream::SeekStream;

#[get("/api/file?<path>")]
pub fn api_file<'a>(path: String) -> std::io::Result<SeekStream<'a>> {
    let p = Path::new(path.as_str());
    SeekStream::from_path(p)
}