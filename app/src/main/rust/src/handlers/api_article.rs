use std::error::Error;
use deadpool_postgres::{GenericClient, Object, Pool};
use tokio_postgres::types::{FromSql, Type};
use rocket::http::Status;
use rocket::State;

async fn get_articles(id: &str, conn: &Object) -> Result<Simple, postgres::Error> {
// https://docs.rs/tokio-postgres/latest/tokio_postgres/row/struct.Row.html
// https://docs.rs/tokio-postgres/latest/tokio_postgres/types/struct.Json.html
    conn.query_one("select * from _query_article_list($1)", &[&id])
        .await?
        .try_get(0)
}
async fn get_article(id: &str, conn: &Object) -> Result<Simple, postgres::Error> {
// https://docs.rs/tokio-postgres/latest/tokio_postgres/row/struct.Row.html
// https://docs.rs/tokio-postgres/latest/tokio_postgres/types/struct.Json.html
    conn.query_one("select * from _query_article($1)", &[&id])
        .await?
        .try_get(0)
}
#[get("/api/articles?<id>")]
pub async fn api_articles(id: Option<String>, pool: &State<Pool>) -> Result<String, Status> {
    match pool.get().await {
        Ok(conn) => {
            match get_articles(id.unwrap_or(String::default()).as_str(), &conn).await {
                Ok(v) => {
                    return match String::from_utf8(v.0) {
                        Ok(v) => Ok(v),
                        Err(_) => Err(Status::InternalServerError)
                    };
                }
                Err(error) => {
                    Err(Status::InternalServerError)
                }
            }
        }
        Err(error) => {
            Err(Status::InternalServerError)
        }
    }
}
#[get("/api/article?<id>")]
pub async fn api_article(id: Option<String>, pool: &State<Pool>) -> Result<String, Status> {
    match pool.get().await {
        Ok(conn) => {
            match get_article(id.unwrap_or(String::default()).as_str(), &conn).await {
                Ok(v) => {
                    return match String::from_utf8(v.0) {
                        Ok(v) => Ok(v),
                        Err(_) => Err(Status::InternalServerError)
                    };
                }
                Err(error) => {
                    Err(Status::InternalServerError)
                }
            }
        }
        Err(error) => {
            Err(Status::InternalServerError)
        }
    }
}
#[derive(Debug, PartialEq)]
struct Simple(Vec<u8>);

impl<'a> FromSql<'a> for Simple {
    fn from_sql(ty: &Type, raw: &[u8]) -> Result<Self, Box<dyn Error + Sync + Send>> {
        Vec::<u8>::from_sql(ty, raw).map(Simple)
    }

    fn accepts(ty: &Type) -> bool {
        true
    }
}