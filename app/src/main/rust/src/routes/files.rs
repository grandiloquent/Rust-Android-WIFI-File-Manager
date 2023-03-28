use std::collections::HashMap;
use std::fs;
use urlencoding::decode;
use crate::FileItem;

pub async fn files(
    params: HashMap<String, String>) -> Result<impl warp::Reply, warp::Rejection> {
    let mut path = params.get("path").unwrap_or(&"/storage/emulated/0".to_string()).to_string();
    if path.is_empty() {
        path = "/storage/emulated/0".to_string();
    } else {
        path = decode(path.as_str()).unwrap().to_string();
    }
    let entries = fs::read_dir(path).unwrap()
        .map(|res| res.map(|e| {
            FileItem {
                path: e.path().display().to_string(),
                is_directory: e.file_type().unwrap().is_dir(),
            }
        }))
        .collect::<Result<Vec<_>, std::io::Error>>().unwrap();
    return Ok(warp::reply::json(&entries));
}