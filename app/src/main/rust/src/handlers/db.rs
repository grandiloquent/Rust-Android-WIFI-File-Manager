use std::path::Path;
use crate::server::NotesConnection;
use rocket::http::Status;
use rocket::serde::json::serde_json;
use rocket::serde::{Serialize, Deserialize};
use std::sync::Arc;
use crate::asset::Cache;
use crate::res::Asset;

use diesel::prelude::*;
use rocket::data::FromData;
use rocket::form::Form;
use rocket::State;
use crate::data::notes::{Note, Notes};
use crate::data::snippet::Snippet;
use crate::data::statistics::Statistics;

#[get("/api/note?<id..>")]
pub async fn get_notes(id: Option<i32>, conn: NotesConnection) -> Result<String, Status> {
    match id {
        None => {
            match Notes::all(&conn).await {
                Ok(v) => {
                    Ok(serde_json::to_string::<Vec<Note>>(&v).unwrap())
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
        Some(v) => {
            match Notes::query_content(v, &conn).await {
                Ok(v) => {
                    Ok(v)
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
    }
}

#[get("/api/note/search?<q>")]
pub async fn search_notes(q: String, conn: NotesConnection) -> Result<String, Status> {
    match Notes::search(q, &conn).await {
        Ok(v) => {
            Ok(serde_json::to_string::<Vec<Note>>(&v).unwrap())
        }
        Err(e) => {
            Err(Status::InternalServerError)
        }
    }
}

#[get("/api/note/like?<q>")]
pub async fn like_notes(q: String, conn: NotesConnection) -> Result<String, Status> {
    match Notes::like(q, &conn).await {
        Ok(v) => {
            Ok(serde_json::to_string::<Vec<Note>>(&v).unwrap())
        }
        Err(e) => {
            Err(Status::InternalServerError)
        }
    }
}

#[post("/api/note/insert?<id..>", data = "<note_form>")]
pub async fn insert_note(id: Option<i32>, note_form: String, conn: NotesConnection) -> Result<String, Status> {
    match id {
        None => {
            match serde_json::from_str::<Notes>(&note_form) {
                Ok(v) => {
                    if let Err(e) = Notes::insert(v, &conn).await {
                        println!("{}", e);
                        return Err(Status::InternalServerError);
                    }
                }
                Err(e) => {
                    println!("{}", e);
                    return Err(Status::InternalServerError);
                }
            }
        }
        Some(_id) => {
            match serde_json::from_str::<Notes>(&note_form) {
                Ok(mut v) => {
                    v._id = Some(_id);
                    Notes::update(v, &conn).await;
                }
                Err(e) => {
                    println!("{}", e);
                    return Err(Status::InternalServerError);
                }
            }
        }
    }
    Ok("Success".to_string())
}

#[get("/api/snippet?<prefix..>")]
pub async fn get_snippet(prefix: Option<String>, conn: NotesConnection) -> Result<String, Status> {
    match prefix {
        None => {
            match Snippet::all(&conn).await {
                Ok(v) => {
                    Ok(serde_json::to_string::<Vec<String>>(&v).unwrap())
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
        Some(v) => {
            match Snippet::query_body(v, &conn).await {
                Ok(v) => {
                    Ok(v)
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
    }
}

#[post("/api/snippet/insert?<id..>", data = "<snippet_form>")]
pub async fn insert_snippet(id: Option<i32>, snippet_form: String, conn: NotesConnection) -> Result<String, Status> {
    match id {
        None => {
            match serde_json::from_str::<Snippet>(&snippet_form) {
                Ok(v) => {
                    if let Err(e) = Snippet::insert(v, &conn).await {
                        println!("{}", e);
                        return Err(Status::InternalServerError);
                    }
                }
                Err(e) => {
                    println!("{}", e);
                    return Err(Status::InternalServerError);
                }
            }
        }
        Some(_) => {}
    }
    Ok("Success".to_string())
}

#[get("/api/snippet/delete?<prefix>")]
pub async fn delete_snippet(prefix: String, conn: NotesConnection) -> Result<String, Status> {
    if let Err(e) = Snippet::delete_with_prefix(prefix, &conn).await {
        println!("{}", e);
        return Err(Status::InternalServerError);
    }
    Ok("Success".to_string())
}

#[get("/notes/notes")]
pub fn get_notes_page<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("notes/notes.html") {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: "text/html; charset=utf8",
            }
        }
    }
}
#[get("/api/statistics?<id..>")]
pub async fn get_statistics(id:Option<i32>,conn: NotesConnection) -> Result<String, Status> {
    match id {
        None => {
            match Statistics::all(&conn).await {
                Ok(v) => {
                    Ok(serde_json::to_string(&v).unwrap())
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
        Some(v) => {
            match Statistics::update(v,&conn).await {
                Ok(v) => {
                    Ok(serde_json::to_string(&v).unwrap())
                }
                Err(e) => {
                    Err(Status::InternalServerError)
                }
            }
        }
    }
}