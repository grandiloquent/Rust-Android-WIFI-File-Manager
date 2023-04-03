use rocket::form::Form;
use rocket::fs::TempFile;

#[derive(FromForm)]
pub struct UploadData<'f> {
    key: Option<String>,
    data: TempFile<'f>,
}

#[post("/upload", data = "<form>")]
pub async fn upload(mut form: Form<UploadData<'_>>) -> std::io::Result<()> {
    log::error!("Uploading {}",form.into_inner().key.unwrap());
    //form.upload.persist_to("/tmp/complete/file.txt").await?;
    Ok(())
}