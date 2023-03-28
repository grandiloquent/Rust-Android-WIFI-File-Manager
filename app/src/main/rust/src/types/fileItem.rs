use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FileItem {
    pub path: String,
    pub is_directory: bool,
}