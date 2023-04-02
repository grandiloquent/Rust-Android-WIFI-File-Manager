use rocket::response::content::RawJson;
use crate::util::get_file_list;

#[get("/api/files?<path>")]
pub fn api_files(path: String) -> RawJson<String> {
    RawJson(serde_json::to_string(&get_file_list(path, "/storage/emulated/0")).unwrap_or("".to_string()))
}
