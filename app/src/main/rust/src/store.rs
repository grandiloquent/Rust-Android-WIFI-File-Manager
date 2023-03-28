use std::collections::HashMap;
use std::sync::Arc;
use ndk::asset::AssetManager;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct Store {
    pub cache: Arc<RwLock<HashMap<std::string::String, std::string::String>>>,
    pub ass: Arc<AssetManager>,
}
