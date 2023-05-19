use crate::server::Database;

use rocket::http::Status;
use rusqlite::{params, Connection};

use std::time::SystemTime;
use std::time::UNIX_EPOCH;


use rocket::State;
use std::sync::Arc; 
#[get("/fav/insert?<path>")]
pub fn fav_insert(path: String, db: &State<Arc<Database>>) -> Result<String, Status> {
    let id: u32 = match db.0.lock().unwrap().query_row(
        "select id from favorite where path = ?",
        &[&path.as_str()],
        |r| {
            return Ok(r.get(0).unwrap());
        },
    ) {
        Ok(id) => id,
        Err(err) => 0,
    };
    if id == 0 {
        db.0.lock().unwrap().execute(
            "insert into favorite (path,create_at,update_at) values(?,?,?)",
            params![&path, get_epoch_secs(), get_epoch_secs()],
        );
    }
    return Err(Status::InternalServerError);
}
fn get_epoch_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
