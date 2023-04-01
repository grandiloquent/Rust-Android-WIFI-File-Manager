use ndk::asset::AssetManager;
use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use crate::util::read_resource_file;

pub struct Cache {
    ass: AssetManager,
    data: Arc<RwLock<HashMap<String, String>>>,
}

impl Cache {
    pub fn new(ass: AssetManager) -> Cache {
        Cache {
            ass,
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    pub fn get(&self, key: &str) -> Option<String> {
        match self.data.write() {
            Ok(mut v) => {
                match v.get(key) {
                    None => {
                        match read_resource_file(&self.ass, key) {
                            Ok(value) => {
                                v.insert(key.to_string(), value.clone());
                                Some(value)
                            }
                            Err(_) => None
                        }
                    }
                    Some(v) => {
                        Some(v.to_string())
                    }
                }
            }
            Err(_) => {
                None
            }
        }
    }
}