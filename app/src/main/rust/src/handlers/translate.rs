use reqwest::header::{HeaderMap, HeaderValue};
use rocket::http::Status;
use urlencoding::encode;

#[get("/api/trans?<q>&<to>")]
pub async fn trans(q: String, to: String) -> Result<String, Status> {
    let mut headers = HeaderMap::new();
    headers.insert("user-agent", HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"));
    // https://docs.rs/reqwest/latest/reqwest/
    let proxy = match reqwest::Proxy::http("http://127.0.0.1:10809") {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let c = match reqwest::Client::builder()
        .proxy(proxy)
        .default_headers(headers)
        .build() {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let r = match c
        .get(format!("http://translate.google.com/translate_a/single?client=gtx&sl=auto&tl={}&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q={}", to, encode(q.as_str())))
        .send()
        .await {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let v = match r
        .text()
        .await {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    Ok(v)
}