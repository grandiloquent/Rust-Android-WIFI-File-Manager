use std::path::Path;
use rocket::http::Status;
use rocket::serde::json::serde_json;
use rocket::serde::{Serialize, Deserialize};
use diesel::{self, result::QueryResult, prelude::*};
use std::time::{SystemTime, UNIX_EPOCH};
use std::sync::Arc;
use crate::asset::Cache;
use crate::res::Asset;
mod schema {
    diesel::table! {
        notes(_id) {
            _id ->  Nullable<Integer>,
            title ->  Text,
            content ->  Text,
            create_at ->  BigInt,
            update_at ->  BigInt,
        }
    }
    diesel::table! {
        snippet {
            id ->  Nullable<Integer>,
            prefix ->  Text,
            body ->  Text,
            language ->  Nullable<Text>,
            count ->  Nullable<Integer>,
            create_at ->  Integer,
            update_at ->  Integer,
        }
    }
}
use self::schema::notes;
use self::schema::notes::dsl::{notes as all_notes};
use self::schema::snippet;
use self::schema::snippet::dsl::{snippet as all_snippets};
use diesel::prelude::*;
use rocket::data::FromData;
use rocket::form::Form;
use rocket::State;
use rocket_seek_stream::SeekStream;
use crate::server::NotesConnection;
#[derive(Serialize, Deserialize, Queryable, Insertable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
#[table_name = "notes"]
pub struct Notes {
    pub _id: Option<i32>,
    pub title: String,
    pub content: String,
    #[serde(skip_deserializing, skip_serializing)]
    pub create_at: i64,
    #[serde(skip_deserializing, skip_serializing)]
    pub update_at: i64,
}
#[derive(Serialize, Queryable)]
pub struct Note {
    pub _id: Option<i32>,
    pub title: String,
    pub update_at: i64,
}
#[derive(Serialize, Deserialize, Queryable, Insertable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
#[table_name = "snippet"]
pub struct Snippet {
    pub id: Option<i32>,
    pub prefix: String,
    pub body: String,
    pub language: Option<String>,
    #[serde(skip_deserializing, skip_serializing)]
    pub count: Option<i32>,
    #[serde(skip_deserializing, skip_serializing)]
    pub create_at: i32,
    #[serde(skip_deserializing, skip_serializing)]
    pub update_at: i32,
}
impl Notes {
    pub async fn all(conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn insert(note: Notes, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(|c| {
            let t = Notes {
                _id: None,
                title: note.title,
                content: note.content,
                create_at: (get_epoch_ms() / 1000) as i64,
                update_at: (get_epoch_ms() / 1000) as i64,
            };
            diesel::insert_into(notes::table).values(&t).execute(c)
        }).await
    }
    pub async fn search(needle: String, conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .filter(notes::title.like(needle))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn like(needle: String, conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .filter(notes::content.like(needle))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn query_content(id: i32, conn: &NotesConnection) -> QueryResult<String> {
        conn.run(move |c| {
            let v = notes::table.filter(notes::_id.eq(&id))
                .get_result::<Notes>(c);
            return match v {
                Ok(v) => {
                    Ok(v.title + "\n\n" + &v.content)
                }
                Err(err) => {
                    Ok(String::new())
                }
            };
        }).await
    }
    pub async fn update(v: Notes, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(move |c| {
            let size = (get_epoch_ms() / 1000) as i64;
            let updated_notes = diesel::update(notes::table.filter(notes::_id.eq(v._id)));
            updated_notes.set((
                notes::title.eq(v.title.as_str()),
                notes::content.eq(v.content.as_str()),
                notes::update_at.eq(&size))
            ).execute(c)
        }).await
    }
}
fn get_epoch_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
}
impl Snippet {
    pub async fn all(conn: &NotesConnection) -> QueryResult<Vec<String>> {
        conn.run(|c| {
            snippet::table
                .select(snippet::prefix)
                .order(snippet::update_at.desc()).load::<String>(c)
        }).await
    }
    pub async fn insert(snippet: Snippet, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(|c| {
            let v = snippet::table.filter(snippet::prefix.eq(&snippet.prefix)).get_result::<Snippet>(c);
            match v {
                Ok(v) => {
                    let size = (get_epoch_ms() / 1000) as i32;
                    let updated_snippet = diesel::update(snippet::table.filter(snippet::prefix.eq(v.prefix)));
                    updated_snippet.set((snippet::body.eq(snippet.body.as_str()),
                                         snippet::update_at.eq(&size))
                    ).execute(c);
                    Ok(v.id.unwrap() as usize)
                }
                Err(err) => {
                    let t = Snippet {
                        id: None,
                        prefix: snippet.prefix,
                        body: snippet.body,
                        language: snippet.language,
                        count: Some(0),
                        create_at: (get_epoch_ms() / 1000) as i32,
                        update_at: (get_epoch_ms() / 1000) as i32,
                    };
                    diesel::insert_into(snippet::table).values(&t).execute(c)
                }
            }
        }).await
    }
    pub async fn delete_with_prefix(prefix: String, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(move |c| diesel::delete(snippet::table)
            .filter(snippet::prefix.eq(&prefix))
            .execute(c))
            .await
    }
    pub async fn query_body(prefix: String, conn: &NotesConnection) -> QueryResult<String> {
        conn.run(move |c| {
            let v = snippet::table.filter(snippet::prefix.eq(&prefix)).get_result::<Snippet>(c);
            return match v {
                Ok(v) => {
                    let updated_snippet = diesel::update(snippet::table.filter(snippet::id.eq(v.id)));
                    updated_snippet.set(snippet::count.eq(v.count.unwrap_or(0) + 1)).execute(c);
                    Ok(v.body)
                }
                Err(err) => {
                    Ok(String::new())
                }
            };
        }).await
    }
}
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