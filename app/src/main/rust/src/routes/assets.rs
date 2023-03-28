use crate::routes::utils::response_asset;
use crate::Store;

pub async fn home(
    store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    return response_asset("index.html", store).await;
}

pub async fn assets(
    name: String,
    store: Store) -> Result<impl warp::Reply, warp::Rejection> {
    return response_asset(name.as_str(), store).await;
}