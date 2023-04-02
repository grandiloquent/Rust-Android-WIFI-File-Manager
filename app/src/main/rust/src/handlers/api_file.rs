use std::path::Path;
use rocket::fs::NamedFile;

#[get("/api/file?<path>")]
pub async fn api_file(path: String) -> Option<NamedFile> {
    let p = Path::new(path.as_str());
    NamedFile::open(path).await.ok()
}